"use strict";

const {logText} = require("./logtext.js");
// adventures. the engine is in the client (quest/QuestManager): it places
// the actors named in the room file and plays them. what happens when was
// decided by scripts on the official server, which no file holds, so each
// adventure here is a script written by hand from a recording of the
// official game (tools/recorder.js): lib/adventures/<name>.js says what to
// send when the player triggers an actor, answers one, and so on.
//
// players who start together from a host's lobby play one adventure
// together (see the top of the module); anyone else plays alone.

const accounts = require("./accounts.js");
const achievements = require("./achievements.js");
const config = require("../config.js");
const defpacks = require("./defpacks.js");
const dens = require("./dens.js");
const {activeAvatar, addClothing, sendClothingAdded} = require("./player.js");
const prizePools = require("./prize-pools.js");

const scripts = new Map([
  require("./adventures/training-grounds.js"),
  require("./adventures/return-of-the-phantoms.js"),
  // made with the adventure script maker from recordings of the official game
  require("./adventures/the-phantom-portal.js"),
  require("./adventures/meet-cosmo.js"),
  require("./adventures/the-hive.js"),
  require("./adventures/the-great-escape.js"),
  require("./adventures/greelys-inferno.js"),
  require("./adventures/the-search-for-greely.js"),
  // the newer adventures, written by hand (see each file)
  require("./adventures/bitter-sweets.js"),
  require("./adventures/twists-and-turns.js"),
  require("./adventures/the-forgotten-desert.js"),
  // the new-player tutorial: hidden, started only with "!tutorial" (lib/commands.js)
  require("./adventures/first-five-tutorial.js"),
  // (the old tutorial, The Blue Heron, needs a room file of its own,
  // first_five/room_firstfivetest, which this server does not have: left out)
  // the Test Labs borrow defs 16-18 (17 is Greely's Inferno, 18 The Great Escape); listed after a real adventure with the same
  // def, a Test Lab would replace it, so keep them out while testing those.
  // require("./adventures/test-lab.js"),
  // require("./adventures/test-lab-2.js"),
  // require("./adventures/test-lab-3.js"),
// (a script may have a key of its own, to share a def with another)
].map(script => [script.key || script.defId, script]));
// hard mode: played instead of the adventure with the same def when the
// player picks hard
for (const hard of [
  require("./adventures/return-of-the-phantoms-hard.js"),
  require("./adventures/the-phantom-portal-hard.js"),
  require("./adventures/meet-cosmo-hard.js"),
  require("./adventures/the-hive-hard.js"),
]) {
  const normal = scripts.get(hard.defId);
  if (normal) {
    normal.hard = hard;
  }
}

// every room the script goes to is one the game has (a missing one would
// leave the player between rooms)
const roomsThere = script => Object.values(script.rooms).every(place => defpacks.roomDef(place.room));

const LIST_ADVENTURES = 201; // the adventure list's rows: script def ids
const ROOM_TYPE_QUEST = 7;
const CURRENCY_GEMS = 0;
const MAX_LEVEL = 100;

const HEARTS = 6; // a player's health, and what a phantom's zap takes of it
const ZAP = 2;
// hearts a boss's attack costs (the Phantom King's slam)
const BOSS_HIT = 3;
const MAX_PARTY = 4; // the most a private lobby holds (its window has four places)
const GIFT_DEN_ITEM = 1;
const GIFT_CLOTHING = 2;
const GIFT_GEMS = 3;

// a piece of clothing into the player's inventory, in the colour the prize
// named (the item list the game asks for shows it from then on)
// a piece of clothing won: made as the shops make it (player.js addClothing:
// the account's next inventory id, and "on", the animals wearing it), and
// shown in the player's inventory at once when `session` is given
const giveClothing = (account, def, colour, session = null) => {
  const item = addClothing(account, Number(def), Number(colour) || 0);
  accounts.save(account);
  if (session && item) {
    sendClothingAdded(session, item);
  }
};


// the XP a level starts at. the recordings show three levels: 50 XP to
// level 1, 200 more to level 2, and about 450 more to level 3 (5 XP into
// level 2 shown as 1%, 55 as 12%). that is 50 times the level squared, and
// the levels after are taken to go on so.
const levelXp = level => 50 * level * (level + 1) * (2 * level + 1) / 6;
const levelFor = xp => {
  let level = 0;
  while (level < MAX_LEVEL && xp >= levelXp(level + 1)) {
    level++;
  }
  return level;
};
const xpOf = avatar => Math.max(avatar.questXp || 0, levelXp(avatar.questLevel || 0));
// how far through its level, in percent (QuestManager.handleXpUpdate).
const percent = xp => {
  const level = levelFor(xp);
  return Math.round((xp - levelXp(level)) * 100 / (levelXp(level + 1) - levelXp(level)));
};

