"use strict";

const {logText} = require("./logtext.js");
const accounts = require("./accounts.js");
const achievements = require("./achievements.js");
const config = require("../config.js");
const defpacks = require("./defpacks.js");
const wearRules = require("./wearrules.js");
const epicDens = require("./epicdens.js");
const masterpieces = require("./masterpieces.js");
const denPrefabs = require("./denprefabs.js");
const limits = require("./limits.js");
const {CURRENCIES, MAX_DEN_ITEMS, MAX_WORN, hasRoom, activeAvatar, resolvePurchase, isUint} = require("./player.js");

// den items: owning, placing and recycling furniture (client side:
// DenXtCommManager, DenItemHolder, DenEditor).

const MAX_DENS = 200;
const MAX_SAVED_AT_ONCE = 1000; // den items in one save: as many as a den holds (gui.DenEditor)
const MAX_RECYCLED_AT_ONCE = 500;
const DEF_DEN_ROOM = 1040;

// den privacy (BuddyCard.onDenPrivacyResponse)
const DEN_LOCKED = 0;
const DEN_BUDDIES_ONLY = 1;
const DEN_OPEN = 2;

// loadRoom's roomType for a den (DenXtCommManager.denChangeResponse)
const ROOM_TYPE_DEN = 2;

const activeDen = account => account.dens.find(den => den.inv === account.activeDen) || account.dens[0];

const canEnter = (owner, visitor) => owner === visitor || owner.denPrivacy === DEN_OPEN
  || (owner.denPrivacy === DEN_BUDDIES_ONLY && owner.buddies.includes(visitor.username.toLowerCase()));
const RECYCLE_FRACTION = 0.3; // matches recyclePercentage sent at login
const FIELDS_PER_SAVED_ITEM = 17;
const REF_DEN_ITEM = "0";
const REF_PET = "1";
const PET_CATEGORY = 1; // DenItem.getInWorldId for pets (sort category 99)
const MAX_CATEGORY = 1000;
const CURRENCY_DIAMONDS = 3;

// mannequins: den items (special type 4) that stand as an animal in clothes
// of the owner's. what one wears is kept on the den item as `mannequin`:
// {colors: [base, pattern, eyes], pattern, eyes, pieces: [inv...], ordered}.
// A 0 colour or def means the animal type's own (MannequinData.setupBodMods).
// `pieces` are inventory ids of clothing, as many as an animal may wear (up
// to three to a layer, MAX_WORN in all, as an animal may); with `ordered`
// they are in the order the owner put them in the avatar editor's layers
// panel, the bottom first, otherwise the game's own order applies. a
// mannequin saved before that kept `worn: [tail, leg, back, neck, head]`,
// one piece to a place; mannequinPieceInvs reads either.
// the clothes stay in the owner's inventory and may leave it; a mannequin
// simply stops wearing what is no longer there.
const SPECIAL_MANNEQUIN = "4";
// the five places the official client gives a mannequin (MannequinData.updateLayer).
const MANNEQUIN_SLOT_LAYERS = [["4"], ["5"], ["6"], ["7"], ["8", "9", "10"]];
const MANNEQUIN_LAYERS = MANNEQUIN_SLOT_LAYERS.flat();
const MAX_PER_LAYER = 3; // Avatar.accStateShowAccessory (swf-src/Avatar.as)
const LAYER_PATTERN = "2";
const LAYER_EYES = "3";

const isMannequin = item => (defpacks.denItemDef(item.def) || {}).specialType === SPECIAL_MANNEQUIN;

const mannequinAvatarType = item => Number((defpacks.denItemDef(item.def) || {}).mannequinAvatarDefId) || 0;

const mannequinOf = item => item.mannequin || {colors: [0, 0, 0], pattern: 0, eyes: 0, pieces: [], ordered: false};

const mannequinBody = ({colors, pattern, eyes}) => [colors[0], colors[1], pattern, colors[2], eyes];

// the inventory ids a mannequin wears, in either way it was kept.
const mannequinPieceInvs = mannequin => (Array.isArray(mannequin.pieces) ? mannequin.pieces
  : (Array.isArray(mannequin.worn) ? mannequin.worn.map(Number).filter(Boolean) : []));

// of `invs`, the clothing of `owner`'s a mannequin of this kind may wear,
// in the same order: what the owner still has, made for the mannequin's
// animal, each piece once, three to a layer and no more than MAX_WORN.
const wearablePieces = (owner, item, invs) => {
  const type = mannequinAvatarType(item);
  const byInv = new Map(owner.items.map(piece => [piece.inv, piece]));
  const perLayer = {};
  const pieces = [];
  for (const inv of invs) {
    const piece = byInv.get(Number(inv));
    const def = piece && defpacks.itemDef(piece.def);
    if (!def || pieces.includes(piece) || !MANNEQUIN_LAYERS.includes(def.layerId) || (type && !wearRules.mayWear(piece.def, type))
      || (perLayer[def.layerId] || 0) >= MAX_PER_LAYER || pieces.length >= MAX_WORN) {
      continue;
    }
    perLayer[def.layerId] = (perLayer[def.layerId] || 0) + 1;
    pieces.push(piece);
  }
  return pieces;
};

