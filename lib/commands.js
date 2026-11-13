"use strict";

const accounts = require("./accounts.js");
const chatlog = require("./chatlog.js");
const customItems = require("./customitems.js");
const itemControl = require("./itemcontrol.js");
const wearRules = require("./wearrules.js");
const modNotes = require("./modnotes.js");
const defpacks = require("./defpacks.js");
const disguises = require("./disguises.js");
const dens = require("./dens.js");
const {isSilenced} = require("./moderation.js");
const modlog = require("./modlog.js");
const roles = require("./roles.js");
const limits = require("./limits.js");
const {MAX_WORN, activeAvatar, wornItems, sendLayerOrder, resolveLayerOrder, isUint} = require("./player.js");

// things players can do by typing "!something" in the chat box, for what
// the game has no window for. none of them touches another player: they
// look things up, or change the typist's own outfit, den or settings.
// what a command has to say comes up in a plain message box of the game's
// ("xtl", shown by the patched client), not as a note from Animal Jam HQ.
//
// the chat box only lets through letters, digits, spaces and !'.,():?-
// so that is all a command or a name given to one can be made of.

const PREFIX = "!";
const MAX_OUTFITS = 30;
const MAX_LAYOUTS = 20;
const MAX_NAME = 20;
const MAX_LISTED = 40;
const NAME_PATTERN = /^[a-z0-9]{1,20}$/;

// what each command does is listed for players at /commands
// (public/commands.html): too much to read in a popup in the game.

