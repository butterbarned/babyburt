"use strict";

const accounts = require("./accounts.js");
const bans = require("./bans.js");
const chatlog = require("./chatlog.js");
const denPrefabs = require("./denprefabs.js");
const denLayouts = require("./denlayouts.js");
const devices = require("./devices.js");
const masterpieces = require("./masterpieces.js");
const support = require("./support.js");
const world = require("./world.js");

// an account deleted for good, by its owner (lib/manage.js) or by the admin
// (lib/panel.js), and what was kept about it elsewhere with it: its chat
// lines, its appeal, its feedback and username requests, the computers it
// was used from (lib/devices.js), its den prefabs, and the paintings
// it made (from whoever holds one by now). what stays is said in the
// privacy policy (public/privacy.html): the record of bans and of what
// moderators did, under the name it had, until lib/retention.js ends it.
// the caller has taken the account out of the world and its pages.
module.exports = account => {
  for (const id of masterpieces.madeBy(account)) {
    world.removeMasterpiece(id);
  }
  bans.forget(account);
  chatlog.forget(account);
  denPrefabs.forget(account);
  denLayouts.forget(account);
  devices.forget(account);
  support.forget(account);
  accounts.remove(account);
};
