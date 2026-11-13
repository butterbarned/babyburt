"use strict";

const accounts = require("./accounts.js");
const achievements = require("./achievements.js");
const defpacks = require("./defpacks.js");
const limits = require("./limits.js");
const wearRules = require("./wearrules.js");
const {CURRENCIES, MAX_ITEMS, MAX_WORN, activeAvatar, addClothing, sendClothingAdded, sendClothingRemoved, resolvePurchase} = require("./player.js");

// clothing: buying, wearing and recycling (client side: ItemXtCommManager).

const DEF_ITEM = 1000;
const DEF_DIAMOND = 1054;
const DEF_COMBINED_LIST = 1060;
const DEF_CURRENCY_EXCHANGE = 1051;
const SHOP_TYPES = [DEF_ITEM, DEF_DIAMOND, DEF_COMBINED_LIST]; // kinds of shop that sell clothing
const TYPE_CLOTHING = "1";
const LAYER_PATTERN = "2";
const LAYER_EYES = "3";
const MAX_RECYCLED_AT_ONCE = 500;
const MAX_USED_AT_ONCE = 200; // pieces put on or taken off in one message
const RECYCLE_FRACTION = 0.3; // matches recyclePercentage sent at login

module.exports = ({others, sendItemList}) => {
  // ItemXtCommManager.itemBuyResponse: [status, shopId, newAmount, currencyType]
  const buyFailed = (session, shopId) => session.sendXt("ib", -1, 0, shopId, "", 0);
  // each layer order saved is passed on to everyone in the room (xlo)
  const layerOrderLimit = limits.limiter(30, 60000);
  // how long an "xlo" counts as part of the editor's save that follows it
  const ORDER_BEFORE_MS = 10000;

  return {
    // the avatar editor's layers panel (swf-src/AvatarLayersPanel.as), on
    // closing the editor: [count, (def, inv)...], the active animal's
    // clothes bottom first, or count 0 for the game's own order. it is kept
    // as avatar.layerOrder (inventory ids the player owns; lib/player.js,
    // sendLayerOrder) and everyone else in the room is told, with what the
    // animal wears. it comes before the editor's "iu": pieces just put on
    // may be named.
    xlo(session, roomId, params) {
      const {account} = session;
      const count = Number(params[0]);
      const fields = params.slice(1).map(Number);
      if (!Number.isInteger(count) || count < 0 || count > MAX_WORN || fields.length !== count * 2
        || !fields.every(Number.isInteger) || layerOrderLimit.blocked(account.username)) {
        return;
      }
      layerOrderLimit.record(account.username);
      const avatar = activeAvatar(account);
      const owned = new Set(account.items.map(item => item.inv));
      const order = [];
      for (let index = 0; index < count; index++) {
        const inv = fields[index * 2 + 1];
        if (owned.has(inv) && !order.includes(inv)) {
          order.push(inv);
        }
      }
      // the order before, for "!outfit undo": the editor sends this just
      // before the clothes it changed ("iu" keeps both)
      session.orderBefore = {avInvId: avatar.avInvId, at: Date.now(), order: Array.isArray(avatar.layerOrder) ? [...avatar.layerOrder] : null};
      // empty: the game's own order, still told (lib/player.js)
      avatar.layerOrder = order;
      accounts.save(account);
      for (const other of others(session)) {
        sendItemList(other, session, false);
      }
    },

    // shop.requestItemBuy: [shopId, 1, defId, colorIndex, isDiamondItem,
    // denItemInvIdx, username]. for an item priced in diamonds defId is its
    // diamond def's id.
    ib(session, roomId, [shopId, , defId, colorIndex, isDiamondItem]) {
      const {account} = session;
      const purchase = resolvePurchase(defId, isDiamondItem === "1", "clothing", id => {
        const own = defpacks.itemDef(id);
        return {cost: own ? Number(own.value) : 0, currencyType: own ? Number(own.currencyType) : -1};
      });
      const def = purchase && defpacks.itemDef(purchase.defId);
      const colors = def ? String(def.colors).split(",") : [];
      const currency = purchase && CURRENCIES[purchase.currencyType];
      // only clothing bought with a single currency is supported; combined
      // costs are refused.
      if (!SHOP_TYPES.includes(defpacks.listType(shopId)) || !def || def.type !== TYPE_CLOTHING
        || !currency || !/^\d{1,3}$/.test(colorIndex) || colors[colorIndex] === undefined || account.items.length >= MAX_ITEMS
        || (account.currency[currency] || 0) < purchase.cost) {
        buyFailed(session, shopId);
        return;
      }
      account.currency[currency] -= purchase.cost;
      achievements.currencyChanged(account, currency, -purchase.cost);
      achievements.add(account, achievements.VARS.clothesBought);
      const item = addClothing(account, def.id, colors[colorIndex]);
      accounts.save(account);
      sendClothingAdded(session, item);
      session.sendXt("ib", -1, 1, shopId, account.currency[currency], purchase.currencyType);
    },

    // ItemXtCommManager.requestItemUse: [onCount, offCount, ...invIdxOn, ...invIdxOff]
    // for the animal in use. eyes and patterns are sent as minus their def id.
    iu(session, roomId, params) {
      const {account} = session;
      const onCount = Number(params[0]);
      const offCount = Number(params[1]);
      const ids = params.slice(2).map(Number);
      if (!Number.isInteger(onCount) || !Number.isInteger(offCount) || onCount < 0 || offCount < 0
        || ids.length !== onCount + offCount || ids.length > MAX_USED_AT_ONCE || !ids.every(Number.isInteger)) {
        session.sendXt("iu", -1, 0);
        return;
      }
      const avatar = activeAvatar(account);
      // for "!outfit undo" (lib/commands.js).
      // with the order before: an editor that changed it sent "xlo" just now
      const before = session.orderBefore;
      delete session.orderBefore;
      const orderBefore = before && before.avInvId === avatar.avInvId && Date.now() - before.at < ORDER_BEFORE_MS ? before.order
        : (Array.isArray(avatar.layerOrder) ? [...avatar.layerOrder] : null);
      account.outfitUndo = {avInvId: avatar.avInvId, items: account.items.filter(item => item.on.includes(avatar.avInvId)).map(item => item.inv),
        order: orderBefore};
      // returns the item's def id when the change was one this player can make.
      const setWorn = (invIdx, worn) => {
        if (invIdx < 0) {
          const def = defpacks.itemDef(-invIdx);
          if (def && def.layerId === LAYER_EYES && worn) {
            avatar.eyes = -invIdx;
          }
          else if (def && def.layerId === LAYER_PATTERN && (worn || avatar.pattern === -invIdx)) {
            avatar.pattern = worn ? -invIdx : 0;
          }
          return def ? -invIdx : null;
        }
        const item = account.items.find(candidate => candidate.inv === invIdx);
        if (item) {
          // The client flag only makes the control gray. Never trust it: a
          // crafted iu packet or a stale client must not bypass a staff rule.
          // Check before changing `on`, so a refused request cannot take off
          // an otherwise valid item as a side effect.
          if (worn && !wearRules.mayWear(item.def, avatar.type)) {
            return null;
          }
          item.on = item.on.filter(avInvId => avInvId !== avatar.avInvId);
          // no more than MAX_WORN on one animal: what is over stays off.
          if (worn && account.items.filter(candidate => candidate.on.includes(avatar.avInvId)).length >= MAX_WORN) {
            return null;
          }
          if (worn) {
            item.on.push(avatar.avInvId);
          }
        }
        return item ? item.def : null;
      };
      const off = ids.slice(onCount).filter(invIdx => setWorn(invIdx, false) !== null);
      const on = ids.slice(0, onCount).map(invIdx => [invIdx, setWorn(invIdx, true)]).filter(([, def]) => def !== null);
      accounts.save(account);
      // ItemXtCommManager.itemUseResponse
      session.sendXt("iu", -1, 1);
      // the reply only closes the editor. the animal in the room is redrawn
      // from this: itemsChangedListResponse, "3" = what is worn changed,
      // [3, inUse, perUserAvId, username, colour, onCount, offCount,
      // (invIdx, defId)..., offInvIdx...]. without it the player goes on
      // seeing the old outfit until the next room.
      session.sendXt("il", -1, 3, 1, avatar.perUserAvId, account.username, 0, on.length, off.length, ...on.flat(), ...off);
      for (const other of others(session)) {
        sendItemList(other, session, false);
      }
    },

    // shop.requestCurrencyExchange: [shopId, exchangeDefId], one of the deals
    // in the currency exchange defPack (gems for tickets, diamonds for gems).
    // the reply (currencyExchangeResponse -> Shop.confirmPurchase) is
    // [status, new amount of the currency paid with]; the currency received
    // gets its own update.
    ce(session, roomId, [shopId, defId]) {
      const {account} = session;
      const def = defpacks.exchangeDef(defId);
      const paid = def && CURRENCIES[def.costType];
      const received = def && CURRENCIES[def.resultType];
      if (defpacks.listType(shopId) !== DEF_CURRENCY_EXCHANGE || !paid || !received || (account.currency[paid] || 0) < def.cost) {
        session.sendXt("ce", -1, 0, 0);
        return;
      }
      account.currency[paid] -= def.cost;
      account.currency[received] = (account.currency[received] || 0) + def.result;
      achievements.currencyChanged(account, paid, -def.cost);
      achievements.currencyChanged(account, received, def.result);
      accounts.save(account);
      // ItemXtCommManager.currencyUpdateResponse: [currencyType, newAmount, reason]
      session.sendXt("cu", -1, def.resultType, account.currency[received], 0);
      session.sendXt("ce", -1, 1, account.currency[paid]);
    },

    // ItemXtCommManager.requestItemRecycle: [invIdx, ...]. the reply
    // (itemRecycleResponse) is [count, newGemTotal, ...recycledInvIdx], and
    // the recycling window then waits, behind its spinner, for the item
    // list to change (ItemXtCommManager.checkIlCallbacks).
    ir(session, roomId, params) {
      const {account} = session;
      const recycled = [];
      for (const invIdx of new Set(params.slice(0, MAX_RECYCLED_AT_ONCE).map(Number))) {
        const index = account.items.findIndex(item => item.inv === invIdx);
        if (index === -1) {
          continue;
        }
        const def = defpacks.itemDef(account.items[index].def);
        const refund = def ? Number(def.recycleValue) || Math.floor(Number(def.value) * RECYCLE_FRACTION) : 0;
        if (def && def.currencyType === "0") {
          account.currency.gems = (account.currency.gems || 0) + refund;
          achievements.currencyChanged(account, "gems", refund);
        }
        account.items.splice(index, 1);
        recycled.push(invIdx);
      }
      accounts.save(account);
      session.sendXt("ir", -1, recycled.length, account.currency.gems || 0, ...recycled);
      if (recycled.length) {
        sendClothingRemoved(session, recycled);
        for (const other of others(session)) {
          sendItemList(other, session, false);
        }
      }
    },
  };
};