// the clothing a mannequin of `owner`'s wears.
const mannequinPieces = (owner, item) => wearablePieces(owner, item, mannequinPieceInvs(mannequinOf(item)));

// what a client built before mannequins wore more is shown: one piece in
// each of the five places, the first there (undefined for an empty place).
const fiveSlots = pieces => MANNEQUIN_SLOT_LAYERS.map(layers => pieces.find(piece => layers.includes(defpacks.itemDef(piece.def).layerId)));
const mannequinClothes = (owner, item) => fiveSlots(mannequinPieces(owner, item));

// for the owner's own list (MannequinData.setupDataInvIdsOnly): the body,
// then the five inventory ids.
const mannequinOwnFields = (owner, item) =>
  (isMannequin(item) ? [...mannequinBody(mannequinOf(item)), ...mannequinClothes(owner, item).map(piece => (piece ? piece.inv : 0))] : []);

// for whoever looks at the den (setupDataFull): the body, then for each
// slot the clothing's def id and, when there is one, its colour and
// inventory id.
const mannequinShownFields = (owner, item) =>
  (isMannequin(item) ? [...mannequinBody(mannequinOf(item)), ...mannequinClothes(owner, item).flatMap(piece => (piece ? [piece.def, piece.color, piece.inv] : [0]))] : []);

// the field after a den item's in "di" and "ds", which the client reads
// with int() (a den store's id; always 0 here). a mannequin's carries all
// it wears: "0~" + ("o" when ordered) + "~" + "def_colour_inv" joined by
// ".", the bottom first (swf-src/MannequinData.as, readPieces). int() of
// that is still 0 to a client built before.
const mannequinTail = (owner, item) => {
  if (!isMannequin(item)) {
    return 0;
  }
  const pieces = mannequinPieces(owner, item);
  const ordered = Boolean(mannequinOf(item).ordered) && pieces.length > 0;
  return `0~${ordered ? "o" : ""}~${pieces.map(piece => `${piece.def}_${piece.color}_${piece.inv}`).join(".")}`;
};

// what the den editor sent for one mannequin, checked: [baseColor,
// patternColor, patternDefId, eyeColor, eyeDefId, tail, leg, back, neck,
// head]. a client that knows mannequins wear more sends the head as
// "head~flag~inv.inv..." (flag "o" when the order is the owner's own, the
// pieces bottom first), and those pieces are what it wears. one built
// before sends only the five: when they are what it was shown, the
// mannequin keeps all it wears (an old client moving it about strips
// nothing); otherwise it wears those five. null when any of it is not a
// whole number in range.
const readMannequin = (account, item, fields) => {
  if (fields.length !== 10) {
    return null;
  }
  let listed = null;
  let ordered = false;
  const extra = String(fields[9]).split("~");
  if (extra.length > 1) {
    const invs = extra.length === 3 && extra[2] ? extra[2].split(".", MAX_WORN + 1) : [];
    if (extra.length !== 3 || !["", "o"].includes(extra[1]) || invs.length > MAX_WORN || !invs.every(isUint)) {
      return null;
    }
    fields = [...fields.slice(0, 9), extra[0]];
    listed = invs.map(Number);
    ordered = extra[1] === "o";
  }
  if (!fields.every(isUint)) {
    return null;
  }
  const [base, patternColor, pattern, eyeColor, eyes, ...worn] = fields.map(Number);
  const bodyPart = (defId, layer) => (defId && (defpacks.itemDef(defId) || {}).layerId === layer ? defId : 0);
  let pieces;
  if (listed) {
    pieces = wearablePieces(account, item, listed).map(piece => piece.inv);
  }
  else {
    const five = worn.map((inv, slot) => {
      const piece = inv ? wearablePieces(account, item, [inv])[0] : undefined;
      return piece && MANNEQUIN_SLOT_LAYERS[slot].includes(defpacks.itemDef(piece.def).layerId) ? inv : 0;
    });
    const shown = mannequinClothes(account, item).map(piece => (piece ? piece.inv : 0));
    if (item.mannequin && five.every((inv, slot) => inv === shown[slot])) {
      pieces = mannequinPieces(account, item).map(piece => piece.inv);
      ordered = Boolean(item.mannequin.ordered);
    }
    else {
      pieces = five.filter(Boolean);
    }
  }
  return {
    colors: [base, patternColor, eyeColor],
    pattern: bodyPart(pattern, LAYER_PATTERN),
    eyes: bodyPart(eyes, LAYER_EYES),
    pieces,
    ordered: ordered && pieces.length > 0,
  };
};

