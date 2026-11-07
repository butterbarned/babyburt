# Running Dusklight on your own computer

This sets up a Dusklight server on your own computer. By default it is private: only your machine can reach it.
Step 10 shows how to let friends in from home. For a server that runs all the time, use
[deploy/ORACLE.md](deploy/ORACLE.md) instead.

## 1. Requirements
- **Node.js 22.5 or newer** (`node -v`). Older versions lack the built-in SQLite the server uses.
- **Git**.
- Internet access on first run: game files that are not in the repository are fetched once from the game's
  public content server and cached in `cache/`.
- The desktop client (a separate project) to actually play. The website and admin panel work without it.

## 2. Get the code and install
```sh
git clone https://github.com/butterbarned/babyburt dusklight
cd dusklight
npm ci
```
`npm ci` installs one dependency (`discord.js`), used only by the optional Discord bot. The game does not need it.

## 3. Start it
```sh
npm start
```
The log should end with lines like:
```
[http] listening on 127.0.0.1:8080
[game] listening on 127.0.0.1:9339
[server] ready at http://127.0.0.1:8080/
```
Stop it with Ctrl+C. By default it listens on this computer only, so nobody else can connect (to let friends in,
see step 10).

**Seeing errors.** Everything the server prints appears in this terminal, including errors, so keep the window
visible while you test. Packet logging (one line for each message between game and server) is on by default for a
local server. To also save the output to a file, run `npm start 2>&1 | tee ~/dusklight.log` (the `2>&1` includes
error messages).

**Setting an environment variable** (used throughout this guide) depends on your shell:

| Shell | Example for `AJ_REGISTER=1` |
|---|---|
| bash / zsh | `AJ_REGISTER=1 npm start` |
| fish | `env AJ_REGISTER=1 npm start` |
| Windows PowerShell | `$env:AJ_REGISTER="1"; npm start` |
| Windows cmd | `set AJ_REGISTER=1&& npm start` (no space before `&&`) |

For several variables, list them one after another before `npm start` (bash/fish), or set each `$env:` line first
(PowerShell).

## 4. Set the admin password
1. Open <http://127.0.0.1:8080/admin>.
2. Choose an admin password. (From this machine no setup code is asked for. If you are asked, it is printed in
   the log on the line starting `[admin]`.)
3. The dashboard is at <http://127.0.0.1:8080/dashboard>.

## 5. Make an account
Pick one:
- **Sign up on the website.** Go to <http://127.0.0.1:8080/register>. If you turned invite-only on in the admin
  panel, make a code on the Invites page first. Passwords need 10 or more characters with a capital letter, a
  small letter and a digit, and can't contain your username.
- **Create accounts on login.** Start the server with `AJ_REGISTER=1` (see the table in step 3). Any unknown name
  that tries to log in from the game is created on the spot. This is only allowed on a local server; the server
  refuses it if it is public.

## 6. Play with the desktop client
Start the client from its own folder. The address defaults to `http://127.0.0.1:8080`, so a plain launch already
points at a local server:
```sh
./run.sh
```
To use a different server, either set `AJ_SERVER` (`AJ_SERVER=http://127.0.0.1:8080 ./run.sh`, written for your
shell as in step 3) or type the address in the server box on the client's start screen. Log in with the account
from step 5.

