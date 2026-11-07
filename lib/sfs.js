"use strict";

const {logText} = require("./logtext.js");
const crypto = require("crypto");
const fs = require("fs");
const net = require("net");
const tls = require("tls");
const config = require("../config.js");
const limits = require("./limits.js");

// SmartFoxServer 1.x wire protocol as spoken by the client's SmartFoxClient:
// messages are UTF-8, terminated by a NUL byte, and come in three flavours
// told apart by their first character:
//   <msg t='sys'><body action='..' r='roomId'>..</body></msg>   system (XML)
//   %xt%<ext>%<cmd>%<roomId>%<param>%...%                        extension (raw)
//   {"t":"xt","b":{...}}                                         extension (JSON)

const POLICY = '<cross-domain-policy><allow-access-from domain="*" to-ports="*"/></cross-domain-policy>';
const MAX_MESSAGE = 64 * 1024;
const RATE_WINDOW_MS = 10000;
// above what login writes in one go before the client reads any of it: every
// custom colour and custom item def (~4.2 MB on 2026-10-19, at the caps of
// 20000 colours and 5000 clothing), which a 4 MB limit cut off for everyone.
const MAX_BACKLOG = 16 * 1024 * 1024;
const MAX_ERRORS_PER_WINDOW = 20;
// the Create Account screens are done in a few minutes; a guest connection
// does not get to stay for as long as it keeps sending something.
const SIGNUP_LIFETIME_MS = 5 * 60000;

// the login message carries the account's login token; keep it out of the log.
const forLog = message => message.replace(/(<pword><!\[CDATA\[)[\s\S]*?(\]\]>)/, "$1(hidden)$2");

const connections = new Map(); // remote address -> open sockets
let connectionCount = 0;
const metrics = {accepted: 0, rejected: 0, floodDisconnects: 0, handlerErrors: 0};

let nextUserId = 1;

// a connection that came another way than the game port: a browser's, over a
// WebSocket on the web port (lib/websocket.js). set once start() has run.
let takeConnection = null;
const adopt = socket => {
  if (takeConnection) {
    takeConnection(socket);
  }
  else {
    socket.destroy();
  }
};

class Session {
  constructor(socket) {
    this.socket = socket;
    this.id = nextUserId++;
    this.key = null;
    this.account = null;
    this.room = null;
    this.pos = null;
    this.address = socket.remoteAddress || "";
    this.remote = `${this.address}:${socket.remotePort}`;
  }

  get name() {
    return this.account ? this.account.username : `#${this.id}`;
  }

  write(message) {
    if (this.socket.writable) {
      if (config.logPackets) {
        console.log(`[game] -> ${logText(this.name)} ${logText(message)}`);
      }
      this.socket.write(message + "\0");
      // A client that stopped reading must not pile up messages here forever.
      if (this.socket.writableLength > MAX_BACKLOG) {
        this.socket.destroy();
      }
    }
  }

  sendSys(action, roomId, body = "") {
    this.write(`<msg t='sys'><body action='${action}' r='${roomId}'>${body}</body></msg>`);
  }

  // raw extension message. the client reads params starting at index 2 of
  // [cmd, roomId, ...params].
  // "%" separates fields and NUL ends the message, so neither may appear
  // inside one: a player-chosen string could otherwise forge fields.
  sendXt(cmd, roomId, ...params) {
    this.write(`%xt%${[cmd, roomId, ...params].map(param => String(param).replace(/[%\0]/g, "")).join("%")}%`);
  }

  sendXtJson(roomId, obj) {
    this.write(JSON.stringify({t: "xt", b: {r: roomId, o: obj}}));
  }

  close() {
    this.socket.destroy();
  }
}

const parseSys = message => {
  const body = /<body action='([^']*)' r='(-?\d+)'>([\s\S]*)<\/body>/.exec(message);
  if (!body) {
    return null;
  }
  const cdata = tag => {
    const match = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(body[3]);
    return match ? match[1] : null;
  };
  return {action: body[1], roomId: Number(body[2]), raw: body[3], cdata};
};