// where an item stands: `spots` has a place for each den it is in, by the
// den's inventory id ({cat, x, y, flip}), so one item can be in several dens
// at once. the client is only ever told about the den in use.
const spotOf = (item, den) => (item.spots ? item.spots[den] : undefined);
const isPlaced = item => Boolean(item.spots) && Object.keys(item.spots).length > 0;
const itemsInDen = account => account.denItems.filter(item => spotOf(item, account.activeDen));

// the pets standing in the owner's den in use: `inDen` is {den, x, y, flip}.
const petsInDen = account => account.pets.filter(pet => pet.inDen && pet.inDen.den === account.activeDen);

// DenXtCommManager.denItemsResponse: [activeDenIdx, count, petCount, (invIdx,
// defId, placed, version, approved, imageId, creatorDbId, creatorUuid,
// [mannequin], denStoreInvId)..., petInvIdx...]. "placed" is the category the
// den editor gave the item (DenItem.getInWorldId) in the den in use, 0 when
// it is not placed there. the three after "approved" are a masterpiece's
// (lib/masterpieces.js); one not approved yet the client keeps out of dens,
// trades and the recycler.
const sendDenItems = session => {
  const {account} = session;
  const {denItems} = account;
  const pets = petsInDen(account);
  session.sendXt("di", -1, account.activeDen, denItems.length, pets.length,
    ...denItems.flatMap(item => {
      const spot = spotOf(item, account.activeDen);
      return [item.inv, item.def, spot ? spot.cat || 1 : 0, item.version, masterpieces.itemApproved(item), ...masterpieces.itemFields(item),
        ...mannequinOwnFields(account, item), mannequinTail(account, item)];
    }),
    ...pets.map(pet => pet.inv));
};

// DenXtCommManager.denStateResponse: [itemCount, petCount, forceReload,
// (invIdx, defId, placed, x, y, version, flipped, userNameLink, imageId,
// creatorDbId, creatorUuid, [mannequin], ?)..., (invIdx, lBits, uBits, eBits,
// category, x, y, flipped, createdTs, personality, toy, food, name)...].
// forceReload makes the client finish a pending room change, so it is set
// when the den has just been entered.
const sendDenState = (session, room, forceReload = true) => {
  const owner = room.denOwner;
  const placed = itemsInDen(owner).filter(item => masterpieces.itemApproved(item));
  const pets = petsInDen(owner);
  session.sendXt("ds", room.id, placed.length, pets.length, forceReload ? 1 : 0,
    ...placed.flatMap(item => {
      const spot = spotOf(item, owner.activeDen);
      // Keep the editor's real placement category.  Sending every placed
      // object as category 1 made wall/floor items enter the wrong display
      // layer when a den was reloaded or another player visited.
      return [item.inv, item.def, spot.cat || 1, spot.x, spot.y, item.version, spot.flip, "", ...masterpieces.itemFields(item),
        ...mannequinShownFields(owner, item), mannequinTail(owner, item)];
    }),
    ...pets.flatMap(pet => [pet.inv, pet.lBits, pet.uBits, pet.eBits, PET_CATEGORY, pet.inDen.x, pet.inDen.y, pet.inDen.flip,
      pet.createdAt, pet.personality || 0, pet.toy || 0, pet.food || 0, pet.name]));
};

// adds a den item to an account; used by purchases, prizes and the item
// finder. null when the inventory is full.
const giveDenItem = (account, defId, version = 0) => {
  if (!hasRoom(account, "denItems")) {
    return null;
  }
  const item = {inv: account.nextInv++, def: Number(defId), version: Number(version) || 0, spots: {}};
  account.denItems.push(item);
  accounts.save(account);
  return item;
};

// puts every placed item back in the owner's inventory and empties the den
// on the screens of everyone inside it (DenXtCommManager.denEmptyResponse).
const clearDen = (owner, findOnline) => {
  // kept so that "!den undo" can put it back (lib/commands.js).
  const placed = itemsInDen(owner);
  if (placed.length) {
    owner.denUndo = {den: owner.activeDen, items: placed.map(item => ({def: item.def, version: item.version, ...spotOf(item, owner.activeDen)}))};
  }
  for (const item of placed) {
    delete item.spots[owner.activeDen];
  }
  for (const pet of petsInDen(owner)) {
    delete pet.inDen;
  }
  accounts.save(owner);
  const ownerSession = findOnline(owner.username);
  const room = ownerSession && ownerSession.room && ownerSession.room.denOwner === owner ? ownerSession.room : null;
  for (const session of room ? room.sessions : []) {
    session.sendXt("de", room.id);
  }
  if (ownerSession) {
    sendDenItems(ownerSession);
  }
};