// short names for "!go". any room of the room list also goes by its own
// name, with dots ("sarepia.flag_shop").
const PLACES = {
  township: "jamaa_township.room_main", jamaa: "jamaa_township.room_main",
  sarepia: "sarepia.room_main", crystal: "crystal_sands.room_main", sands: "crystal_sands.room_main",
  coral: "coral_canyons.room_main", canyons: "coral_canyons.room_main", shiveer: "mountains_of_shivveer.room_main",
  appondale: "appondale.room_main", zios: "lost_temple_of_zios.room_main", temple: "lost_temple_of_zios.room_main",
  kimbara: "aussie.room_main", outback: "aussie.room_main", balloosh: "balloosh.room_main",
  bahari: "oceans.bahari_bay", reef: "oceans.crystal_reef", deep: "oceans.deep_sea", kani: "pirate_ship.room_main",
  arcade: "jamaa_township.room_arcade", diamonds: "jamaa_township.room_diamonds", alphas: "jamaa_township.room_alphahq",
  museum: "appondale.room_museum", chamber: "lost_temple_of_zios.chamber_of_knowledge", aquarium: "crystal_sands.room_tierney",
  path: "canyon_path.room_main", carnival: "party.venue_carnival",
};
const PLAIN_NAME = /^[A-Za-z0-9][A-Za-z0-9 '.-]{0,19}$/; // a typed animal or pet name
const MAX_WHISPER = 200;
const MAX_AGAIN = 100;

// A hosted party's own name is three string ids, no use outside the game.
const roomTitle = room => (room.partyHost ? `${room.partyHost.username}'s party` : room.displayName);

module.exports = ({findOnline, players, watchers, sendItemList, blocks, setHideBlocked, refreshForOthers, travel, reloadRoom, buyAgain, ask, staffMove, setInvisible, staffModeration}) => {
  // A plain message box with an OK button.
  const tell = (session, text) => session.sendXt("xtl", -1, String(text).replace(/%/g, " percent"));

  const named = (list, name) => list.find(entry => entry.name === name);

  const validName = (session, name) => {
    if (!NAME_PATTERN.test(name || "")) {
      tell(session, `Give it a name of letters and digits, up to ${MAX_NAME} long.`);
      return false;
    }
    return true;
  };

  // has the animal in use wear exactly the clothes with these inventory
  // ids, and remembers what it wore before for "!outfit undo". `order`:
  // undefined leaves the animal's layer order (avatar.layerOrder, the avatar
  // editor's layers panel) as it is, an array of inventory ids is the order
  // to wear them in, the bottom first, and null or [] is the game's own
  // order. returns the items now worn.
  const dress = (session, invs, order) => {
    const {account} = session;
    const avatar = activeAvatar(account);
    const before = wornItems(account, avatar);
    // Saved outfits are a second equip route, so they obey the same rule as
    // the item editor. A saved id remains in the outfit in case staff later
    // remove the rule; it simply cannot be put on while blocked.
    const wanted = account.items.filter(item => invs.includes(item.inv) && wearRules.mayWear(item.def, avatar.type)).slice(0, MAX_WORN);
    const takenOff = before.filter(item => !wanted.includes(item));
    account.outfitUndo = {avInvId: avatar.avInvId, items: before.map(item => item.inv), order: Array.isArray(avatar.layerOrder) ? [...avatar.layerOrder] : null};
    for (const item of takenOff) {
      item.on = item.on.filter(avInvId => avInvId !== avatar.avInvId);
    }
    for (const item of wanted) {
      if (!item.on.includes(avatar.avInvId)) {
        item.on.push(avatar.avInvId);
      }
    }
    if (Array.isArray(order) && order.length > 0) {
      const worn = new Set(wanted.map(item => item.inv));
      avatar.layerOrder = order.map(Number).filter(inv => worn.has(inv));
    }
    // an animal never given an order is left without one (sendLayerOrder
    // then tells nobody anything).
    else if (order !== undefined && Array.isArray(avatar.layerOrder)) {
      avatar.layerOrder = [];
    }
    accounts.save(account);
    // the order first, so the clothes are painted in it (AvatarUtility.onLayerOrder).
    sendLayerOrder(session, account, avatar);
    // ItemXtCommManager.itemsChangedListResponse, "3" = what is worn
    // changed: [3, inUse, perUserAvId, username, colour, onCount,
    // offCount, (invIdx, defId)..., offInvIdx...]
    session.sendXt("il", -1, 3, 1, avatar.perUserAvId, account.username, 0, wanted.length, takenOff.length,
      ...wanted.flatMap(item => [item.inv, item.def]), ...takenOff.map(item => item.inv));
    for (const other of watchers(session)) {
      sendItemList(other, session, false);
    }
    return wanted;
  };

  // what the animal in use wears, as an outfit keeps it: {items, ordered},
  // the items in the animal's layer order when it has one.
  const wornOutfit = account => {
    const avatar = activeAvatar(account);
    const worn = wornItems(account, avatar);
    const ordered = resolveLayerOrder(worn, avatar.layerOrder);
    const items = ordered ? [...ordered, ...worn.filter(item => !ordered.includes(item))] : worn;
    return {items: items.map(item => item.inv), ordered: Boolean(ordered)};
  };

  // keeps an outfit by name, replacing one of the same name; an error's
  // text, or null when it was kept.
  const keepOutfit = (account, name, {items, ordered}) => {
    const existing = named(account.outfits, name);
    if (!existing && account.outfits.length >= MAX_OUTFITS) {
      return `You already have ${MAX_OUTFITS} outfits. Delete one first.`;
    }
    account.outfits = [...account.outfits.filter(entry => entry !== existing), {name, items, ordered}];
    accounts.save(account);
    return null;
  };

  const outfit = (session, [action, name]) => {
    const {account} = session;
    const avatar = activeAvatar(account);
    switch (action) {
      case "off":
        dress(session, []);
        tell(session, "Everything is off. !outfit undo puts it back on.");
        return;
      // what this animal wore before the last change made here or in the
      // animal editor (lib/items.js keeps it).
      case "undo": {
        const undo = account.outfitUndo;
        if (!undo || undo.avInvId !== avatar.avInvId) {
          tell(session, "There is nothing to put back for this animal.");
          return;
        }
        dress(session, undo.items, undo.order);
        tell(session, "Back to what you wore before. !outfit undo again swaps back.");
        return;
      }
      // the next free "outfit N" (the settings menu's "Save what I wear").
      case "savenew": {
        let number = 1;
        while (named(account.outfits, `outfit${number}`)) {
          number++;
        }
        outfit(session, ["save", `outfit${number}`]);
        return;
      }
      // what the animal wears, in the order its layers panel gives it.
      case "save": {
        if (!validName(session, name)) {
          return;
        }
        const worn = wornOutfit(account);
        const error = keepOutfit(account, name, worn);
        tell(session, error || `Outfit ${name} saved (${worn.items.length} items).`);
        return;
      }
      case "wear": {
        const saved = named(account.outfits, name);
        if (!saved) {
          tell(session, `You have no outfit called ${name}. Try !outfit list.`);
          return;
        }
        // one saved before outfits kept an order (no `ordered`) leaves the animal's as it is
        const wanted = dress(session, saved.items, saved.ordered ? saved.items : (saved.ordered === false ? null : undefined));
        const missing = saved.items.length - wanted.length;
        tell(session, missing ? `Wearing ${name}. ${missing} of its items are no longer yours.` : `Wearing ${name}.`);
        return;
      }
      case "delete":
        if (!named(account.outfits, name)) {
          tell(session, `You have no outfit called ${name}.`);
          return;
        }
        account.outfits = account.outfits.filter(entry => entry.name !== name);
        accounts.save(account);
        tell(session, `Outfit ${name} deleted.`);
        return;
      case "list":
        tell(session, account.outfits.length ? `Your outfits: ${account.outfits.map(entry => entry.name).join(", ")}` : "You have no saved outfits yet.");
        return;
      default:
        // the patched client opens its outfits window for "!outfit" on its own
        // (UserCommXtCommManager.sendChatMessage), so this is an older one's.
        tell(session, "Use: !outfit save NAME, !outfit wear NAME, !outfit list, !outfit delete NAME, !outfit off, !outfit undo");
    }
  };

  // the avatar editor's outfits window (swf-src/AvatarOutfitsPanel.as).
  // "xol" [count, (name, ordered, pieceCount, (def, colour, inv)...)...]:
  // the player's outfits, each with the pieces they still have, in the
  // outfit's order. the window puts one on in the editor, as if picked
  // there, and the editor saves what is worn as ever ("iu", "xlo").
  const sendOutfits = session => {
    const {account} = session;
    const byInv = new Map(account.items.map(item => [item.inv, item]));
    session.sendXt("xol", -1, account.outfits.length, ...account.outfits.flatMap(entry => {
      const pieces = entry.items.map(inv => byInv.get(Number(inv))).filter(Boolean);
      return [entry.name, entry.ordered ? 1 : 0, pieces.length, ...pieces.flatMap(item => [item.def, item.color, item.inv])];
    }));
  };
  const outfitLimit = limits.limiter(60, 60000);
  const outfitHandlers = {
    // [] : the list
    xol(session) {
      if (outfitLimit.blocked(session.account.username)) {
        return;
      }
      outfitLimit.record(session.account.username);
      sendOutfits(session);
    },
    // [name, ordered, count, inv...]: keeps what the editor shows (an animal
    // or a mannequin) as an outfit, the pieces bottom first when ordered.
    xos(session, roomId, [name, ordered, count, ...invs]) {
      const {account} = session;
      const number = Number(count);
      if (outfitLimit.blocked(account.username)) {
        return;
      }
      outfitLimit.record(account.username);
      if (!Number.isInteger(number) || number < 0 || number > MAX_WORN || invs.length !== number || !invs.every(isUint) || !["0", "1"].includes(ordered)) {
        sendOutfits(session); // the window waits for the list to say whether it was kept
        return;
      }
      const name_ = String(name || "").toLowerCase();
      if (!validName(session, name_)) {
        sendOutfits(session);
        return;
      }
      const owned = new Set(account.items.map(item => item.inv));
      const items = [...new Set(invs.map(Number))].filter(inv => owned.has(inv));
      const error = keepOutfit(account, name_, {items, ordered: ordered === "1" && items.length > 0});
      if (error) {
        tell(session, error);
      }
      sendOutfits(session);
    },
    // [name]
    xod(session, roomId, [name]) {
      const {account} = session;
      if (outfitLimit.blocked(account.username)) {
        return;
      }
      outfitLimit.record(account.username);
      account.outfits = account.outfits.filter(entry => entry.name !== String(name));
      accounts.save(account);
      sendOutfits(session);
    },
  };

  const {activeDenDef, applyLayout} = dens;

  const layoutOf = owner => owner.denItems
    .filter(item => dens.spotOf(item, owner.activeDen))
    .map(item => ({def: item.def, version: item.version, ...dens.spotOf(item, owner.activeDen)}));

  const den = (session, [action, name]) => {
    const {account} = session;
    switch (action) {
      case "save": {
        if (!validName(session, name)) {
          return;
        }
        const existing = named(account.denLayouts, name);
        if (!existing && account.denLayouts.length >= MAX_LAYOUTS) {
          tell(session, `You already have ${MAX_LAYOUTS} den layouts. Delete one first.`);
          return;
        }
        const items = layoutOf(account);
        account.denLayouts = [...account.denLayouts.filter(entry => entry !== existing), {name, den: activeDenDef(account), items}];
        accounts.save(account);
        tell(session, `Den layout ${name} saved (${items.length} items).`);
        return;
      }
      case "load": {
        const saved = named(account.denLayouts, name);
        if (!saved) {
          tell(session, `You have no den layout called ${name}. Try !den list.`);
          return;
        }
        if (saved.den !== activeDenDef(account)) {
          tell(session, `Layout ${name} was made in another kind of den. Switch to that den first.`);
          return;
        }
        const missing = applyLayout(session, saved.items, false);
        tell(session, missing ? `Den layout ${name} loaded. ${missing} of its items are no longer yours.` : `Den layout ${name} loaded.`);
        return;
      }
      case "copy": {
        const owner = session.room && session.room.denOwner;
        if (!owner || owner === account) {
          tell(session, "Stand in the den you want to copy, then type !den copy.");
          return;
        }
        if (activeDenDef(owner) !== activeDenDef(account)) {
          tell(session, "Your den in use is a different kind of den. Switch to the same kind first.");
          return;
        }
        const missing = applyLayout(session, layoutOf(owner), true);
        tell(session, missing ? `Your den now looks like this one, apart from ${missing} items.` : "Your den now looks like this one.");
        return;
      }
      case "savenew": {
        let number = 1;
        while (named(account.denLayouts, `layout${number}`)) {
          number++;
        }
        den(session, ["save", `layout${number}`]);
        return;
      }
      // what the den's "clear" button took away (lib/dens.js clearDen keeps it).
      case "undo": {
        const undo = account.denUndo;
        if (!undo || undo.den !== account.activeDen) {
          tell(session, undo ? "That was another den. Switch to it first." : "There is nothing to put back.");
          return;
        }
        const missing = applyLayout(session, undo.items, false);
        account.denUndo = null;
        accounts.save(account);
        tell(session, missing ? `Your den is back as it was, apart from ${missing} items that are no longer yours.` : "Your den is back as it was.");
        return;
      }
      case "delete":
        if (!named(account.denLayouts, name)) {
          tell(session, `You have no den layout called ${name}.`);
          return;
        }
        account.denLayouts = account.denLayouts.filter(entry => entry.name !== name);
        accounts.save(account);
        tell(session, `Den layout ${name} deleted.`);
        return;
      case "list":
        tell(session, account.denLayouts.length ? `Your den layouts: ${account.denLayouts.map(entry => entry.name).join(", ")}` : "You have no saved den layouts yet.");
        return;
      default:
        tell(session, "Use: !den save NAME, !den load NAME, !den list, !den delete NAME, !den copy, !den undo");
    }
  };

  const commands = {
    online(session) {
      const names = players().filter(other => !blocks.either(other.account, session.account)).map(other => other.account.username);
      const shown = names.slice(0, MAX_LISTED).join(", ");
      tell(session, `${names.length} playing: ${shown}${names.length > MAX_LISTED ? ", ..." : ""}`);
    },

    // only for buddies, as with the buddy list's own "go to".
    where(session, words) {
      const name = words.join(" ");
      const target = findOnline(name);
      if (!name) {
        tell(session, "Use: !where NAME");
      }
      else if (!session.account.buddies.includes(name.toLowerCase())) {
        tell(session, `${name} is not one of your buddies.`);
      }
      else if (!target || !target.room) {
        tell(session, `${name} is not online.`);
      }
      else {
        tell(session, `${target.account.username} is in ${roomTitle(target.room)}.`);
      }
    },

    time(session) {
      tell(session, `It is ${new Date().toUTCString()}.`);
    },

    outfit,
    den,

    // lib/disguises.js
    become(session, [choice]) {
      if (!choice || choice === "list") {
        tell(session, `You can become: ${disguises.names().join(", ")}. !become off to be yourself.`);
        return;
      }
      if (choice === "off") {
        disguises.set(session, 0, refreshForOthers);
        tell(session, "You are yourself again.");
        return;
      }
      const id = disguises.find(choice);
      if (!id) {
        tell(session, `There is no character called ${choice}. Try !become list.`);
        return;
      }
      const changing = disguises.of(session.account) !== 0;
      disguises.set(session, id, refreshForOthers);
      tell(session, changing ? "Done. It shows when you next walk into a room." : "Done. !become off to be yourself again.");
    },

    again(session, [choice]) {
      const times = choice === undefined ? 1 : Number(choice);
      if (!session.lastPurchase || !Number.isInteger(times) || times < 1 || times > MAX_AGAIN) {
        tell(session, session.lastPurchase ? `Use: !again N, with N from 1 to ${MAX_AGAIN}` : "Buy something in a shop first; !again then buys more of it.");
        return;
      }
      ask(session, times === 1 ? "Buy one more of the last thing you bought?" : `Buy ${times} more of the last thing you bought?`, () => {
        for (let count = 0; count < times; count++) {
          buyAgain(session);
        }
      });
    },

    go(session, [place]) {
      if (!place || place === "list") {
        tell(session, `Places: ${Object.keys(PLACES).join(", ")}. Any room also goes by its own name, like sarepia.flag_shop.`);
        return;
      }
      const base = Object.hasOwn(PLACES, place) ? PLACES[place] : place;
      if (!defpacks.roomDef(base) || /^(player_den|epic_dens)\./.test(base)) {
        tell(session, `There is no place called ${place}. Try !go list.`);
        return;
      }
      travel(session, base);
    },

    // A look for the room they stand in, a look picked afresh at every
    // login, or the list of looks (config.themes).
    theme(session, [action, choice]) {
      const {account} = session;
      const themes = require("../config.js").themes;
      if (action === "random" && (choice === "on" || choice === "off")) {
        account.randomTheme = choice === "on";
        accounts.save(account);
        tell(session, account.randomTheme ? "The lands get a look picked at random each time you log in." : "The lands keep the look you choose.");
      }
      else if (action === "here" && session.room && !session.room.denOwner && (choice === "off" || Object.hasOwn(themes, choice))) {
        if (choice === "off") {
          delete account.roomThemes[session.room.base];
        }
        else {
          account.roomThemes[session.room.base] = choice;
        }
        accounts.save(account);
        reloadRoom(session);
      }
      else if (action === "list") {
        tell(session, `Looks: ${Object.keys(themes).join(", ")}`);
      }
      else {
        tell(session, "Use: !theme list, !theme here NAME, !theme here off, !theme random on, !theme random off");
      }
    },

    // deletes the Jam-A-Grams already read; ones with a gift not yet taken stay.
    mail(session, [action]) {
      const {account} = session;
      if (action !== "clear") {
        tell(session, "Use: !mail clear");
        return;
      }
      const before = account.ecards.length;
      account.ecards = account.ecards.filter(card => !card.read || card.gift);
      accounts.save(account);
      tell(session, `${before - account.ecards.length} read Jam-A-Grams deleted. Open your mail again to see.`);
    },

    // every music track, the official ones and this server's extras, as den
    // items of theirs: what the den's music list offers is what they own.
    music(session, [action]) {
      const {account} = session;
      if (action !== "all") {
        tell(session, "Use: !music all");
        return;
      }
      const owned = new Set(account.denItems.map(item => item.def));
      const wanted = [...defpacks.musicIds(), ...defpacks.extraMusicIds()].filter(id => !owned.has(id));
      const given = wanted.filter(id => dens.giveDenItem(account, id)).length;
      dens.sendDenItems(session);
      tell(session, given < wanted.length ? `${given} music tracks added. Your den items are full: recycle some for the rest.`
        : wanted.length ? `${wanted.length} music tracks added. They are in your den's music list.` : "You have every music track already.");
    },

    hideblocked(session, [choice]) {
      if (choice !== "on" && choice !== "off") {
        tell(session, `Blocked players are ${session.account.hideBlocked ? "hidden" : "shown"}. Use: !hideblocked on, or !hideblocked off`);
        return;
      }
      setHideBlocked(session, choice === "on");
      tell(session, choice === "on" ? "Players you have blocked are now hidden from you." : "Players you have blocked are shown again.");
    },
  };

  // commands whose words matter as they were typed, capitals and all.
  const asTyped = {
    // A whisper: only that buddy sees it, wherever they are. standing in
    // the same room it is a chat bubble for the two of them; otherwise a
    // message box, the one way the game has to show text from afar.
    w(session, [name, ...words]) {
      const {account} = session;
      const said = words.join(" ").slice(0, MAX_WHISPER);
      const target = name ? findOnline(name) : null;
      if (!name || !said) {
        tell(session, "Use: !w BUDDY message");
      }
      else if (!account.buddies.includes(name.toLowerCase())) {
        tell(session, `${name} is not one of your buddies.`);
      }
      else if (!target || !target.room || blocks.either(target.account, account)
        || !accounts.featureOn(target.account, "chat") || !accounts.featureOn(account, "chat")) {
        tell(session, `${name} cannot be whispered to right now.`);
      }
      else if (target.room === session.room) {
        // "xw" makes the next chat bubble the reader's game draws a
        // light green one (gui.ChatBalloon in the patched client).
        for (const reader of [session, target]) {
          reader.sendXt("xw", -1, 1);
          reader.sendXt("uc", session.room.id, session.id, said, 0);
        }
        chatlog.record(account, session.room.name, said, target.account.username);
      }
      else {
        // from afar there is no bubble to draw: a message box, in the same green.
        target.sendXt("xw", -1, 0, account.username, said.replace(/%/g, " percent"));
        tell(session, `Whispered to ${target.account.username}.`);
        chatlog.record(account, session.room ? session.room.name : "", said, target.account.username);
      }
    },
    whisper(session, words) {
      asTyped.w(session, words);
    },

    // "!den name NEW NAME": what the den in use is called on the screen of
    // whoever walks in. anything else after "!den" is the usual command.
    den(session, [action, ...words]) {
      const {account} = session;
      const wanted = words.join(" ");
      if (action.toLowerCase() !== "name") {
        commands.den(session, [action, ...words].map(word => word.toLowerCase()));
      }
      else if (wanted.toLowerCase() === "off") {
        delete account.denNames[account.activeDen];
        accounts.save(account);
        tell(session, "This den has its usual name again.");
      }
      else if (isSilenced(account)) {
        tell(session, "You cannot name a den while silenced.");
      }
      else if (!PLAIN_NAME.test(wanted)) {
        tell(session, "Use: !den name NEW NAME (letters, digits and spaces, up to 20), or !den name off");
      }
      else {
        account.denNames[account.activeDen] = wanted;
        accounts.save(account);
        tell(session, `This den is now called ${wanted}. It shows the next time someone walks in.`);
      }
    },

  };

  // ---- staff commands (lib/roles.js). each checks the role's permission on
  // every use, and what is done is written down under the staff member's
  // name, as in the moderator panel. to anyone without the permission they
  // are plain chat, like any other "!word" the server does not know.
  const MAX_STAFF_HOURS = 24 * 365 * 10;
  const MAX_WARNING = 200;
  const MAX_WARNINGS_SHOWN = 5;
  const MAX_ITEMS_LISTED = 8;
  const MAX_NOTES_SHOWN = 5; // "!notes": the latest, in one message box

  const staffMay = (session, permission) => {
    const moderation = staffModeration();
    return roles.can(session.account, permission, moderation.banRemaining(session.account) !== 0);
  };

  // the longest run of leading words naming an online player, and the words
  // after it: usernames may have spaces in them.
  const splitName = words => {
    for (let count = words.length; count > 0; count--) {
      const target = findOnline(words.slice(0, count).join(" "));
      if (target) {
        return {target, rest: words.slice(count)};
      }
    }
    return {target: null, rest: words};
  };

  // the same for any account, online or not.
  const splitAccount = words => {
    for (let count = words.length; count > 0; count--) {
      const account = accounts.byName(words.slice(0, count).join(" "));
      if (account) {
        return account;
      }
    }
    return null;
  };

  // finds the player the command is about, and checks the staff member may
  // act on them (`onStaff`: also on staff below their rank).
  const withTarget = (session, words, usage, onStaff, run) => {
    const {target, rest} = splitName(words);
    if (!words.length) {
      tell(session, usage);
    }
    else if (!target) {
      tell(session, `${words.join(" ")} is not online.`);
    }
    else if (target === session) {
      tell(session, "That is you.");
    }
    else if (onStaff && !roles.outranks(session.account, target.account)) {
      tell(session, "Staff of your rank or above are for someone higher up to deal with.");
    }
    else {
      run(target, rest);
    }
  };

  const logged = (session, action, target, detail = "") =>
    modlog.record(session.account.username, `${action} (in game)`, target.account.username, detail);

  // what lib/itemcontrol.js tells about items taken.
  const worldForItems = {itemsTaken: (...args) => require("./world.js").itemsTaken(...args)};

  const lockCommand = (session, words, locked) => {
    const [kind, id] = [(words[0] || "").toLowerCase(), words[1]];
    if (words.length !== 2) {
      tell(session, `Use: !${locked ? "lock" : "unlock"} clothing|den ID`);
      return;
    }
    const result = itemControl.setLocked(kind, id, locked);
    tell(session, result.error || result.ok);
    if (result.ok) {
      modlog.record(session.account.username, locked ? "item locked (in game)" : "item unlocked (in game)", "", `${kind} ${id}`);
    }
  };

  // an account named by the first words (a name may have spaces: the longest
  // that is one), and the words after it.
  const accountAndRest = words => {
    for (let count = words.length; count > 0; count--) {
      const account = accounts.byName(words.slice(0, count).join(" "));
      if (account) {
        return {account, rest: words.slice(count)};
      }
    }
    return {account: null, rest: words};
  };

  const staffCommands = {
    // Testing an adventure from inside it: "!adv" alone lists what it can do
    // (start, where, list, tp, fire, give, goal, god...). The work is in
    // lib/adventures.js, which knows the adventure being played.
    adv: {
      permission: "adventures.test",
      run(session, words) {
        const {debug} = require("./adventures.js");
        tell(session, debug ? debug(session, words) : "Adventures are not loaded.");
      },
    },
    // the new-player tutorial (Peck's walk through Jamaa), which signing up
    // does not play
    tutorial: {
      permission: "adventures.test",
      run(session) {
        const {play} = require("./adventures.js");
        if (!play || !play(session, 39)) {
          tell(session, "The tutorial can't start here. Try again from a land or your den, outside an adventure.");
        }
      },
    },
    // A short-lived room control for owners, admins and developers.  It uses
    // the avatar protocol rather than persisting any player appearance.
    roomfx: {
      permission: "room.effects",
      run(session, words) {
        const room = session.room;
        const effect = (words[0] || "").toLowerCase();
        if (!room || !["small", "normal", "big", "rainbow", "clear"].includes(effect)) {
          tell(session, "Use: !roomfx small, !roomfx normal, !roomfx big, !roomfx rainbow, or !roomfx clear");
          return;
        }
        const send = (type, value) => {
          for (const target of room.sessions) {
            for (const viewer of room.sessions) {
              viewer.sendXt("uc", room.id, target.id, String(value), type);
            }
          }
        };
        const stopRainbow = () => {
          if (room.roomEffectTimer) {
            clearInterval(room.roomEffectTimer);
            delete room.roomEffectTimer;
          }
        };
        if (effect === "rainbow") {
          stopRainbow();
          let hue = 0;
          room.roomEffectTimer = setInterval(() => {
            if (room.sessions.size === 0) {
              stopRainbow();
              return;
            }
            const colour = [0xFF4040, 0xFFB340, 0xF8FF40, 0x50E860, 0x40CFFF, 0x7560FF, 0xDC55FF][hue++ % 7];
            send(8, colour);
          }, 350);
          room.roomEffectTimer.unref();
          tell(session, "Rainbow effect started for everyone in this room. !roomfx clear stops it.");
        }
        else {
          stopRainbow();
          if (effect === "small" || effect === "big" || effect === "normal") {
            send(14, effect === "small" ? 0.7 : effect === "big" ? 1.35 : 1);
            tell(session, `Everyone in this room is now ${effect === "normal" ? "normal size" : effect}.`);
          }
          else {
            send(8, 0);
            send(14, 1);
            tell(session, "Room effects cleared.");
          }
        }
        modlog.record(session.account.username, "room effect (in game)", "", `${effect}: ${roomTitle(room)}`);
      },
    },
    // "!item clothing|den ID NAME": a new item made from the game's item ID
    // (lib/customitems.js), free, every colour of the one it is made from;
    // everyone has it at once. the moderator panel's Items page does more.
    // "!item list": the latest made.
    item: {
      permission: "items.create",
      run(session, words) {
        const usage = "Use: !item clothing|den ID NAME, or !item list";
        if ((words[0] || "").toLowerCase() === "list") {
          const latest = customItems.list().slice(0, MAX_ITEMS_LISTED)
            .map(entry => `${entry.id} ${entry.name} (${entry.kind === "den" ? "den" : "clothing"}${entry.inShop ? "" : ", off sale"})`);
          tell(session, latest.length ? `Latest items made: ${latest.join("; ")}` : "No items made yet.");
          return;
        }
        const kind = (words[0] || "").toLowerCase();
        if (!customItems.KINDS.includes(kind) || !/^\d+$/.test(words[1] || "") || words.length < 3) {
          tell(session, usage);
          return;
        }
        const result = customItems.create(kind, {base: words[1], name: words.slice(2).join(" ")}, session.account.username);
        if (result.error) {
          tell(session, result.error);
          return;
        }
        const {item} = result;
        tell(session, `Made ${item.name}, ${kind === "den" ? "den item" : "clothing"} ${item.id}. It is in the item finder now.`);
        modlog.record(session.account.username, "item made (in game)", "", `${kind} ${item.id} ${item.name}`);
      },
    },
    staff: {
      permission: "staff.list",
      run(session) {
        const on = players().filter(other => roles.isActiveStaff(other.account))
          .map(other => `${other.account.username} (${roles.ROLES[roles.roleOf(other.account)].label})`);
        tell(session, on.length ? `Staff online: ${on.join(", ")}` : "No staff online.");
      },
    },
    // Opens the same in-game moderation window as a player's card.  This is
    // useful when a moderator already knows the name and does not need to
    // hunt through search results first.
    mod: {
      permission: "player.view",
      run(session, words) {
        const target = words.length ? findOnline(words.join(" ")) : null;
        if (!target) {
          tell(session, words.length ? `${words.join(" ")} is not online.` : "Use: !mod PLAYER");
          return;
        }
        if (target.account !== session.account && roles.roleOf(target.account) && !roles.outranks(session.account, target.account)) {
          tell(session, "Staff of your rank or above are for someone higher up to deal with.");
          return;
        }
        session.sendXt("xui", -1, "moderate", target.account.username);
      },
    },
    // Owners, admins and developers get the room-effects panel from chat.
    // `host` is an intuitive alias for event hosts.
    event: {
      permission: "room.effects",
      run(session) {
        session.sendXt("xui", -1, "event");
      },
    },
    host: {
      permission: "room.effects",
      run(session) {
        session.sendXt("xui", -1, "event");
      },
    },
    // "!note PLAYER text": a note for the other staff (lib/modnotes.js),
    // never shown to the player. "!notes PLAYER": the latest few.
    note: {
      permission: "player.view",
      run(session, words) {
        const {account, rest} = accountAndRest(words);
        if (!account || !rest.length) {
          tell(session, account || !words.length ? "Use: !note PLAYER text" : `No player called ${words[0]}.`);
          return;
        }
        if (account === session.account) {
          tell(session, "That is you.");
          return;
        }
        if (roles.roleOf(account) && !roles.outranks(session.account, account)) {
          tell(session, "Staff of your rank or above are for someone higher up to deal with.");
          return;
        }
        const result = modNotes.add(account, session.account.username, rest.join(" "));
        if (result.error) {
          tell(session, result.error);
          return;
        }
        tell(session, `Note on ${account.username} added.`);
        modlog.record(session.account.username, "note (in game)", account.username, result.note.text);
      },
    },
    notes: {
      permission: "player.view",
      run(session, words) {
        const account = words.length ? accounts.byName(words.join(" ")) : null;
        if (!account) {
          tell(session, words.length ? `No player called ${words.join(" ")}.` : "Use: !notes PLAYER");
          return;
        }
        const latest = modNotes.list(account).slice(0, MAX_NOTES_SHOWN)
          .map(note => `${new Date(note.at * 1000).toISOString().slice(0, 10)} ${note.by}: ${note.text}`);
        tell(session, latest.length ? `Notes on ${account.username}: ${latest.join(" | ")}` : `No notes on ${account.username}.`);
      },
    },
    // "!invisible": unseen by players in every room until said again (staff
    // still see them), as the game's own moderators could be.
    invisible: {
      permission: "staff.invisible",
      run(session) {
        setInvisible(session, !session.invisible);
      },
    },
    reject: {
      permission: "player.names",
      run(session, words) {
        withTarget(session, words, "Use: !reject PLAYER", true, target => {
          if (target.account.nameRejected) {
            tell(session, `${target.account.username}'s name is already rejected.`);
            return;
          }
          staffModeration().actions.rejectName(target.account, session.account.username);
          tell(session, `${target.account.username} was signed out and must choose a new name.`);
          logged(session, "rejected username", target);
        });
      },
    },
    // "!lock clothing|den ID", "!unlock clothing|den ID", "!locked": items
    // kept out of the item finder for players (lib/itemcontrol.js).
    lock: {
      permission: "items.create",
      run(session, words) {
        lockCommand(session, words, true);
      },
    },
    unlock: {
      permission: "items.create",
      run(session, words) {
        lockCommand(session, words, false);
      },
    },
    locked: {
      permission: "items.create",
      run(session) {
        const list = itemControl.lockedList().slice(0, MAX_ITEMS_LISTED)
          .map(entry => `${entry.kind} ${entry.id} ${entry.name || "(no name)"}`);
        tell(session, list.length ? `Locked out of the item finder: ${list.join("; ")}` : "Nothing is locked out of the item finder.");
      },
    },
    // "!take PLAYER clothing|den ID": every one of that item, out of their
    // inventory, online or not.
    take: {
      permission: "items.create",
      run(session, words) {
        const usage = "Use: !take PLAYER clothing|den ID";
        // the name may have spaces: the kind and the id are the last two words.
        const [kind, id] = words.slice(-2).map(word => word.toLowerCase());
        const account = words.length >= 3 ? accounts.byName(words.slice(0, -2).join(" ")) : null;
        if (words.length < 3 || !/^\d+$/.test(id)) {
          tell(session, usage);
          return;
        }
        if (!account) {
          tell(session, `No player called ${words.slice(0, -2).join(" ")}.`);
          return;
        }
        if (account !== session.account && !roles.outranks(session.account, account) && roles.roleOf(account)) {
          tell(session, "Staff of your rank or above are for someone higher up to deal with.");
          return;
        }
        const result = itemControl.take(account.username, kind, id, worldForItems);
        tell(session, result.error || result.ok);
        if (result.ok) {
          modlog.record(session.account.username, "item taken (in game)", account.username, `${kind} ${id} x${result.count}`);
        }
      },
    },
    summon: {
      permission: "player.summon",
      run(session, words) {
        withTarget(session, words, "Use: !summon PLAYER", true, target => {
          const result = staffMove(target.account.username, session.account.username);
          if (!result.ok) {
            tell(session, result.error);
            return;
          }
          tell(session, `${target.account.username} was brought here.`);
          logged(session, "summon", target, result.room);
        });
      },
    },
    goto: {
      permission: "player.goto",
      run(session, words) {
        withTarget(session, words, "Use: !goto PLAYER", false, target => {
          const result = staffMove(session.account.username, target.account.username);
          if (!result.ok) {
            tell(session, result.error);
            return;
          }
          logged(session, "goto", target, result.room);
        });
      },
    },
    kick: {
      permission: "player.kick",
      run(session, words) {
        withTarget(session, words, "Use: !kick PLAYER", true, target => {
          const name = target.account.username;
          if (staffModeration().actions.kick(target.account)) {
            tell(session, `${name} was disconnected.`);
            logged(session, "kick", target);
          }
          else {
            tell(session, `${name} is not online.`);
          }
        });
      },
    },
    // "!silence PLAYER HOURS" (0: until lifted), "!silence PLAYER off".
    silence: {
      permission: "chat.silence",
      run(session, words) {
        withTarget(session, words, "Use: !silence PLAYER HOURS (0 until lifted), or !silence PLAYER off", true, (target, rest) => {
          const {actions, PERMANENT} = staffModeration();
          const name = target.account.username;
          const amount = (rest[0] || "").toLowerCase();
          if (amount === "off") {
            actions.silence(target.account, 0);
            tell(session, `${name} can chat again.`);
            logged(session, "unsilence", target);
            return;
          }
          const hours = /^\d{1,6}$/.test(amount) ? Number(amount) : NaN;
          if (!(hours >= 0 && hours <= MAX_STAFF_HOURS)) {
            tell(session, "Use: !silence PLAYER HOURS (0 until lifted), or !silence PLAYER off");
            return;
          }
          actions.silence(target.account, hours === 0 ? PERMANENT : hours * 3600);
          tell(session, hours === 0 ? `${name} cannot chat until it is lifted.` : `${name} cannot chat for ${hours} hours.`);
          logged(session, "silence", target, String(hours || "until lifted"));
        });
      },
    },
    // "!warn PLAYER [REASON] [note]": a warning, kept on the account and
    // shown with the game's own warning popup. REASON is behavior (the
    // default), bullying, personal or scamming; the note is for staff.
    // "!warn PLAYER custom TEXT": a warning in the staff member's own
    // words, which is what the player is shown.
    warn: {
      permission: "player.warn",
      run(session, words) {
        const usage = `Use: !warn PLAYER [${staffModeration().WARNINGS.join("|")}] [note], or !warn PLAYER custom TEXT`;
        withTarget(session, words, usage, true, (target, rest) => {
          const {WARNINGS, actions} = staffModeration();
          const asked = (rest[0] || "").toLowerCase();
          const reason = WARNINGS.includes(asked) ? asked : "behavior";
          const note = (WARNINGS.includes(asked) ? rest.slice(1) : rest).join(" ").trim().slice(0, MAX_WARNING);
          if (reason === "custom" && !note) {
            tell(session, "Use: !warn PLAYER custom TEXT (the text is what they are shown)");
            return;
          }
          const result = actions.warn(target.account, reason, session.account.username, note);
          tell(session, `${target.account.username} warned (${reason}): warning ${result.count}.`
            + (result.silencedMinutes ? ` Silenced for ${result.silencedMinutes} minutes, for that many warnings.` : ""));
          logged(session, "warn", target, note ? `${reason} · ${note}` : reason);
        });
      },
    },
    // "!message PLAYER text": a message box from the moderators.
    message: {
      permission: "player.warn",
      run(session, words) {
        withTarget(session, words, "Use: !message PLAYER text", true, (target, rest) => {
          const text = rest.join(" ").trim().slice(0, MAX_WARNING);
          if (!text) {
            tell(session, "Use: !message PLAYER text");
            return;
          }
          if (staffModeration().actions.message(target.account, text)) {
            tell(session, `Shown to ${target.account.username}.`);
            logged(session, "message", target, text);
          }
          else {
            tell(session, `${target.account.username} is not online.`);
          }
        });
      },
    },
    // "!unwarn PLAYER": takes back their latest warning (one given by
    // mistake), online or not.
    unwarn: {
      permission: "player.warn",
      run(session, words) {
        const account = splitAccount(words);
        if (!account) {
          tell(session, words.length ? `No player called ${words.join(" ")}.` : "Use: !unwarn PLAYER");
          return;
        }
        if (account === session.account) {
          tell(session, "That is you.");
          return;
        }
        if (!roles.outranks(session.account, account)) {
          tell(session, "Staff of your rank or above are for someone higher up to deal with.");
          return;
        }
        const removed = staffModeration().actions.unwarn(account);
        if (!removed) {
          tell(session, `${account.username} has no warnings.`);
          return;
        }
        tell(session, `Took back ${account.username}'s latest warning (${removed.reason}).`);
        modlog.record(session.account.username, "unwarn (in game)", account.username, removed.reason);
      },
    },
    // "!warnings PLAYER": their latest warnings, online or not.
    warnings: {
      permission: "player.warn",
      run(session, words) {
        const account = splitAccount(words);
        if (!account) {
          tell(session, words.length ? `No player called ${words.join(" ")}.` : "Use: !warnings PLAYER");
          return;
        }
        const list = account.warnings || [];
        if (!list.length) {
          tell(session, `${account.username} has no warnings.`);
          return;
        }
        const latest = list.slice(-MAX_WARNINGS_SHOWN).reverse()
          .map(entry => `${new Date(entry.at * 1000).toISOString().slice(0, 10)} ${entry.reason} by ${entry.by}${entry.note ? ` (${entry.note})` : ""}`);
        tell(session, `${account.username} has ${list.length} warning${list.length === 1 ? "" : "s"}. Latest: ${latest.join("; ")}`);
      },
    },
  };

  return {
    // runs `text` if it is a command. returns what to do with the chat line:
    // null to swallow it, or the text everyone should see in its place.
    run(session, text) {
      if (!text.startsWith(PREFIX)) {
        return text;
      }
      const typed = text.slice(PREFIX.length).trim().split(/\s+/);
      const [name, ...words] = typed.map(word => word.toLowerCase());
      if (Object.hasOwn(staffCommands, name) && staffMay(session, staffCommands[name].permission)) {
        staffCommands[name].run(session, typed.slice(1));
        return null;
      }
      if (Object.hasOwn(asTyped, name) && (name !== "den" || typed.length > 1)) {
        asTyped[name](session, typed.slice(1));
        return null;
      }
      if (name === "roll") {
        // said out loud, so the room can see it was not made up.
        return `(rolls a dice: ${1 + Math.floor(Math.random() * 6)})`;
      }
      if (!Object.hasOwn(commands, name)) {
        return text; // "!!!" and the like are just chat
      }
      commands[name](session, words);
      return null;
    },
    roomTitle,
    handlers: outfitHandlers,
  };
};