module.exports = ({enterRoom, joinRoom, tell}) => {
  // each player in an adventure has a record of their own (session.quest:
  // the room they are in, what they carry, their hearts, seeds and prizes),
  // and the records of those playing together share a group (quest.group:
  // the script, its variables, how each actor looks, who is playing). the
  // group's rooms are shared, so players in the same one see each other; a
  // player alone is a group of one.
  const playing = session => (session.quest && session.room === session.quest.room ? session.quest : null);
  const members = group => group.players.filter(player => player.quest && player.quest.group === group);
  // what goes only to the player whose doing it was (from a recording of
  // four playing Meet Cosmo): their seed bag, a chest opening, their music
  // and moves to other rooms, the item taken from their hands, the way out.
  // everything else the scripts send goes to the whole group.
  const personal = (cmd, fields) => cmd === "qseed" || cmd === "qatt" || cmd === "qmusic" || cmd === "qgi"
    || (cmd === "qcmd" && [7, 14, 19].includes(Number(fields[0])));
  // the hard version of an adventure, if it has one and hard was picked
  const pick = (chosen, difficulty) => (difficulty === 1 && chosen.hard ? chosen.hard : chosen);
  let nextGroup = 1;
  // groups of the newer adventures that others may still join (see qj)
  let openGroups = [];
  setInterval(() => {
    openGroups = openGroups.filter(group => members(group).length > 0);
  }, 60000).unref();
  const newGroup = (script, difficulty, players) => ({id: nextGroup++, stamp: Date.now(), script, difficulty, players,
    vars: {}, loaded: false, shown: {}, vt: {}, plants: 0});

  // QuestManager.handleXpUpdate: [earned, total, level before, level now,
  // percent, the actor the number floats over].
  const giveXp = (session, amount, actor) => {
    const avatar = activeAvatar(session.account);
    const before = xpOf(avatar);
    const level = levelFor(before);
    avatar.questXp = before + amount;
    avatar.questLevel = levelFor(avatar.questXp);
    if (amount > 0) {
      accounts.save(session.account);
    }
    session.sendXt("quxp", -1, amount, avatar.questXp, level, avatar.questLevel, percent(avatar.questXp), actor);
    if (avatar.questLevel > level) {
      // A new level: full health, the animal's numbers, then the level.
      session.quest.hearts = HEARTS;
      session.sendXt("quhp", -1, session.id, 100, HEARTS, HEARTS, HEARTS);
      session.sendXt("qusu", -1, 10, 200, 1, 200);
      session.sendXt("qulu", -1, session.id, avatar.questLevel);
    }
  };

  // `key` is the actor whose trigger (or pickup...) this is; `own` is for a
  // chest: what "once" remembers about it is each player's own, so every
  // player may open every chest.
  const tools = (session, quest, key = null, own = false) => {
    const group = quest.group;
    const mine = () => session.quest === quest;
    const vars = !own ? group.vars : new Proxy(group.vars, {
      get: (target, name) => (name === "done" ? quest.done : target[name]),
      set: (target, name, value) => {
        if (name === "done") {
          quest.done = value;
        }
        else {
          target[name] = value;
        }
        return true;
      },
    });
    const q = {
      me: session.id,
      vars,
      // what the seed bag holds: {count, max}, or null before any "qseed"
      seeds(seed) {
        const bag = (quest.seeds || {})[seed];
        return bag ? {count: bag.count, max: bag.max} : null;
      },
      send(cmd, ...fields) {
        if (personal(cmd, fields)) {
          if (!mine()) {
            return;
          }
          // the seed bag: what "qseed" says the player has, for planting ("qps")
          if (cmd === "qseed") {
            quest.seeds = quest.seeds || {};
            quest.seeds[fields[0]] = {count: Number(fields[1]), max: Number(fields[2])};
          }
          session.sendXt(cmd, -1, ...fields);
          return;
        }
        const everyone = members(group);
        if (!everyone.length) {
          return;
        }
        // how each actor was last set ([state, visible, needs a click]), for a
        // player who arrives late and for "!adv"
        if (cmd === "qcmd" && Number(fields[0]) === 1) {
          const name = String(fields[1]);
          group.shown[name] = fields.slice(2, 5).map(Number);
          // an item put away (the watering pail, once the last plant is
          // watered) leaves the hands of everyone carrying one
          if (Number(fields[3]) === 0) {
            for (const player of everyone) {
              if (player !== session && player.quest.held === name) {
                player.quest.held = null;
                player.sendXt("qcmd", -1, 7);
              }
            }
          }
        }
        if (cmd === "qcmdVT" && Number(fields[0]) === 1) {
          // how many are playing: the client goes by it
          if (String(fields[1]) === "players") {
            fields = [fields[0], fields[1], everyone.length, ...fields.slice(3)];
          }
          group.vt[String(fields[1])] = fields;
        }
        for (const player of everyone) {
          player.sendXt(cmd, -1, ...fields);
        }
      },
      after(ms, action) {
        setTimeout(() => {
          try {
            if (members(group).length) {
              action();
            }
          }
          catch (err) {
            console.error(`[adventure] ${group.script.title}: a timed step failed: ${err.stack}`);
          }
        }, ms).unref();
      },
      // XP for what a player did themselves (watering a plant, freeing a
      // bunny: it floats over that actor) is theirs; XP for what the group
      // got done (the last plant watered, the boss beaten) is everyone's.
      xp(amount, actor = "") {
        const who = actor && actor === key ? (mine() ? [session] : []) : members(group);
        for (const player of who) {
          giveXp(player, amount, actor);
        }
      },
      // what the player carries (an actor's name), and using it up:
      // command 7 takes it out of their hands.
      held: () => quest.held,
      use() {
        quest.held = null;
        q.send("qcmd", 7);
      },
      // goes to another of the adventure's rooms, to stand at `spawn`. only
      // this player goes; the others are told where they are ("qrc").
      room(roomKey, spawn) {
        if (!mine()) {
          return;
        }
        const place = group.script.rooms[roomKey];
        q.send("qcmd", 14, 0, spawn);
        const room = enter(session, group, place);
        if (room) {
          quest.room = room;
          quest.place = roomKey;
          q.send("qmusic", place.music);
          for (const player of members(group)) {
            if (player !== session) {
              player.sendXt("qrc", -1, session.id, room.name, 0, 0);
            }
          }
        }
      },
      // the prizes to choose from at the end, for each player to pick their
      // own: [GIFT_DEN_ITEM, def id, 0] or [GIFT_GEMS, amount, amount] each
      // (QuestManager.handlePickGift).
      offer(gifts) {
        gifts = prizePools.reroll(group.script, group.difficulty, gifts); // picked at random where the official game does
        for (const player of members(group)) {
          player.quest.gifts = gifts;
          player.quest.gift = null;
          player.sendXt("qpgift", -1, gifts.length, 0, ...gifts.flat());
        }
      },
      // to this player only, whatever it is (an adventure's own talk, music, a page of its progress)
      tell(cmd, ...fields) {
        if (mine()) {
          session.sendXt(cmd, -1, ...fields);
        }
      },
      // the orbs this player has gathered (the newer adventures: "qporbs" is
      // the count on their screen); `more` adds to it
      orbs(more = 0) {
        quest.orbs = (quest.orbs || 0) + more;
        if (more) {
          q.tell("qporbs", quest.orbs);
        }
        return quest.orbs;
      },
      // a prize for this player alone to pick from ("qpgiftplr": [how many,
      // 2, then kind, item, colour for each]; kind 1 a den item, 2 clothing)
      offerOwn(gifts) {
        if (mine()) {
          quest.gifts = gifts;
          quest.gift = null;
          q.tell("qpgiftplr", gifts.length, 2, ...gifts.flat());
        }
      },
      // a piece of clothing for this player, in a colour
      clothes(def, colour = 0) {
        if (mine()) {
          giveClothing(session.account, def, colour, session);
        }
      },
      // who is playing (their ids), and the tools for one of them by id
      players: () => members(group).map(player => player.id),
      as(id) {
        const player = members(group).find(other => other.id === id);
        return player ? tools(player, player.quest, key) : null;
      },
      level: () => levelFor(xpOf(activeAvatar(session.account))),
      // true in hard mode
      hard: () => group.difficulty === 1,
      gems(amount) {
        const {account} = session;
        account.currency.gems = (account.currency.gems || 0) + amount;
        achievements.currencyChanged(account, "gems", amount);
        accounts.save(account);
        session.sendXt("cu", -1, CURRENCY_GEMS, account.currency.gems, 0);
      },
    };
    return q;
  };

  const run = (session, kind, key, ...args) => {
    const quest = playing(session);
    if (!quest) {
      return;
    }
    const {script} = quest.group;
    const table = script.on[kind];
    // A script may answer a whole family of actors: [pattern, handler] in
    // "<kind>Like", the handler given the actor's name.
    const family = key === null ? null : (script.on[`${kind}Like`] || []).find(([pattern]) => pattern.test(key));
    const handler = key === null ? table : (table || {})[key];
    const q = () => tools(session, quest, key, kind === "opened");
    if (handler) {
      handler(q(), ...args);
    }
    else if (family) {
      family[1](q(), key, ...args);
    }
    else if (key !== null && kind !== "pickedUp" && kind !== "untriggered") {
      console.log(`[adventure] ${logText(script.title)}: nothing written for "${logText(kind)} ${logText(key)}"`);
    }
  };

  // the group's rooms: the same name for all of them, so they are together
  const enter = (session, group, place) => enterRoom(session, `quest_${group.id}_${group.script.defId}_${group.stamp}__${place.room}`,
    place.room, place.name, config.shards[0].id, {roomType: ROOM_TYPE_QUEST, secondaryDefId: group.script.defId, nameStringId: place.nameStringId,
      joinFlags: [0, 1, 0, 1, 0]}); // a game room, and temporary

  // QuestXtCommManager.questStartResponse: [script def, players, actor
  // count, when the script was written, then for each actor its name,
  // type, def id (a name for type 16), state, visible, needs a click, path,
  // and the state of its artwork]. the room join follows it.
  // difficulty 1 is hard mode: a script with a "hard" version plays that
  // one instead (both use the same script def). `group` is the players
  // starting together (a host's lobby); without one the player is alone.
  const start = (session, chosen, difficulty = 0, group = null) => {
    const script = pick(chosen, difficulty);
    group = group || newGroup(script, difficulty, [session]);
    const returnTo = session.room.name;
    session.questLobby = null;
    // "live_players" starts at how many are playing: the client only shares
    // its phantoms' moves ("qau") with more than one (QuestManager.livePlayerCount)
    const actors = script.actors.map(row => (row[0] === "live_players" ? [row[0], row[1], row[2], group.players.length, ...row.slice(4)] : row));
    session.sendXt("qs", session.room.id, script.defId, group.players.length, actors.length, script.written, ...actors.flat());
    if (script.objective) {
      session.sendXt("qcmd", -1, 38, script.objective);
    }
    // a fade in as the room comes up (QuestManager.handleFade)
    if (script.fadeIn) {
      session.sendXt("qfade", -1, 1);
    }
    session.sendXt("qmusic", -1, script.rooms.start.music);
    const room = enter(session, group, script.rooms.start);
    if (!room) {
      return;
    }
    // script, difficulty, vars and shown are the group's, here too for short
    session.quest = {group, script, difficulty, vars: group.vars, shown: group.shown, room, returnTo, held: null, hearts: HEARTS,
      gifts: null, gift: null, seeds: null, place: "start", god: false, synced: false};
    giveXp(session, 0, "");
  };

  // one who arrives after the group's adventure began is told how
  // everything looks now: each actor, each count, the goal
  const resync = (session, group) => {
    for (const [name, look] of Object.entries(group.shown)) {
      session.sendXt("qcmd", -1, 1, name, ...look);
    }
    for (const fields of Object.values(group.vt)) {
      session.sendXt("qcmdVT", -1, ...fields);
    }
    if (group.vars.goal) {
      session.sendXt("qcmd", -1, 38, group.vars.goal);
    }
  };

  // out of the adventure (gone back, or offline): the others see them go
  // ("qplq": [who, their animal's name])
  const leaveQuest = session => {
    const quest = session.quest;
    if (!quest) {
      return;
    }
    session.quest = null;
    const {group} = quest;
    group.players = group.players.filter(player => player !== session);
    const avatar = activeAvatar(session.account);
    const left = members(group);
    for (const player of left) {
      player.sendXt("qplq", -1, session.id, (avatar && avatar.name) || "");
      // one fewer playing, as the official server says it
      player.sendXt("qcmd", -1, 1, "live_players", left.length, 0, 0);
    }
    group.shown.live_players = [left.length, 0, 0];
  };
  // what one player's game says to the others in the same room of the
  // adventure, passed on as it is (phantoms moving, a swipe, a plant biting)
  const relay = (session, cmd, fields) => {
    const quest = playing(session);
    if (!quest) {
      return;
    }
    const {group} = quest;
    // once per group and kind, in the server's log: shows it is getting through
    group.relayed = group.relayed || new Set();
    if (!group.relayed.has(cmd) && members(group).length > 1) {
      group.relayed.add(cmd);
      console.log(`[adventure] ${logText(group.script.title)}: passing "${cmd}" between ${members(group).length} players`);
    }
    for (const player of members(group)) {
      if (player !== session && player.room === session.room) {
        player.sendXt(cmd, -1, ...fields);
      }
    }
  };
  // to everyone in the player's group
  const toGroup = (session, cmd, ...fields) => {
    const quest = playing(session);
    for (const player of quest ? members(quest.group) : [session]) {
      player.sendXt(cmd, -1, ...fields);
    }
  };

  // hosting. "Create" in the adventure window opens a private lobby, and
  // the host gets the adventure's bubble (a chat message of type 11:
  // "<script def>,<host>,<difficulty>|on", or "off"), which anyone in the
  // room can click to wait with them (UserCommXtCommManager.userCommChatResponse).
  // the server sends the bubble itself; the client's own "on"/"off" is
  // dropped by lib/world.js.
  const bubble = (host, on, lobby = host.hosting) => {
    const room = (lobby && lobby.room) || host.room;
    if (!room || !room.sessions) {
      return;
    }
    const text = on && lobby ? `${lobby.script.defId},${host.id},${lobby.difficulty}|on` : "off";
    for (const viewer of room.sessions) {
      // "off" to the host would close their own lobby window as well
      if (on || viewer !== host) {
        viewer.sendXt("uc", room.id, host.id, text, 11, 0);
      }
    }
  };
  // who is waiting, to everyone waiting: [room, their ids]
  const waiting = lobby => {
    lobby.players = lobby.players.filter(player => player.room === lobby.room && !playing(player));
    const ids = lobby.players.map(player => player.id);
    for (const player of lobby.players) {
      player.sendXt("qw", lobby.room.id, ...ids);
    }
  };
  // out of whatever lobby the player is in: a host's ends (and its bubble),
  // one who joined is taken off the host's list
  const leaveLobby = session => {
    const lobby = session.hosting;
    if (lobby) {
      session.hosting = null;
      bubble(session, false, lobby);
      for (const player of lobby.players) {
        if (player !== session && player.lobbyHost === session) {
          player.lobbyHost = null;
          player.questLobby = null;
          player.sendXt("qjx", -1, 1);
        }
      }
    }
    const host = session.lobbyHost;
    if (host && host.hosting) {
      host.hosting.players = host.hosting.players.filter(player => player !== session);
      waiting(host.hosting);
    }
    session.lobbyHost = null;
  };

  const handlers = {
    // QuestXtCommManager.sendQuestCreateJoinPublic: [room, script def,
    // difficulty, 0]. A refusal is [0, reason]; "NV" is "Failed to join!".
    qj(session, roomId, [, defId, difficulty], private_ = false) {
      const script = scripts.get(Number(defId));
      if (!script || !roomsThere(script) || !session.room || playing(session)) {
        session.sendXt("qj", -1, 0, "NV");
        if (!script) {
          tell(session, "That adventure is not on this server yet.");
        }
        return;
      }
      const mode = Number(difficulty) === 1 ? 1 : 0;
      if (!script.lobby) {
        leaveLobby(session);
        // the newer adventures fill up while they run: a player joins one
        // already going, if one has room
        const open = script.public ? openGroups.find(group => group.script === pick(script, mode) && group.difficulty === mode
          && members(group).length > 0 && members(group).length < (script.maxPlayers || 8)) : null;
        if (open) {
          open.players.push(session);
          start(session, script, mode, open);
          // everyone's count of players goes up
          for (const player of members(open)) {
            player.sendXt("qcmd", -1, 1, "live_players", members(open).length, 0, 0);
          }
          open.shown.live_players = [members(open).length, 0, 0];
          return;
        }
        start(session, script, mode);
        if (script.public && session.quest) {
          openGroups.push(session.quest.group);
        }
        return;
      }
      // an adventure for several waits for its players: [1, 1, script
      // def, 0], then who is waiting ("qw"). the player's own Start
      // button, or the client by itself, then asks to begin ("qs").
      leaveLobby(session);
      session.questLobby = script;
      session.questDifficulty = mode;
      // the last is the difficulty: 1 has the client show it as hard
      session.sendXt(private_ ? "qjc" : "qj", session.room.id, 1, 1, script.defId, mode);
      if (private_) {
        session.hosting = {script, difficulty: mode, room: session.room, players: [session]};
        bubble(session, true);
        waiting(session.hosting);
      }
      else {
        session.sendXt("qw", session.room.id, session.id);
      }
    },
    // QuestXtCommManager.sendQuestStartRequest: [room]. the host's Play
    // starts everyone waiting with them; one who joined waits for the host.
    qs(session) {
      if (session.lobbyHost || !session.questLobby || !session.room || playing(session)) {
        return;
      }
      const lobby = session.hosting;
      if (!lobby) {
        start(session, session.questLobby, session.questDifficulty || 0);
        return;
      }
      session.hosting = null;
      bubble(session, false, lobby);
      // all of them in one adventure together
      const players = lobby.players.filter(player => player === session
        || (player.lobbyHost === session && player.room === lobby.room && !playing(player)));
      const group = newGroup(pick(lobby.script, lobby.difficulty), lobby.difficulty, players);
      for (const player of players) {
        player.lobbyHost = null;
        start(player, lobby.script, lobby.difficulty, group);
      }
    },
    // ... and leaving the wait
    qjx(session) {
      leaveLobby(session);
      session.questLobby = null;
      session.sendXt("qjx", -1, 1);
    },
    // QuestXtCommManager.sendQuestCreatePrivate ("Create" in the adventure
    // window): [room, script def, difficulty]. answered as "qjc", which has
    // the client open the private lobby (custSettings); the server puts the
    // adventure's bubble over the host for the room to click.
    qjc(session, roomId, params) {
      handlers.qj(session, roomId, params, true);
    },
    // QuestXtCommManager.sendQuestJoinPrivate, the adventure bubble over a
    // host clicked: [room, the host's name]. answered [1, 1, script def,
    // difficulty] (custParty: the lobby without a Play button), then who is
    // waiting, to everyone in it.
    qjp(session, roomId, [, hostName]) {
      const name = String(hostName || "").toLowerCase();
      const host = session.room && [...(session.room.sessions || [])].find(other => other.hosting && other !== session
        && [other.account && other.account.username, other.username].some(n => n && String(n).toLowerCase() === name));
      const lobby = host && host.hosting;
      if (!lobby || playing(session) || lobby.players.length >= MAX_PARTY) {
        session.sendXt("qjp", -1, 0, "NV");
        return;
      }
      leaveLobby(session);
      session.questLobby = lobby.script;
      session.questDifficulty = lobby.difficulty;
      session.lobbyHost = host;
      lobby.players.push(session);
      session.sendXt("qjp", session.room.id, 1, 1, lobby.script.defId, lobby.difficulty);
      waiting(lobby);
    },
    // QuestXtCommManager.sendQuestPrivateKick: [name], the host sending one away
    qjk(session, roomId, [name]) {
      const lobby = session.hosting;
      const wanted = String(name || "").toLowerCase();
      const player = lobby && lobby.players.find(other => other !== session
        && [other.account && other.account.username, other.username, String(other.id)].some(n => n && String(n).toLowerCase() === wanted));
      if (player) {
        leaveLobby(player);
        player.questLobby = null;
        player.sendXt("qjx", -1, 1);
      }
    },

    // "What was moved?", once the room is up: nothing is answered, and it
    // is where a script begins.
    // In a group the first to arrive starts it; the others are brought up to date.
    qmi(session) {
      const quest = playing(session);
      if (!quest) {
        return;
      }
      const {group} = quest;
      if (!group.loaded) {
        group.loaded = true;
        quest.synced = true;
        run(session, "loaded", null);
      }
      else if (!quest.synced) {
        quest.synced = true;
        resync(session, group);
      }
    },

    // [actor, 0]: walked into, or clicked
    qat(session, roomId, [actor]) {
      // the client's answer to the count of players changing: nothing to do
      if (String(actor) === "live_players") {
        return;
      }
      run(session, "trigger", String(actor));
    },
    // [actor]: the player stopped what set off a trigger (left a pad,
    // stopped hopping on it): "untriggered"
    qaut(session, roomId, [actor]) {
      run(session, "untriggered", String(actor));
    },
    // [actor, ...]: the player hit an actor (a web, a crate...); what that does
    // is the script's ("attacked")
    // With no actor, [ "", 1, enemy, 0, 0 ], it is the other way round: a
    // boss's attack (the Phantom King's slam) landed on the player, which costs
    // 3 hearts, as on the official server.
    qaa(session, roomId, [actor, hit, , x, y]) {
      if (String(actor) === "") {
        const quest = playing(session);
        if (!quest || quest.god || quest.hearts <= 0 || String(hit) !== "1") {
          return;
        }
        const lost = Math.min(BOSS_HIT, quest.hearts);
        quest.hearts -= lost;
        session.sendXt("quhp", -1, session.id, Math.floor(quest.hearts * 100 / HEARTS), -lost, quest.hearts, HEARTS);
        if (quest.hearts === 0) {
          session.sendXt("qpd", -1, session.id);
        }
        return;
      }
      // where it was hit, for the newer adventures' pods ([actor, 0, 123, x, y])
      run(session, "attacked", String(actor), ...[x, y].filter(v => /^-?\d+$/.test(String(v))).map(Number));
    },
    // [seed, x, y]: a seed planted. One fewer in the bag, and a plant grows
    // where the player clicked: [1, who, plant, seed, x, y, who], the plants
    // named plant__0_, plant__1_... as the official server names them.
    qps(session, roomId, [seed, x, y]) {
      const quest = playing(session);
      if (!quest || ![seed, x, y].every(value => /^-?\d+$/.test(value))) {
        return;
      }
      const bag = (quest.seeds || {})[seed];
      const who = session.account.username || session.account.name || session.username || "";
      if (!bag || bag.count <= 0) {
        // no seeds left: [0, who], as the official server answers
        session.sendXt("qps", -1, 0, who);
        return;
      }
      bag.count--;
      // the plants' names are the group's: plant__0_, plant__1_... whoever planted them
      const plant = `plant__${quest.group.plants++}_`;
      session.sendXt("qseed", -1, Number(seed), bag.count, bag.max);
      toGroup(session, "qps", 1, who, plant, Number(seed), Number(x), Number(y), session.id);
      run(session, "planted", null, plant, Number(seed), Number(x), Number(y));
    },
    // a minigame the script started ("qcmd" 4) played to its end: [room]
    qfrmgdone(session) {
      run(session, "minigameDone", null);
    },
    // a cutscene ("qplayswf") played to its end
    qplayswf(session) {
      run(session, "cutsceneDone", null);
    },
    // [actor, ?, answer]: a talk read to its end
    qaskr(session, roomId, [actor, state, answer]) {
      run(session, "answer", String(actor), String(state), String(answer));
    },
    // [actor, state]: an actor's own change of mind (a phantom noticing the
    // player, giving up), which the server only passes round:
    // QuestManager.handleQuestActorRequestSeekResponse [actor, state, who].
    qas(session, roomId, [actor, state]) {
      if (playing(session) && /^-?\d+$/.test(state)) {
        toGroup(session, "qas", String(actor), Number(state), session.id);
      }
    },
    // [actor, x, y, ...]: where a phantom the player's game moves has got
    // to, for the others in the room (QuestManager.handleQuestActorPositionUpdateResponse)
    qau(session, roomId, params) {
      relay(session, "qau", params.slice(0, 8).map(String));
    },
    // a swipe of the player's: [type, x, y, ?, who, ?], for the others (QuestManager.handleSwipe)
    qm(session, roomId, params) {
      relay(session, "qm", params.slice(0, 6).map(String));
    },
    // QuestXtCommManager.questPickUpItem: [actor, who]. answered [1, actor,
    // who] (QuestManager.handlePickUpItem); with something in hand already
    // it is [0, actor], which has the client ask whether to drop that.
    qpup(session, roomId, [actor]) {
      const quest = playing(session);
      const name = String(actor);
      if (!quest || !quest.script.actors.some(row => row[0] === name)) {
        return;
      }
      const refill = quest.script.refills;
      if (quest.held && !(refill && refill.test(quest.held) && refill.test(name))) {
        session.sendXt("qpup", -1, 0, name, "null");
        return;
      }
      quest.held = name;
      toGroup(session, "qpup", 1, name, session.id);
      run(session, "pickedUp", name);
    },
    // "Yes, drop it": [x, y, the actor wanted, who]. what was held is put
    // down there ([4, actor, who, x, y, 0, 150, who, the one wanted]) and
    // the other picked up.
    qdroppup(session, roomId, [x, y, actor]) {
      const quest = playing(session);
      const name = String(actor);
      if (!quest || !quest.held || ![x, y].every(value => /^-?\d+$/.test(value)) || !quest.script.actors.some(row => row[0] === name)) {
        return;
      }
      toGroup(session, "qpup", 4, quest.held, session.id, Number(x), Number(y), 0, 150, session.id, name);
      quest.held = name;
      toGroup(session, "qpup", 1, name, session.id);
      run(session, "pickedUp", name);
    },

    // A phantom has zapped the player: [phantom, who, x, y], which goes
    // back after the player's health, [who, percent, change, hearts, of]
    // (QuestManager.handleHealthUpdate). at none the player is down ("qpd").
    qpzap(session, roomId, [phantom, , x, y]) {
      const quest = playing(session);
      if (!quest || quest.hearts <= 0 || ![x, y].every(value => /^-?\d+$/.test(value))) {
        return;
      }
      if (quest.god) {
        session.sendXt("qpzap", -1, String(phantom), session.id, Number(x), Number(y));
        return;
      }
      quest.hearts = Math.max(0, quest.hearts - ZAP);
      session.sendXt("quhp", -1, session.id, Math.floor(quest.hearts * 100 / HEARTS), -ZAP, quest.hearts, HEARTS);
      if (quest.hearts === 0) {
        // down: what the player carried falls where they stood, [3, actor,
        // who, x, y], and can be picked up again (as the official server
        // does; a key dropped this way stays where it fell)
        if (quest.held) {
          toGroup(session, "qpup", 3, quest.held, session.id, Number(x), Number(y));
          quest.held = null;
        }
        session.sendXt("qpd", -1, session.id);
      }
      session.sendXt("qpzap", -1, String(phantom), session.id, Number(x), Number(y));
    },
    // A sentry's beam caught the player: [sentry, who]. On the official server
    // that takes every heart at once, and the player is down.
    qbzap(session) {
      const quest = playing(session);
      if (!quest || quest.god || quest.hearts <= 0) {
        return;
      }
      const lost = quest.hearts;
      quest.hearts = 0;
      session.sendXt("quhp", -1, session.id, 0, -lost, 0, HEARTS);
      session.sendXt("qpd", -1, session.id);
    },
    // ... and asks to get up again: [0, x, y], a place of the client's
    // choosing. [who, percent, hearts three times, x, y], then "qprr" 6.
    qprr(session, roomId, [, x, y]) {
      const quest = playing(session);
      if (!quest || quest.hearts > 0 || ![x, y].every(value => /^-?\d+$/.test(value))) {
        return;
      }
      quest.hearts = HEARTS;
      session.sendXt("qrspn", -1, session.id, 100, HEARTS, HEARTS, HEARTS, Number(x), Number(y));
      session.sendXt("qprr", -1, HEARTS);
    },

    // the prize picked from those offered: [which, ?, ?], then "done".
    qpgift(session, roomId, [index]) {
      const quest = playing(session);
      if (quest && quest.gifts && quest.gift === null && /^\d+$/.test(index) && Number(index) < quest.gifts.length) {
        quest.gift = quest.gifts[Number(index)];
      }
    },
    // ... the same from a "qpgiftplr" offer: [which, 0, 0]
    qpgiftplr(session, roomId, [index]) {
      handlers.qpgift(session, roomId, [index]);
    },
    qpgiftdone(session) {
      const quest = playing(session);
      if (!quest || !quest.gift) {
        return;
      }
      const [kind, value, colour] = quest.gift;
      quest.gifts = quest.gift = null;
      if (kind === GIFT_DEN_ITEM) {
        dens.giveDenItem(session.account, value);
        dens.sendDenItems(session);
      }
      else if (kind === GIFT_GEMS) {
        tools(session, quest).gems(value);
      }
      else if (kind === GIFT_CLOTHING) {
        giveClothing(session.account, value, colour, session);
      }
      run(session, "gifted", null);
    },

    // [plant, phantom]: a chomper plant has caught one; the others see it
    qpa(session, roomId, [plant, phantom]) {
      relay(session, "qpa", [String(plant), String(phantom || "")]);
    },
    // [plant, phantom, x, y]: ... and eaten it
    qep(session, roomId, [plant, phantom, x, y]) {
      if (playing(session) && [x, y].every(value => /^-?\d+$/.test(value))) {
        run(session, "eaten", null, String(plant), String(phantom), Number(x), Number(y));
      }
    },
    // [actor, 0] is answered by the script when the chest is triggered
    // ("qat"); [actor, 1] is the chest opened.
    qatt(session, roomId, [actor, opened]) {
      if (opened === "1") {
        run(session, "opened", String(actor));
      }
    },

    // QuestXtCommManager.sendQuestExit. the official game goes to the
    // Adventure Base Camp; here it is back to where the player came from.
    qx(session) {
      const quest = playing(session);
      if (quest) {
        leaveQuest(session);
        // the tutorials end with the game's own end ("qxt ffm"): it shows its
        // buttons again and goes to Jamaa (or the den) by itself, with "What
        // would you like to do next?", so the server sends it nowhere
        if (quest.script.exitType) {
          session.sendXt("qxt", -1, quest.script.exitType);
          return;
        }
        joinRoom(session, quest.returnTo);
      }
    },
  };

  // "!adv": quick commands for testing an adventure (staff only; see
  // lib/commands.js). the chat box lets no "_" through, so an actor is
  // named without it: "!adv tp bunnykey1a" finds bunny_key_1a. what it has
  // to say comes back as text for a message box.
  const norm = text => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  const actorsLike = (quest, word) => {
    const wanted = norm(word);
    const names = quest.script.actors.map(row => String(row[0]));
    const exact = names.filter(name => norm(name) === wanted);
    return exact.length ? exact : names.filter(name => norm(name).includes(wanted));
  };
  // [state, visible, needs a click]: as last set, or as the adventure began
  const lookOf = (quest, name) => {
    if (quest.shown && quest.shown[name]) {
      return quest.shown[name];
    }
    const row = quest.script.actors.find(r => String(r[0]) === name);
    return row ? [Number(row[3]), Number(row[4]), Number(row[5])] : [0, 0, 0];
  };
  const brief = (quest, name) => {
    const [state, visible, click] = lookOf(quest, name);
    return `${name} (${visible ? "shown" : "hidden"}${click ? ", clickable" : ""}, state ${state})`;
  };
  const listOf = (names, most = 12) => names.slice(0, most).join(", ") + (names.length > most ? ` and ${names.length - most} more` : "");
  // the one actor meant: an exact name, or the only one with it in its name
  const oneActor = (quest, word) => {
    if (!word) {
      return {error: "Name an actor (without the _). !adv list WORD shows names."};
    }
    const names = actorsLike(quest, word);
    if (names.length === 1 || (names.length && norm(names[0]) === norm(word))) {
      return {name: names[0]};
    }
    return {error: names.length ? `Which one? ${listOf(names)}` : `No actor has "${word}" in its name.`};
  };
  // the prizes a script offers at its end (found in its own text)
  const prizesOf = script => {
    for (const kind of Object.values(script.on || {})) {
      for (const handler of typeof kind === "function" ? [kind] : Object.values(kind || {}).flat()) {
        const found = typeof handler === "function" && String(handler).match(/q\.offer\((\[\[[\d,\[\]\s-]*\]\])\)/);
        if (found) {
          return JSON.parse(found[1]);
        }
      }
    }
    return null;
  };
  const HELP = "!adv start DEF [hard] | where | list WORD | tp WORD [n] | fire NAME | answer NAME | eat NAME | give NAME | drop | goal [ID] | "
    + "heal | god | seeds N [SEED] | room KEY | vars | prize | exit";
  const debug = (session, words) => {
    const quest = playing(session);
    const [what = "help", ...rest] = words.map(String);
    const verb = what.toLowerCase();
    // "!adv start DEF [hard]": starts an adventure as if picked from the list (a public one joins
    // a run already going); with no number, the adventures on this server
    if (verb === "start") {
      const listed = [...new Set(scripts.values())].filter(script => !script.hidden);
      const def = Number(rest[0]);
      if (!def) {
        return `!adv start DEF [hard]: ${listOf(listed.map(script => `${script.defId} ${script.title}`), 40)}`;
      }
      if (quest) {
        return "Leave this adventure first.";
      }
      if (!scripts.get(def)) {
        return `No adventure ${def} here. !adv start shows the list.`;
      }
      handlers.qj(session, session.room && session.room.id, [0, def, /^(1|hard)$/i.test(rest[1] || "") ? 1 : 0]);
      return `Starting ${scripts.get(def).title}${scripts.get(def).public ? " (joins a run already going, if there is one)" : ""}.`;
    }
    if (verb === "help" || !quest) {
      return quest ? HELP + ownHelp(quest) : `Not in an adventure. ${HELP}`;
    }
    const q = tools(session, quest);
    // an adventure's own commands ("debug" in its script: the timer, the
    // shards or orbs, what takes several players), checked first
    const own = quest.script.debug && Object.hasOwn(quest.script.debug, verb) && verb !== "help" ? quest.script.debug[verb] : null;
    if (own) {
      return own(q, rest) || "Done.";
    }
    const word = rest.join(" ");
    switch (verb) {
      case "where": {
        const variants = Object.values(quest.vars.variants || {});
        return [`${quest.script.title}${quest.difficulty === 1 && !/hard/i.test(quest.script.title) ? " (hard)" : ""}, room "${quest.place || "start"}" (${Object.keys(quest.script.rooms).join(", ")})`,
          `${members(quest.group).length} playing, goal ${quest.vars.goal || quest.script.objective}, hearts ${quest.hearts}/${HEARTS}${quest.god ? " (god)" : ""}, holding ${quest.held || "nothing"}`,
          variants.length ? `random spots this time: ${variants.join(", ")}` : "no random spots"].join(" | ");
      }
      case "list": {
        const names = word ? actorsLike(quest, word) : quest.script.actors.map(row => String(row[0]));
        const shown = names.filter(name => lookOf(quest, name)[1]);
        return names.length ? `${names.length} found, ${shown.length} shown: ${listOf(names.map(name => brief(quest, name)), 8)}` : `No actor has "${word}" in its name.`;
      }
      case "tp": {
        const numbered = rest.length > 1 && /^\d+$/.test(rest[rest.length - 1]);
        const pick = numbered ? Math.max(1, Number(rest[rest.length - 1])) : 1;
        const names = actorsLike(quest, (numbered ? rest.slice(0, -1) : rest).join(" "));
        if (!names.length) {
          return `No actor has "${word}" in its name.`;
        }
        // the server cannot know where things are, so: shown ones first, clickable first of those
        const rank = name => {
          const [, visible, click] = lookOf(quest, name);
          return (visible ? 0 : 2) + (click ? 0 : 1);
        };
        names.sort((x, y) => rank(x) - rank(y));
        const name = names[Math.min(pick, names.length) - 1];
        q.send("qcmd", 14, 1, name);
        return `To ${brief(quest, name)}${names.length > 1 ? ` (${Math.min(pick, names.length)} of ${names.length}; add a number for another)` : ""}. Nothing happens if it is in another room.`;
      }
      case "fire":
      case "answer": {
        const found = oneActor(quest, word);
        if (found.error) {
          return found.error;
        }
        run(session, verb === "fire" ? "trigger" : "answer", found.name);
        return `${verb === "fire" ? "Triggered" : "Answered"} ${found.name}.`;
      }
      case "eat": {
        const found = oneActor(quest, word);
        if (found.error) {
          return found.error;
        }
        run(session, "eaten", null, "plant__debug_", found.name, 0, 0);
        return `${found.name} eaten.`;
      }
      case "give": {
        const found = oneActor(quest, word);
        if (found.error) {
          return found.error;
        }
        quest.held = found.name;
        session.sendXt("qpup", -1, 1, found.name, session.id);
        run(session, "pickedUp", found.name);
        return `Holding ${found.name}.`;
      }
      case "drop":
        q.use();
        return "Hands empty.";
      case "goal": {
        if (!/^\d+$/.test(word)) {
          return `Goal is ${quest.vars.goal || quest.script.objective}. !adv goal ID sets the top line.`;
        }
        quest.vars.goal = Number(word);
        q.send("qcmd", 38, Number(word));
        return `Goal set to ${word}.`;
      }
      case "heal":
        quest.hearts = HEARTS;
        session.sendXt("quhp", -1, session.id, 100, HEARTS, HEARTS, HEARTS);
        return "Full health.";
      case "god":
        quest.god = !quest.god;
        if (quest.god) {
          quest.hearts = HEARTS;
          session.sendXt("quhp", -1, session.id, 100, HEARTS, HEARTS, HEARTS);
        }
        return quest.god ? "Nothing can hurt you now. !adv god again to stop." : "You can be hurt again.";
      case "seeds": {
        const [count, seed] = rest;
        const bags = Object.entries(quest.seeds || {}).filter(([id]) => !seed || id === seed);
        if (!/^\d+$/.test(count || "")) {
          return bags.length ? `Seeds: ${bags.map(([id, bag]) => `${id}: ${bag.count}/${bag.max}`).join(", ")}` : "No seed bag yet. !adv seeds N SEED gives some.";
        }
        if (!bags.length && seed) {
          bags.push([seed, {max: Number(count)}]);
        }
        if (!bags.length) {
          return "No seed bag yet: name the seed too (!adv seeds N SEED).";
        }
        for (const [id, bag] of bags) {
          q.send("qseed", Number(id), Math.min(Number(count), Math.max(bag.max, Number(count))), Math.max(bag.max, Number(count)));
        }
        return `Seeds set to ${count}.`;
      }
      case "room": {
        // "spawn_1a" and "spawn_1_a" are both "spawn1a" when typed: "_" can be written as "-" to tell them apart
        const keys = Object.keys(quest.script.rooms);
        const typed = word.toLowerCase().replace(/-/g, "_");
        const like = keys.filter(k => norm(k) === norm(word));
        const key = keys.find(k => k.toLowerCase() === typed) || (like.length === 1 ? like[0] : null);
        if (!key) {
          return `Rooms: ${Object.keys(quest.script.rooms).join(", ")}`;
        }
        q.room(key, key);
        return `Going to ${key}.`;
      }
      case "vars": {
        const text = JSON.stringify(quest.vars);
        return text.length > 600 ? `${text.slice(0, 600)}...` : text;
      }
      case "prize": {
        const prizes = prizesOf(quest.script);
        if (!prizes) {
          return "This adventure's script offers no prizes.";
        }
        q.offer(prizes);
        return "Prizes offered.";
      }
      case "exit":
        q.send("qcmd", 19);
        return "Leaving.";
      default:
        return HELP + ownHelp(quest);
    }
  };
  // what an adventure's own commands are, for "!adv help"
  const ownHelp = quest => (quest.script.debug && quest.script.debug.help ? ` || ${quest.script.title}: ${quest.script.debug.help}` : "");
  module.exports.debug = debug;
  // starts an adventure by its def, as if picked from the list (for "!tutorial")
  module.exports.play = (session, defId) => {
    const script = scripts.get(defId) || scripts.get(Number(defId));
    if (!script || !roomsThere(script) || !session.room || playing(session)) {
      return false;
    }
    leaveLobby(session);
    start(session, script, 0);
    return true;
  };

  return {
    handlers,
    // a player's health in percent, for lib/world.js's "ac" in an adventure's room
    healthOf: session => (session.quest ? Math.floor(Math.max(0, session.quest.hearts) * 100 / HEARTS) : 100),
    // lib/world.js, as a player leaves a room: a host's lobby ends, one who
    // joined is taken off its list
    // (an adventure's own room change passes through here too: the player
    // has left it only if, once that is done, they are not in its room)
    roomLeft(session) {
      if (session.hosting || session.lobbyHost) {
        leaveLobby(session);
      }
      const quest = session.quest;
      if (quest) {
        setImmediate(() => {
          if (session.quest === quest && session.room !== quest.room) {
            leaveQuest(session);
          }
        });
      }
    },
    // (hidden ones, like the tutorial, are left out)
    list: listId => (Number(listId) === LIST_ADVENTURES ? [...scripts.values()].filter(script => !script.hidden && roomsThere(script)).map(script => script.defId) : null),
  };
};

Object.assign(module.exports, {levelXp, MAX_LEVEL, HEARTS});