// the room a player's den in use is: {base, defId, enviroType, roomType, secondaryDefId}.
const denRoom = owner => {
  const den = activeDen(owner);
  const base = defpacks.denRoomName(den.def) || defpacks.denRoomName(config.denDefId);
  const def = defpacks.roomDef(base);
  return {base, defId: Number(def.id), enviroType: Number(def.type), roomType: ROOM_TYPE_DEN, secondaryDefId: den.def};
};

// RoomXtCommManager.roomPropertiesResponse -> RoomManagerWorld.loadRoom
// (path, enviroType, roomType, secondaryDefId, zoom, roomDefId, customData)
const sendRoomProperties = (session, room) => {
  // customData is JSON the room is made with; made when asked for, so that
  // it is current (a function on the room, or nothing).
  const customData = room.customData ? JSON.stringify(room.customData()) : "";
  session.sendXt("rp", room.id, room.base, room.enviroType, room.roomType, room.secondaryDefId, 100, room.defId, customData);
};

// what may be in a den prefab: a den item the server knows, not a
// masterpiece (each is one of a kind).
const prefabItem = def => Boolean(defpacks.denItemDef(def)) && def !== masterpieces.DEN_ITEM;

const handlers = ({others, findOnline}) => {
  const inOwnDen = session => session.room && session.room.denOwner === session.account;
  // prefabs saved or copied: 20 a minute
  const prefabLimit = limits.limiter(20, 60000);

  // the den items of `items` ([def, version]...) the player has none of
  // free for the den in use (none, or not enough, of that item in that
  // colour, not standing in it) are added to their inventory, as "!den
  // copy" does; what the game no longer offers is left out. the den item
  // list ("di") comes first, then [cmd, 1, given, left out]. nothing is
  // given when it would not all fit.
  const giveMissing = (session, cmd, items) => {
    const {account} = session;
    const free = new Map();
    const keyOf = (def, version) => `${def}:${version}`;
    for (const item of account.denItems.filter(candidate => !spotOf(candidate, account.activeDen))) {
      free.set(keyOf(item.def, item.version), (free.get(keyOf(item.def, item.version)) || 0) + 1);
    }
    const missing = [];
    for (const [def, version] of items) {
      const left = free.get(keyOf(def, version)) || 0;
      if (left > 0) {
        free.set(keyOf(def, version), left - 1);
      }
      else {
        missing.push([def, version]);
      }
    }
    const givable = missing.filter(([def]) => defpacks.denItemIds().includes(def));
    if (!hasRoom(account, "denItems", givable.length)) {
      session.sendXt(cmd, -1, 0, `That needs ${givable.length} more den items, and your den items are too full. Recycle some first.`);
      return;
    }
    for (const [def, version] of givable) {
      giveDenItem(account, def, version);
    }
    if (givable.length) {
      sendDenItems(session);
    }
    session.sendXt(cmd, -1, 1, givable.length, missing.length - givable.length);
  };


  // DenXtCommManager.denListResponse: [count, (invId, denDefId)...]
  const sendDenList = session => {
    const {dens} = session.account;
    session.sendXt("dl", -1, dens.length, ...dens.flatMap(den => [den.inv, den.def]));
  };

  // A den room from a den shop, paid for in gems. the client asks for the
  // den list again by itself once the purchase is confirmed.
  // A den's inventory id is the slot it sits in on the den switcher (0 to
  // 199): the client asks for the slot it wants filled, keeps its den list
  // by that number and looks the new den up there when the purchase is
  // confirmed (DenSwitcher.purchasedDenRoomCallback).
  const freeSlot = (account, wanted) => {
    const taken = new Set(account.dens.map(den => den.inv));
    if (Number.isInteger(wanted) && wanted >= 0 && wanted < MAX_DENS && !taken.has(wanted)) {
      return wanted;
    }
    return Array.from({length: MAX_DENS}, (_, slot) => slot).find(slot => !taken.has(slot));
  };

  const buyDen = (session, defId, isDiamond, slot) => {
    const {account} = session;
    // den rooms priced in gems have no currency field of their own.
    const purchase = resolvePurchase(defId, isDiamond, "denRoom", id => ({cost: Number((defpacks.denRoomDef(id) || {}).cost) || 0, currencyType: 0}));
    const currency = purchase && CURRENCIES[purchase.currencyType];
    if (!purchase || !defpacks.denRoomDef(purchase.defId) || !defpacks.denRoomName(purchase.defId) || account.dens.length >= MAX_DENS
      || (account.currency[currency] || 0) < purchase.cost) {
      session.sendXt("db", -1, 0, "", 0, 0, 0);
      return;
    }
    account.currency[currency] -= purchase.cost;
    achievements.currencyChanged(account, currency, -purchase.cost);
    account.dens.push({inv: freeSlot(account, /^\d{1,3}$/.test(String(slot)) ? Number(slot) : NaN), def: purchase.defId});
    accounts.save(account);
    session.sendXt("db", -1, 1, account.currency[currency], 0, purchase.currencyType, 0);
    sendDenList(session);
  };

  // A painting framed: the Art Studio's purchase (lib/masterpieces.js, step
  // 3), paid with two diamonds or with a Masterpiece Token from the
  // inventory. the reply's last field is the new item's inventory id.
  const buyMasterpiece = (session, defId, frame, withToken, paintingId) => {
    const {account} = session;
    const diamond = defpacks.diamondDef(defId);
    const cost = diamond ? Number(diamond.cost) : 0;
    const token = account.denItems.find(item => item.def === masterpieces.TOKEN_DEN_ITEM);
    if (defId !== masterpieces.DIAMOND_DEF || !diamond || !masterpieces.claimable(account, paintingId, frame)
      || account.denItems.length >= MAX_DEN_ITEMS || (withToken ? !token : (account.currency.diamonds || 0) < cost)) {
      session.sendXt("db", -1, 0, "", 0, 0, 0);
      return;
    }
    if (withToken) {
      account.denItems.splice(account.denItems.indexOf(token), 1);
    }
    else {
      account.currency.diamonds -= cost;
      achievements.currencyChanged(account, "diamonds", -cost);
    }
    masterpieces.claim(paintingId, frame);
    const item = giveDenItem(account, masterpieces.DEN_ITEM, frame);
    item.image = String(paintingId);
    accounts.save(account);
    console.log(`[world] ${logText(account.username)} made masterpiece ${logText(item.image)}${logText(masterpieces.itemApproved(item) ? "" : " (waiting for review in the admin panel)")}`);
    session.sendXt("db", -1, 1, account.currency.diamonds || 0, 0, CURRENCY_DIAMONDS, item.inv);
    sendDenItems(session);
  };

  // den rooms recycled from the den switcher (DenSwitch.removeDen): never the
  // den in use, nor slot 0. what stood in one goes back to the inventory,
  // and a den bought for gems gives back the share den items do. the reply
  // is the same as for items.
  const recycleDens = (session, invList) => {
    const {account} = session;
    const recycled = [];
    for (const invIdx of new Set(String(invList).split(",", MAX_DENS).map(Number))) {
      const den = account.dens.find(candidate => candidate.inv === invIdx);
      if (!den || den.inv === 0 || den.inv === account.activeDen || account.dens.length <= 1) {
        continue;
      }
      account.dens.splice(account.dens.indexOf(den), 1);
      for (const item of account.denItems.filter(candidate => spotOf(candidate, den.inv))) {
        delete item.spots[den.inv];
      }
      for (const pet of account.pets.filter(candidate => candidate.inDen && candidate.inDen.den === den.inv)) {
        delete pet.inDen;
      }
      const refund = Math.floor(Number((defpacks.denRoomDef(den.def) || {}).cost || 0) * RECYCLE_FRACTION);
      account.currency.gems += refund;
      achievements.currencyChanged(account, "gems", refund);
      recycled.push(den.inv);
    }
    accounts.save(account);
    session.sendXt("dr", -1, recycled.length, account.currency.gems, ...recycled);
    // the switcher empties the slot itself; the items that come back need
    // the inventory's list.
    if (recycled.length) {
      sendDenItems(session);
    }
  };

  return {
    di(session) {
      sendDenItems(session);
    },

    // PlayerWallGui.setupMasterpieces and the like: [username] -> the
    // approved masterpieces that player has (denMasterpieceInventoryResponse:
    // [count, (defId, invIdx, version, approved, imageId, creatorDbId,
    // creatorUuid)...]).
    dmi(session, roomId, [username]) {
      const owner = accounts.byName(username);
      const hung = owner ? owner.denItems.filter(item => item.image && masterpieces.itemApproved(item)) : [];
      session.sendXt("dmi", -1, hung.length, ...hung.flatMap(item => [item.def, item.inv, item.version, "true", ...masterpieces.itemFields(item)]));
    },

    // MasterpiecePreview: [ownerName, paintingId] -> [who painted it]
    dmc(session, roomId, [, paintingId]) {
      const maker = masterpieces.creatorOf(paintingId);
      session.sendXt("dmc", -1, maker ? maker.username : "");
    },

    // DenXtCommManager.requestBuy: ["0" item | "-1" den room, shopId, defId,
    // version (items) or den slot (rooms), isDiamondItem, ...]. for something
    // priced in diamonds defId is its diamond def's id. the reply
    // (denBuyResponse) is [status, newAmount, ?, currencyType, ?].
    db(session, roomId, [kind, shopId, defId, version, isDiamondItem, isMasterpiece, withToken, paintingId]) {
      const {account} = session;
      if (kind === "-1") {
        buyDen(session, defId, isDiamondItem === "1", version);
        return;
      }
      if (kind === "0" && isMasterpiece === "1") {
        buyMasterpiece(session, Number(defId), Number(version), withToken === "1", paintingId);
        return;
      }
      const purchase = resolvePurchase(defId, isDiamondItem === "1", "denItem", id => {
        const own = defpacks.denItemDef(id);
        return {cost: own ? Number(own.cost) : 0, currencyType: own ? Number(own.currencyType) : -1};
      });
      const def = purchase && defpacks.denItemDef(purchase.defId);
      const currency = purchase && CURRENCIES[purchase.currencyType];
      // combined costs and special item types other than mannequins are refused.
      if (kind !== "0" || !def || !defpacks.denItemIds().includes(purchase.defId) || !currency
        || account.denItems.length >= MAX_DEN_ITEMS || (account.currency[currency] || 0) < purchase.cost) {
        session.sendXt("db", -1, 0, "", 0, 0, 0);
        return;
      }
      account.currency[currency] -= purchase.cost;
      achievements.currencyChanged(account, currency, -purchase.cost);
      achievements.add(account, achievements.VARS.denItemsBought);
      giveDenItem(account, purchase.defId, version);
      session.sendXt("db", -1, 1, account.currency[currency], 0, purchase.currencyType, 0);
      sendDenItems(session);
    },

    // DenXtCommManager.requestDenStateChange: [count, (refType, invIdx,
    // category, x, y, flipped, userNameLink, 10 mannequin fields)...]. the
    // category is DenItem.getInWorldId: 1 furniture, toys, plants and pets,
    // 2 wall items, 3 music, the room's denCatId floors and wallpapers; 0 not
    // placed. the reply (DenEditor.onDenSaveSet) lists the inventory ids
    // that were applied.
    ds(session, roomId, params) {
      const {account} = session;
      const count = Number(params[0]);
      if (!Number.isInteger(count) || count < 0 || count > MAX_SAVED_AT_ONCE || params.length !== 1 + count * FIELDS_PER_SAVED_ITEM) {
        session.sendXt("dss", -1);
        return;
      }
      const applied = [];
      const byInv = new Map(account.denItems.map(candidate => [candidate.inv, candidate]));
      const mannequins = account.denItems.filter(candidate => candidate.mannequin);
      const activePet = activeAvatar(account).petInvId;
      for (let i = 0; i < count; i++) {
        const [refType, invIdx, category, x, y, flip, , ...outfit] = params.slice(1 + i * FIELDS_PER_SAVED_ITEM, 1 + (i + 1) * FIELDS_PER_SAVED_ITEM);
        const cat = Number(category);
        if (![x, y, flip].every(value => Number.isInteger(Number(value))) || !Number.isInteger(cat) || Math.abs(cat) > MAX_CATEGORY) {
          continue;
        }
        const placed = cat !== 0;
        if (refType === REF_PET) {
          // the pet that follows its owner about is not put down (DenEditor says so).
          const pet = account.pets.find(candidate => candidate.inv === Number(invIdx));
          if (pet && !(placed && pet.inv === activePet)) {
            if (placed) {
              pet.inDen = {den: account.activeDen, x: Number(x), y: Number(y), flip: Number(flip)};
            }
            else if (pet.inDen && pet.inDen.den === account.activeDen) {
              delete pet.inDen;
            }
            applied.push(pet.inv);
          }
          continue;
        }
        const item = byInv.get(Number(invIdx));
        if (refType !== REF_DEN_ITEM || !item || (placed && !masterpieces.itemApproved(item))) {
          continue;
        }
        // only the den in use changes: the item stays wherever else it stands.
        item.spots = item.spots || {};
        if (placed) {
          item.spots[account.activeDen] = {cat, x: Number(x), y: Number(y), flip: Number(flip)};
        }
        else {
          delete item.spots[account.activeDen];
        }
        const mannequin = isMannequin(item) && readMannequin(account, item, outfit);
        if (mannequin) {
          // A piece of clothing is on one mannequin at a time.
          for (const other of mannequins) {
            if (other !== item && other.mannequin) {
              other.mannequin.pieces = mannequinPieceInvs(other.mannequin).filter(inv => !mannequin.pieces.includes(inv));
              delete other.mannequin.worn;
            }
          }
          if (!item.mannequin) {
            mannequins.push(item);
          }
          item.mannequin = mannequin;
        }
        applied.push(item.inv);
      }
      accounts.save(account);
      session.sendXt("dss", -1, ...applied);
      if (inOwnDen(session)) {
        for (const other of others(session)) {
          sendDenState(other, session.room, false);
        }
      }
    },

    // DenXtCommManager.requestRecycle: ["0" items | "-1" den rooms, "inv,inv,..."].
    // the reply (denRecycleResponse) is [count, newGemTotal, ...recycledInvIdx],
    // and the recycling window then waits for a den item list (its
    // recycleDiCallback) before it lets go of its spinner.
    dr(session, roomId, [kind, invList]) {
      const {account} = session;
      if (kind === "-1") {
        recycleDens(session, invList);
        return;
      }
      const recycled = [];
      for (const invIdx of kind === "0" ? new Set(String(invList).split(",", MAX_RECYCLED_AT_ONCE).map(Number)) : []) {
        const index = account.denItems.findIndex(item => item.inv === invIdx);
        if (index === -1 || !masterpieces.itemApproved(account.denItems[index])) {
          continue;
        }
        const def = defpacks.denItemDef(account.denItems[index].def);
        if (def && def.currencyType === "0") {
          const refund = Number(def.recycleValue) || Math.floor(Number(def.cost) * RECYCLE_FRACTION);
          account.currency.gems += refund;
          achievements.currencyChanged(account, "gems", refund);
        }
        account.denItems.splice(index, 1);
        recycled.push(invIdx);
      }
      accounts.save(account);
      session.sendXt("dr", -1, recycled.length, account.currency.gems, ...recycled);
      if (recycled.length) {
        sendDenItems(session);
      }
      if (recycled.length && inOwnDen(session)) {
        for (const other of others(session)) {
          sendDenState(other, session.room, false);
        }
      }
    },

    // DenXtCommManager.requestEmptyDen: the owner's own "clear den" button.
    de(session) {
      clearDen(session.account, findOnline);
      if (!inOwnDen(session)) {
        session.sendXt("de", -1);
      }
    },

    dl(session) {
      sendDenList(session);
    },

    // DenXtCommManager.requestDenChange: [denInvIdx]. the reply
    // (denChangeResponse: [denDefId, perUserAvId, petInvId]) makes the owner's
    // client load the new den; visitors are sent the new room as well.
    dc(session, roomId, [invIdx]) {
      const {account} = session;
      const den = account.dens.find(candidate => candidate.inv === Number(invIdx));
      if (!den) {
        return;
      }
      account.activeDen = den.inv;
      accounts.save(account);
      const avatar = activeAvatar(account);
      session.sendXt("dc", -1, den.def, avatar.perUserAvId, avatar.petInvId);
      // what is free and what is placed differs from den to den.
      sendDenItems(session);
      if (inOwnDen(session)) {
        const {room} = session;
        Object.assign(room, denRoom(account));
        for (const other of others(session)) {
          sendRoomProperties(other, room);
        }
        for (const occupant of room.sessions) {
          sendDenState(occupant, room);
        }
      }
    },

    // the "Epic Dens" list on the world map (denHighestResponse: [count,
    // name...]): today's showcase dens, see lib/epicdens.js.
    dh(session) {
      const names = epicDens.list();
      session.sendXt("dh", -1, names.length, ...names);
    },

    // ---- den prefabs (lib/denprefabs.js; the client's gui.DenPrefabs) ----
    // every answer is the asking command with -1, then 1 (done) or 0 and
    // the words to show.

    // the player's prefabs: [1, count, (id, name, itemCount, hasPicture, code)...]
    dpl(session) {
      const prefabs = denPrefabs.list(session.account);
      session.sendXt("dpl", -1, 1, prefabs.length, ...prefabs.flatMap(entry => [entry.id, entry.name, entry.count, entry.hasThumb ? 1 : 0, entry.code]));
    },

    // one prefab's items: [id] -> [1, id, name, count, (def, version, x, y, flip)...]
    dpo(session, roomId, [id]) {
      const entry = denPrefabs.get(session.account, id);
      if (!entry) {
        session.sendXt("dpo", -1, 0, "That prefab is not there any more.");
        return;
      }
      session.sendXt("dpo", -1, 1, entry.id, entry.name, entry.items.length, ...entry.items.flat());
    },

    // [name, picture (base64 PNG, or ""), count, (def, version, x, y, flip)...] -> [1, id, name]
    dps(session, roomId, [name, picture, countText, ...fields]) {
      const count = Number(countText);
      if (prefabLimit.blocked(session.account.username) || !Number.isInteger(count) || count < 1
        || count > denPrefabs.MAX_ITEMS || fields.length !== count * 5) {
        session.sendXt("dps", -1, 0, prefabLimit.blocked(session.account.username) ? "Slow down a little, then try again." : "That prefab could not be saved.");
        return;
      }
      prefabLimit.record(session.account.username);
      const items = Array.from({length: count}, (_, i) => fields.slice(i * 5, i * 5 + 5));
      const result = denPrefabs.save(session.account, {name, items, thumb: picture}, prefabItem);
      if (result.error) {
        session.sendXt("dps", -1, 0, result.error);
        return;
      }
      session.sendXt("dps", -1, 1, result.id, denPrefabs.cleanName(name));
    },

    // [id, name] -> [1, id, name]
    dpn(session, roomId, [id, name]) {
      const kept = denPrefabs.rename(session.account, id, name);
      session.sendXt("dpn", -1, ...(kept ? [1, id, kept] : [0, "Give it a name."]));
    },

    // [id] -> [1, id]
    dpd(session, roomId, [id]) {
      session.sendXt("dpd", -1, ...(denPrefabs.remove(session.account, id) ? [1, id] : [0, "That prefab is not there any more."]));
    },

    // [id] -> [1, id, code]: the code others type in to copy it
    dpx(session, roomId, [id]) {
      const code = denPrefabs.share(session.account, id);
      session.sendXt("dpx", -1, ...(code ? [1, id, code] : [0, "That prefab is not there any more."]));
    },

    // [code] -> [1, id, name]: copies somebody's shared prefab to one's own
    dpi(session, roomId, [code]) {
      if (prefabLimit.blocked(session.account.username)) {
        session.sendXt("dpi", -1, 0, "Slow down a little, then try again.");
        return;
      }
      prefabLimit.record(session.account.username);
      const result = denPrefabs.importCode(session.account, code, prefabItem);
      session.sendXt("dpi", -1, ...(result.error ? [0, result.error] : [1, result.id, result.name]));
    },

    // [id] -> [1, given, left out]: the prefab's items that the player has
    // none of free for the den in use (none, or not enough, of that item
    // in that colour, not standing in it) are added to their inventory, as
    // "!den copy" does; what the game no longer offers is left out. the
    // den item list ("di") comes first, then this answer. nothing is given
    // when it would not all fit.
    dpg(session, roomId, [id]) {
      const entry = denPrefabs.get(session.account, id);
      if (!entry) {
        session.sendXt("dpg", -1, 0, "That prefab is not there any more.");
        return;
      }
      giveMissing(session, "dpg", entry.items);
    },

    // [count, (def, version)...] -> [1, given, left out]: as "dpg", for den
    // items being duplicated in the den editor rather than a saved prefab.
    ddg(session, roomId, [countText, ...fields]) {
      const count = Number(countText);
      const items = [];
      for (let index = 0; index < count && index < denPrefabs.MAX_ITEMS; index++) {
        const def = Number(fields[index * 2]);
        const version = Number(fields[index * 2 + 1]);
        if (prefabItem(def) && Number.isInteger(version) && version >= 0 && version <= denPrefabs.MAX_VERSION) {
          items.push([def, version]);
        }
      }
      if (prefabLimit.blocked(session.account.username) || !Number.isInteger(count) || count < 1 || count > denPrefabs.MAX_ITEMS || items.length !== count) {
        session.sendXt("ddg", -1, 0, prefabLimit.blocked(session.account.username) ? "Slow down a little, then try again." : "Those items cannot be duplicated.");
        return;
      }
      prefabLimit.record(session.account.username);
      giveMissing(session, "ddg", items);
    },

    // [id] -> [1, id, name]: a copy of one's own prefab
    dpc(session, roomId, [id]) {
      if (prefabLimit.blocked(session.account.username)) {
        session.sendXt("dpc", -1, 0, "Slow down a little, then try again.");
        return;
      }
      prefabLimit.record(session.account.username);
      const result = denPrefabs.duplicate(session.account, id);
      session.sendXt("dpc", -1, ...(result.error ? [0, result.error] : [1, result.id, result.name]));
    },

    // a den item of one's own in another of its colours: [invIdx, version]
    // -> [1, invIdx, version]. the colours an item has are in its own art,
    // which the game reads (DenItemHelper.getVersions); here it is only
    // kept to a sane number. players in the den see it at once.
    dvc(session, roomId, [invIdx, versionText]) {
      const {account} = session;
      const item = account.denItems.find(candidate => candidate.inv === Number(invIdx));
      const version = Number(versionText);
      if (!item || item.def === masterpieces.DEN_ITEM || !Number.isInteger(version) || version < 0 || version > denPrefabs.MAX_VERSION) {
        session.sendXt("dvc", -1, 0, "That item's colour cannot be changed.");
        return;
      }
      item.version = version;
      accounts.save(account);
      session.sendXt("dvc", -1, 1, item.inv, version);
      if (inOwnDen(session) && spotOf(item, account.activeDen)) {
        for (const other of others(session)) {
          sendDenState(other, session.room, false);
        }
      }
    },

    // ["1", username]: who may enter that player's den?
    // (BuddyManager.onDenPrivacyResponse: [username, setting])
    // ["0", setting]: change one's own setting.
    dp(session, roomId, [mode, value]) {
      if (mode === "1") {
        const owner = accounts.byName(value);
        session.sendXt("dp", -1, value, owner ? owner.denPrivacy : DEN_LOCKED);
      }
      else if ([DEN_LOCKED, DEN_BUDDIES_ONLY, DEN_OPEN].includes(Number(value))) {
        session.account.denPrivacy = Number(value);
        accounts.save(session.account);
      }
    },
  };
};

module.exports = {handlers, sendDenState, sendDenItems, sendRoomProperties, giveDenItem, clearDen, denRoom, canEnter, spotOf, isPlaced, DEF_DEN_ROOM};
