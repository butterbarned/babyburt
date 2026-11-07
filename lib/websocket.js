"use strict";

const crypto = require("crypto");
const {Duplex} = require("stream");

// the game socket for a browser (the client run by Ruffle, public/game.html at
// /account/play): a browser has no plain TCP socket, so Ruffle carries the
// game's bytes in WebSocket messages (its socketProxy setting) to the web
// port. this unwraps them into a stream that looks enough like a net.Socket
// for lib/sfs.js to take as its own: the same messages, the same limits.
//
// RFC 6455, server side, binary only: no extensions, no subprotocols.

const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
// one frame from the browser; a game message is at most 64 KB (lib/sfs.js).
const MAX_FRAME = 1024 * 1024;
// proxies in between (nginx, Cloudflare) drop a connection silent for a
// minute or so; the game's own keep-alives come less often than that.
const PING_MS = 25000;

const frame = (opcode, payload) => {
  const length = payload.length;
  const head = length < 126 ? Buffer.alloc(2) : length < 65536 ? Buffer.alloc(4) : Buffer.alloc(10);
  head[0] = 0x80 | opcode;
  if (length < 126) {
    head[1] = length;
  }
  else if (length < 65536) {
    head[1] = 126;
    head.writeUInt16BE(length, 2);
  }
  else {
    head[1] = 127;
    head.writeBigUInt64BE(BigInt(length), 2);
  }
  return Buffer.concat([head, payload]);
};

class WebSocketStream extends Duplex {
  constructor(raw, remoteAddress) {
    super({allowHalfOpen: false});
    this.raw = raw;
    this.remoteAddress = remoteAddress;
    this.remotePort = raw.remotePort;
    this.pending = Buffer.alloc(0);
    this.closing = false;
    raw.on("data", chunk => this.received(chunk));
    raw.on("error", () => this.destroy());
    raw.on("close", () => this.destroy());
    this.pinger = setInterval(() => this.send(0x9, Buffer.alloc(0)), PING_MS);
  }

  setNoDelay(on) {
    this.raw.setNoDelay(on);
    return this;
  }

  setTimeout(ms, onTimeout) {
    this.raw.setTimeout(ms);
    if (onTimeout) {
      this.raw.on("timeout", onTimeout);
    }
    return this;
  }

  // what waits to go out, here and in the connection under it (lib/sfs.js
  // cuts off a client that stopped reading).
  get writableLength() {
    return super.writableLength + this.raw.writableLength;
  }

  send(opcode, payload, done) {
    if (this.raw.writable) {
      this.raw.write(frame(opcode, payload), done);
    }
    else if (done) {
      done();
    }
  }

  received(chunk) {
    this.pending = this.pending.length ? Buffer.concat([this.pending, chunk]) : chunk;
    while (this.pending.length >= 2) {
      const first = this.pending[0];
      const second = this.pending[1];
      const opcode = first & 0x0f;
      // a client's frames are masked; none may use the reserved bits.
      if ((first & 0x70) !== 0 || (second & 0x80) === 0) {
        this.fail();
        return;
      }
      let length = second & 0x7f;
      let at = 2;
      if (length === 126) {
        if (this.pending.length < 4) {
          return;
        }
        length = this.pending.readUInt16BE(2);
        at = 4;
      }
      else if (length === 127) {
        if (this.pending.length < 10) {
          return;
        }
        const big = this.pending.readBigUInt64BE(2);
        length = big > BigInt(MAX_FRAME) ? MAX_FRAME + 1 : Number(big);
        at = 10;
      }
      if (length > MAX_FRAME) {
        this.fail();
        return;
      }
      if (this.pending.length < at + 4 + length) {
        return;
      }
      const mask = this.pending.subarray(at, at + 4);
      const payload = Buffer.from(this.pending.subarray(at + 4, at + 4 + length));
      this.pending = this.pending.subarray(at + 4 + length);
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i & 3];
      }
      switch (opcode) {
        case 0x0: // continuation
        case 0x1: // text
        case 0x2: // binary: the game's bytes, however they were cut up
          if (payload.length) {
            this.push(payload);
          }
          break;
        case 0x8: // close
          this.end();
          return;
        case 0x9: // ping
          this.send(0xa, payload);
          break;
        case 0xa: // pong
          break;
        default:
          this.fail();
          return;
      }
    }
  }

  fail() {
    this.pending = Buffer.alloc(0);
    this.destroy();
  }

  _read() {}

  _write(chunk, encoding, done) {
    this.send(0x2, chunk, done);
  }

  _final(done) {
    this.closing = true;
    this.send(0x8, Buffer.from([0x03, 0xe8])); // 1000, normal
    this.raw.end();
    done();
  }

  _destroy(err, done) {
    clearInterval(this.pinger);
    this.raw.destroy();
    done(err);
  }
}

// answers an "upgrade" request (from the http server's "upgrade" event):
// the stream, or null when it was no WebSocket request (the connection is
// then answered and closed).
const accept = (req, raw, head, remoteAddress) => {
  const key = String(req.headers["sec-websocket-key"] || "");
  if (String(req.headers.upgrade || "").toLowerCase() !== "websocket" || req.headers["sec-websocket-version"] !== "13"
    || !/^[A-Za-z0-9+/]{22}==$/.test(key)) {
    raw.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");
    return null;
  }
  const answer = crypto.createHash("sha1").update(key + GUID).digest("base64");
  raw.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${answer}\r\n\r\n`);
  const stream = new WebSocketStream(raw, remoteAddress);
  if (head && head.length) {
    stream.received(head);
  }
  return stream;
};

// turns an "upgrade" request away with a status.
const refuse = (raw, status, text) => {
  raw.end(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
};

module.exports = {accept, refuse};
