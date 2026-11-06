"use strict";

const achievements = require("./achievements.js");
const accounts = require("./accounts.js");
const contentPacks = require("./contentpacks.js");
const dens = require("./dens.js");
const limits = require("./limits.js");
const {hasRoom} = require("./player.js");

// the content shop (the den editor's shop of this server's own den items,
// lib/contentpacks.js): open to everyone, paid for in gems.
//
//   dcc []  -> [1, json]  the catalog: {packs: [{id, name, price}],
//              groups: [name], categories: [{id, name, count}],
//              collections: [{id, name, group, kind, pack, count}]}
//   dcq [collection, category, text, page, pageSize (optional, 1 to 60; 24)]
//           -> [1, total, page, pageSize, json]  the items on sale that match,
//              a page of them: [{id, name, cost, placement, w, h, cat, cols}]
//   dcb [count, (defId, quantity)...]
//           -> [1, spent, gems, given, (defId)...] or [0, message]
//              the whole cart or none of it. the den item list ("di") and the
//              gems ("cu") are sent before the answer.
// (named "dc…": the client hands every "d…" answer to its den code,
// den.DenXtCommManager.) JSON goes in one field: "%" (which lib/sfs.js drops) is written as %.

const MAX_LINES = 50;
const MAX_QUANTITY = 20;
const MAX_ITEMS = 200; // in one cart
const CURRENCY_GEMS = 0;

const json = value => JSON.stringify(value).replace(/%/g, "\\u0025");

const handlers = () => {
  const queries = limits.limiter(120, 60000);
  const buys = limits.limiter(20, 60000);
  return {
    dcc(session) {
      session.sendXt("dcc", -1, 1, json(contentPacks.catalog()));
    },

    dcq(session, roomId, [collection = "", category = "", text = "", page = "0", pageSize = ""]) {
      if (!queries.allow(session.account.username)) {
        session.sendXt("dcq", -1, 0, "Slow down a little, then try again.");
        return;
      }
      const found = contentPacks.query({collection: String(collection).slice(0, 120), category: String(category).slice(0, 40),
        text: String(text).slice(0, 100), page: Number(page), pageSize: Number(pageSize) || undefined});
      session.sendXt("dcq", -1, 1, found.total, found.page, found.pageSize, json(found.items));
    },

    dcb(session, roomId, [countText, ...fields]) {
      const {account} = session;
      const refuse = message => session.sendXt("dcb", -1, 0, message);
      if (!buys.allow(account.username)) {
        refuse("Slow down a little, then try again.");
        return;
      }
      const count = Number(countText);
      if (!Number.isInteger(count) || count < 1 || count > MAX_LINES || fields.length < count * 2) {
        refuse("That cart can't be bought.");
        return;
      }
      const lines = new Map(); // defId -> quantity
      for (let i = 0; i < count; i++) {
        const id = Number(fields[i * 2]);
        const quantity = Number(fields[i * 2 + 1]);
        const entry = contentPacks.get(id);
        if (!entry || !entry.onSale || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
          refuse(entry && !entry.onSale ? `${entry.name} isn't sold any more.` : "Something in that cart can't be bought.");
          return;
        }
        lines.set(id, (lines.get(id) || 0) + quantity);
      }
      const total = [...lines.values()].reduce((sum, quantity) => sum + quantity, 0);
      const cost = [...lines].reduce((sum, [id, quantity]) => sum + contentPacks.get(id).cost * quantity, 0);
      if (total > MAX_ITEMS) {
        refuse(`At most ${MAX_ITEMS} items at once, please.`);
        return;
      }
      if (!hasRoom(account, "denItems", total)) {
        refuse("Your den items are full: there isn't room for all of that.");
        return;
      }
      if ((account.currency.gems || 0) < cost) {
        refuse(`That costs ${cost} gems; you have ${account.currency.gems || 0}.`);
        return;
      }
      account.currency.gems -= cost;
      achievements.currencyChanged(account, "gems", -cost);
      const given = [];
      for (const [id, quantity] of lines) {
        for (let n = 0; n < quantity; n++) {
          if (dens.giveDenItem(account, id)) {
            given.push(id);
          }
        }
      }
      achievements.add(account, achievements.VARS.denItemsBought, given.length);
      accounts.save(account);
      dens.sendDenItems(session);
      // ItemXtCommManager.currencyUpdateResponse: [currencyType, newAmount, reason]
      session.sendXt("cu", -1, CURRENCY_GEMS, account.currency.gems, 0);
      session.sendXt("dcb", -1, 1, cost, account.currency.gems, given.length, ...given);
    },
  };
};

module.exports = {handlers};