// handlers: {sys(session, msg), xt(session, cmd, roomId, params), close(session)}
const start = handlers => new Promise((resolve, reject) => {
  const dispatch = (session, message) => {
    if (config.logPackets) {
      console.log(`[game] <- ${logText(session.name)} ${logText(forLog(message))}`);
    }
    if (message.startsWith("<policy-file-request")) {
      session.socket.end(POLICY + "\0");
      return;
    }
    if (message[0] === "<") {
      const msg = parseSys(message);
      if (!msg) {
        return;
      }
      switch (msg.action) {
        case "verChk":
          session.sendSys("apiOK", 0);
          return;
        case "rndK":
          session.key = crypto.randomBytes(16).toString("hex");
          session.sendSys("rndK", -1, `<k>${session.key}</k>`);
          return;
        default:
          handlers.sys(session, msg);
          return;
      }
    }
    if (message[0] === "%") {
      // %xt%o%rj%1%a%b% -> ["", "xt", "o", "rj", "1", "a", "b", ""]
      const parts = message.split("%");
      if (parts[1] === "xt" && parts.length >= 6) {
        handlers.xt(session, parts[3], Number(parts[4]), parts.slice(5, -1));
      }
      return;
    }
    if (message[0] === "{") {
      const body = JSON.parse(message).b || {};
      const params = Array.isArray(body.p) ? body.p : Object.values(Object(body.p));
      handlers.xt(session, String(body.c), Number(body.r), params.map(String));
    }
  };

  const onConnection = socket => {
    const address = limits.key(socket.remoteAddress);
    const open = connections.get(address) || 0;
    // Kept as a counter instead of summing every address on every new socket.
    // Under a burst of logins the old O(addresses) work delayed everyone else.
    const total = connectionCount;
    socket.on("error", () => {});
    if (open >= config.maxConnectionsPerAddress || total >= config.maxConnections) {
      metrics.rejected++;
      socket.destroy();
      return;
    }
    connections.set(address, open + 1);
    connectionCount++;
    metrics.accepted++;

    const session = new Session(socket);
    let buffer = Buffer.alloc(0);
    let windowStart = Date.now();
    let messagesInWindow = 0;
    let bytesInWindow = 0;
    let errorsInWindow = 0;
    socket.setNoDelay(true);
    console.log(`[game] ${logText(session.remote)} connected as #${logText(session.id)}`);

    // whoever connects has to log in (or start signing up) promptly, and
    // nobody may sit silent for long: the client sends keep-alives.
    const loginTimer = setTimeout(() => {
      if (!session.account && !session.signingUp) {
        socket.destroy();
      }
    }, config.loginTimeoutMs);
    const signupTimer = setTimeout(() => {
      if (!session.account) {
        socket.destroy();
      }
    }, SIGNUP_LIFETIME_MS);
    socket.setTimeout(config.idleTimeoutMs, () => socket.destroy());

    socket.on("data", chunk => {
      if (Date.now() - windowStart > RATE_WINDOW_MS) {
        windowStart = Date.now();
        messagesInWindow = 0;
        bytesInWindow = 0;
        errorsInWindow = 0;
      }
      bytesInWindow += chunk.length;
      if (bytesInWindow > config.maxBytesPerTenSeconds) {
        metrics.floodDisconnects++;
        console.log(`[game] ${logText(session.name)} disconnected for flooding`);
        socket.destroy();
        return;
      }
      // Node normally gives complete SmartFox packets in one chunk. Avoiding
      // Buffer.concat in that common case reduces allocation and GC during
      // busy logins; fragments still retain the exact old behaviour.
      buffer = buffer.length === 0 ? chunk : Buffer.concat([buffer, chunk]);
      let end;
      while ((end = buffer.indexOf(0)) !== -1) {
        if (end > MAX_MESSAGE) {
          socket.destroy();
          return;
        }
        if (++messagesInWindow > config.maxMessagesPerTenSeconds) {
          metrics.floodDisconnects++;
          console.log(`[game] ${logText(session.name)} disconnected for flooding`);
          socket.destroy();
          return;
        }
        const message = buffer.toString("utf8", 0, end);
        buffer = buffer.subarray(end + 1);
        try {
          dispatch(session, message);
        }
        catch (err) {
          metrics.handlerErrors++;
          // one line a failure, and an end to them: a client that sends
          // nonsense in a loop is not to fill the log.
          const where = String(err.stack || "").split("\n")[1] || "";
          console.log(`[game] error handling message from ${logText(session.name)}: ${logText(err.message)}${logText(where ? ` (${where.trim()})` : "")}`);
          if (++errorsInWindow > MAX_ERRORS_PER_WINDOW) {
            console.log(`[game] ${logText(session.name)} disconnected: too many messages that could not be handled`);
            socket.destroy();
            return;
          }
        }
        if (socket.destroyed) {
          return;
        }
      }
      if (buffer.length > MAX_MESSAGE) {
        socket.destroy();
      }
    });
    socket.on("close", () => {
      clearTimeout(loginTimer);
      clearTimeout(signupTimer);
      const left = connections.get(address) - 1;
      if (left > 0) {
        connections.set(address, left);
      }
      else {
        connections.delete(address);
      }
      connectionCount = Math.max(0, connectionCount - 1);
      console.log(`[game] ${logText(session.name)} disconnected`);
      // nothing thrown while a player is seen off may take the server down.
      try {
        handlers.close(session);
      }
      catch (err) {
        console.log(`[game] error while ${logText(session.name)} left: ${logText(err.stack)}`);
      }
    });
  };

  takeConnection = onConnection;

  const server = config.tls
    ? tls.createServer({cert: fs.readFileSync(config.tls.certFile), key: fs.readFileSync(config.tls.keyFile),
      handshakeTimeout: config.tlsHandshakeTimeoutMs}, onConnection)
    : net.createServer(onConnection);
  server.on("tlsClientError", () => {});
  server.maxConnections = config.maxConnections * 2;
  if (config.tls) {
    // connections that have not finished their TLS greeting are counted
    // too: the limit above is only reached once they have.
    const greeting = new Map(); // address -> connections not yet through it
    server.on("connection", raw => {
      const address = limits.key(raw.remoteAddress);
      const count = (greeting.get(address) || 0) + 1;
      if (count > config.maxConnectionsPerAddress * 2) {
        raw.destroy();
        return;
      }
      greeting.set(address, count);
      const done = () => {
        const left = greeting.get(address) - 1;
        if (left > 0) {
          greeting.set(address, left);
        }
        else {
          greeting.delete(address);
        }
      };
      raw.once("close", done);
    });
  }
  server.once("error", reject);
  server.listen(config.gamePort, config.gameBindAddress, () => {
    console.log(`[game] listening on ${logText(config.gameBindAddress)}:${logText(config.gamePort)}${logText(config.tls ? " (TLS)" : "")}`);
    resolve(server);
  });
});

// This intentionally exposes counts only: staff can see whether the service
// is healthy without receiving player addresses or packet contents.
const health = () => ({
  openConnections: connectionCount,
  connectedAddresses: connections.size,
  accepted: metrics.accepted,
  rejected: metrics.rejected,
  floodDisconnects: metrics.floodDisconnects,
  handlerErrors: metrics.handlerErrors,
});

module.exports = {start, adopt, health};