### Or play in a browser
Fetch the browser Flash player ([Ruffle](https://ruffle.rs)) once:
```sh
node tools/fetch-ruffle.js
```
Then sign in at <http://127.0.0.1:8080/account> and click **Play in browser** (or go straight to
`/account/play`). The game runs in the page, with no download. The client must be a build from
`tools/build-client.sh`, because it carries the fixes Ruffle needs. Some parts of the game may still not
work in a browser; the desktop client stays the main way to play. `AJ_BROWSER_PLAY=0` turns browser play off.

## 7. Useful settings for local use
Set these before `npm start` (see the shell table in step 3):

| Variable | Use |
|---|---|
| `AJ_HTTP_PORT=8081`, `AJ_GAME_PORT=9340` | Change ports if the defaults are taken. |
| `AJ_DATA_DIR=/path/to/data` | Keep the database somewhere else (handy for throwaway tests). |
| `AJ_OFFLINE=1` | Serve only from the local cache; never fetch from the internet. |
| `AJ_QUIET=1` | Less logging. (Packet logging is on by default locally, off when the server is public; `AJ_QUIET=0` forces it on.) |
| `AJ_BROWSER_PLAY=0` | Turn off playing in a browser (`/account/play`). |
| `AJ_REQUIRE_DEVICE=1` | Refuse clients that don't send device IDs (old launchers, browsers). Off by default. |

## 8. Where things are saved
Everything the server writes goes under `data/` (the SQLite database `game.sqlite`, daily `backups/`, logs).
Delete `data/` to start again from scratch. It is not tracked by Git and must never be committed.

## 9. Run the tests
```sh
npm test
node .github/scripts/invariants.js
```
The second command is a set of repository checks. It currently reports three known findings that were there before
these guides (`lib/modpanel.js` using `child_process`, and two pages naming `duckduckgo.com`), so those are not
caused by your changes. The tests start their own server on separate ports with a temporary data folder, so they do not touch your
`data/`.

## 10. Sharing your local server with friends
By default only your computer can connect (step 3). To let friends in from the internet you need to do three
things: make the server listen on the network, open the ports in your firewall and router, and give friends an
address to use. Only do this if you are comfortable with strangers' traffic reaching your computer; keep
**invite only** on (admin panel > Invites) so only people you give a code can sign up.

Ports used: **8080** (website and sign-up) and **9339** (the game). Both are TCP.

### 10a. Without a domain (your IP address)
1. **Find your public IP:** `curl -4 ifconfig.me`. Your **local** IP (for the router) is from `ip -4 addr` on Linux or
   `ipconfig` on Windows, usually `192.168.x.x`.
2. **Start the server listening on the network.** Using your public IP from step 1:
   ```sh
   AJ_BIND=0.0.0.0 AJ_PUBLIC_URL=http://YOUR_PUBLIC_IP:8080 npm start
   ```
   (Other shells: see the table in step 3. fish needs `env` in front; PowerShell sets `$env:AJ_BIND` and
   `$env:AJ_PUBLIC_URL` first.)
   `AJ_PUBLIC_URL` is what tells the game client where to connect. Because the server is now public it
   refuses `AJ_REGISTER=1`, and the admin panel only answers on your own computer (use
   `http://127.0.0.1:8080/admin` as before).
3. **Allow the ports through your computer's firewall:**
   - Linux with ufw: `sudo ufw allow 8080/tcp && sudo ufw allow 9339/tcp`
   - Linux with firewalld (e.g. Fedora): `sudo firewall-cmd --add-port=8080/tcp --add-port=9339/tcp --permanent && sudo firewall-cmd --reload`
   - Windows (admin PowerShell): `New-NetFirewallRule -DisplayName "Dusklight" -Direction Inbound -Protocol TCP -LocalPort 8080,9339 -Action Allow`
   - If you have no firewall running, skip this.
4. **Forward the ports on your router.** In the router's admin page (often `192.168.0.1` or `192.168.1.1`), find
   "Port forwarding" / "Virtual server" and forward TCP **8080** and **9339** to your computer's local IP. Give
   your computer a fixed local IP (DHCP reservation) so the forward doesn't break.
5. **Test from outside your home network** (phone on mobile data, or a friend): open
   `http://YOUR_PUBLIC_IP:8080/`. Testing from your own network often fails even when it works for others.
6. **Tell friends** to register at `http://YOUR_PUBLIC_IP:8080/register` with an invite code, then enter
   `http://YOUR_PUBLIC_IP:8080` as the server in the client.

Limits of this option: most home connections get a **new public IP now and then**, so you must update
`AJ_PUBLIC_URL` and tell friends each time (the next option fixes this). The connection is plain HTTP, so
passwords are not encrypted in transit; use a throwaway password and don't reuse one. The client only connects to
an `http://` address like this if **Allow unencrypted** is switched on in its settings, so tell friends to turn
that on.

If your ISP uses CGNAT (your router's "WAN IP" differs from what `curl -4 ifconfig.me` shows), port forwarding
can't work. Use a VPS ([deploy/ORACLE.md](deploy/ORACLE.md)) or a tunnel/VPN tool instead.

Playing from the same home network as the server: many routers can't loop a request for your own public address
back inside (no "NAT loopback"), so the public address may fail for you even though friends can connect. Test
from outside your network (phone on mobile data) rather than concluding it is broken.

### 10b. With a free DuckDNS name
DuckDNS gives you a name like `myflight.duckdns.org` that follows your changing home IP, so friends use one
address.
1. Sign in at <https://www.duckdns.org> and create a subdomain, for example `myflight` (the full name is then
   `myflight.duckdns.org`). Note your **token** from the top of the page.
2. Point the name at your IP once, now (use only the part before `.duckdns.org` after `domains=`; leaving `ip=`
   empty makes DuckDNS use the address the request comes from):
   ```sh
   curl -s "https://www.duckdns.org/update?domains=myflight&token=YOUR_TOKEN&ip="
   ```
   It prints `OK` on success (`KO` means the name or token is wrong). Keep the token private. Check with
   `nslookup myflight.duckdns.org`: it should show your public IP (it can take a minute or two).
3. Keep it updated, because your home IP changes. Run the same command every 5 minutes:
   - Linux: `crontab -e`, then add the line
     `*/5 * * * * curl -s "https://www.duckdns.org/update?domains=myflight&token=YOUR_TOKEN&ip=" >/dev/null`
     (cron must be installed and running; on Arch/CachyOS install `cronie` and run
     `sudo systemctl enable --now cronie`).
   - Windows: Task Scheduler > Create Basic Task, repeat every 5 minutes, running `curl.exe` with the same address.
   - DuckDNS also lists other ways to do this (router update fields, scripts) on its install page.
4. Do steps 3 and 4 of 10a (firewall and router forwarding) unchanged.
5. Start the server with the name instead of the IP:
   ```sh
   AJ_BIND=0.0.0.0 AJ_PUBLIC_URL=http://myflight.duckdns.org:8080 npm start
   ```
   (Other shells: as in 10a.) You do not need to restart it when your IP changes, because friends use the name,
   not the number.
6. Test from outside your network (phone on mobile data): open `http://myflight.duckdns.org:8080/`.
7. Friends register at `http://myflight.duckdns.org:8080/register` and use that address in the client, with
   **Allow unencrypted** switched on in its settings (needed for any `http://` address).

If you want HTTPS instead of plain HTTP, you need a certificate for the DuckDNS name (certbot's DNS challenge
works with DuckDNS) and the `AJ_TLS_CERT` / `AJ_TLS_KEY` settings, with ports forwarded as above and an
`https://` public URL. [deploy/ORACLE.md](deploy/ORACLE.md) steps 5 and 7 show the certificate and settings on
a server.

### Stopping sharing
Stop the server (Ctrl+C), then undo what you opened: remove the port forwards on your router, and remove the
firewall rules (ufw: `sudo ufw delete allow 8080/tcp` and `sudo ufw delete allow 9339/tcp`). If you set up
DuckDNS updates, remove the cron job or scheduled task too. Next time, start with plain `npm start` to go back to
a private local server. It is also worth backing up `data/` before you open the server to others, so you can
restore your accounts if something goes wrong.

## Troubleshooting
- **`node:sqlite` or "unexpected token" errors:** your Node is too old; install 22.5 or later.
- **Port already in use:** change `AJ_HTTP_PORT` / `AJ_GAME_PORT`, or stop the other program.
- **The client says it cannot connect:** make sure the server is running and the client's address is exactly
  `http://127.0.0.1:8080`, not `https` (there is no certificate locally).
- **The client says it is outdated or is refused at login:** the server was started with `AJ_REQUIRE_DEVICE=1`,
  which accepts only a Dusklight client that sends device IDs. Start it without that setting to let others in.
- **Friends can't connect (step 10):** test from outside your network first. Check that the server was started
  with `AJ_BIND=0.0.0.0` and an `AJ_PUBLIC_URL` that matches the address friends use, that both ports (8080 and
  9339) are open in the firewall and forwarded on the router, and that your ISP doesn't use CGNAT.
- **A friend's client refuses an `http://` address:** they need **Allow unencrypted** switched on in the client's
  settings.
- **The server won't start and names a setting:** two settings contradict each other (for example `AJ_REGISTER=1`
  together with `AJ_BIND=0.0.0.0`). The message names the variable.
- **Pages or art look empty on first run:** the first visit fetches files into `cache/`; wait a moment and reload.
