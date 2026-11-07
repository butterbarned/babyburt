# Running Dusklight on Oracle Cloud (Always Free)

Placeholders: `dusklight.example.com` = your domain, `YOUR_IP` = your home IP, `VM_IP` = the VM's public IP.
Assumes Ubuntu 24.04. Commands are run on the VM unless marked **[local]**.

## 0. Before you start
- A domain (or subdomain) you can edit DNS for. Free `duckdns.org` names work.
- An Oracle Cloud account (needs a card for verification; Always Free resources are not billed).
  - **Sign up:** <https://www.oracle.com/cloud/free/> (click **Start for free**).
  - **Sign in later:** <https://cloud.oracle.com>. You will be asked for your account name (the "cloud account name" you chose at sign-up) and then your username and password.
  - You pick a **home region** at sign-up and cannot change it. Always Free resources only work in that region, and some regions often run out of free capacity, so choose one with good availability for you.
- Nothing to prepare for SSH: in step 1 Oracle generates the key for you. Keep the private key file it downloads.
- Your Git repo URL (`https://github.com/butterbarned/babyburt`). If it is private, use a deploy key or a token.

## 0b. Reusing a VM you already have
If the VM already runs something else (for example a Caddy-fronted site), skip step 1 and read this first.
- **Do not delete an Ampere A1 VM to start over.** Free A1 capacity is often unavailable, so you may not get it back.
- Move anything else off the VM first and confirm it works elsewhere. If Caddy owns ports 80/443, stop and disable it
  (`sudo systemctl disable --now caddy`) before step 5, because certbot standalone and Dusklight both need those ports.
- Ports 80 and 443 may already be open in both firewalls; add only 9339 (step 3) and avoid duplicate rules.
- Free disk space and RAM are shared: check `df -h` and `free -h`.
- Anything else that serves the same hostname must be turned off before Dusklight starts, or the bind on 443 fails.

## 1. Create the VM
1. Console > Compute > Instances > **Create instance**.
2. Image: **Canonical Ubuntu 24.04**.
3. Shape: **Ampere `VM.Standard.A1.Flex`**, 2 OCPU / 12 GB (Always Free allows up to 4 / 24). If you get "out of capacity", retry later or try another availability domain, or, if it is available on your account, use `VM.Standard.E2.1.Micro` (1 GB RAM: add swap, see step 3). Not every account or region offers it.
4. Networking: keep the default VCN and **assign a public IPv4**.
5. Under **Add SSH keys**, choose **Generate a key pair for me** and click **Save private key** (also save the public key if you like). You can't download it again later, so keep the file safe. Boot volume: 50 GB is fine.
6. Create, wait for "Running", copy the public IP.
7. **[local]** connect with the downloaded key (`chmod 600` it first on Linux/macOS): `ssh -i /path/to/ssh-key.key ubuntu@VM_IP`. With PuTTY, convert the key to `.ppk` using PuTTYgen (Load, then Save private key) and select it under Connection > SSH > Auth > Credentials. Later `ssh` and `rsync` commands in this guide need the same `-i /path/to/ssh-key.key` option. (Optional: Networking > IP management > Reserved public IPs, so the IP survives re-creating the VM.)

## 2. DNS
Add an `A` record: `dusklight.example.com` -> `VM_IP`. Check with `dig +short dusklight.example.com` before step 5.

## 3. Open the ports (Oracle needs two layers)
**Cloud firewall.** Networking > Virtual cloud networks > your VCN > Security Lists > Default > **Add ingress rules**, one each, source `0.0.0.0/0`, protocol TCP, destination port: `80`, `443`, `9339`.

**VM firewall.** Oracle's Ubuntu image ships iptables rules that block everything but SSH:
```sh
sudo iptables -I INPUT 5 -p tcp -m multiport --dports 80,443,9339 -j ACCEPT
sudo apt update && sudo apt install -y iptables-persistent   # say yes to saving
sudo netfilter-persistent save
```
The rule must sit above the `REJECT` line. Check with `sudo iptables -L INPUT -n --line-numbers`; if `REJECT` comes first, re-add the rule at that line number instead of 5.
Optional swap for small shapes:
```sh
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 4. Install Node, git, certbot, ffmpeg
```sh
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git certbot acl ffmpeg
node -v        # must be >= 22.5
```
ffmpeg is for theatre videos: it makes an uploaded MKV an MP4 and takes a video's own subtitles out of it. Without it, videos are kept as sent and only subtitle files added by hand are shown.

## 5. TLS certificate
Port 80 must be free and open (step 3).
```sh
sudo certbot certonly --standalone -d dusklight.example.com
```
Create the `flight` user that will run the server, and let it read the certs:
```sh
sudo useradd -m -s /bin/bash flight
sudo setfacl -R -m u:flight:rX /etc/letsencrypt/live /etc/letsencrypt/archive
```
Restart on renewal:
```sh
echo 'renew_hook = systemctl restart flight' | sudo tee -a /etc/letsencrypt/renewal/dusklight.example.com.conf
sudo certbot renew --dry-run
```
(New renewed files stay readable because the ACL on `archive` is inherited via a default ACL: also run
`sudo setfacl -R -d -m u:flight:rX /etc/letsencrypt/archive`.)

## 6. Install the server
```sh
sudo -u flight git clone https://github.com/butterbarned/babyburt /home/flight/flight
sudo -u flight npm --prefix /home/flight/flight ci --omit=dev     # installs discord.js (only needed for the Discord bot)
```
(`/home/flight` is private to the `flight` user, so your normal login can't `cd` into it. The commands in this guide use full paths with `sudo` instead. To work inside it, run `sudo -iu flight`, and `exit` to leave.)
`swf/` and `public/` come with the repo. Other game files are fetched on demand from the upstream CDN and cached in `cache/` (so the first players load slowly). Don't set `AJ_OFFLINE=1` unless you have copied a full cache over.

## 7. Configure and run as a service
Put secrets/optional settings in an env file, readable only by root and the service:
```sh
sudo install -m 600 -o flight /dev/null /etc/flight.env
sudoedit /etc/flight.env
```
Contents (all optional unless noted):
```
# Needed for the public Terms/Privacy pages:
AJ_OPERATOR=your name or organisation
AJ_HOSTED_IN=United States
AJ_LEGAL_EMAIL=legal@example.com
AJ_ADMIN_EMAIL=admin@example.com
# Strongly recommended: stops bots registering
# AJ_TURNSTILE_SITE_KEY=...
# AJ_TURNSTILE_SECRET=...
# Discord bot, if you use it:
# AJ_DISCORD_BOT_TOKEN=...
# AJ_DISCORD_GUILD_ID=...
```
Service file `/etc/systemd/system/flight.service`:
```ini
[Unit]
Description=Dusklight server
After=network-online.target
Wants=network-online.target

[Service]
User=flight
WorkingDirectory=/home/flight/flight
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
AmbientCapabilities=CAP_NET_BIND_SERVICE
EnvironmentFile=/etc/flight.env
Environment=AJ_PUBLIC_URL=https://dusklight.example.com
Environment=AJ_BIND=0.0.0.0
Environment=AJ_HTTP_PORT=443
Environment=AJ_GAME_PORT=9339
Environment=AJ_TLS_CERT=/etc/letsencrypt/live/dusklight.example.com/fullchain.pem
Environment=AJ_TLS_KEY=/etc/letsencrypt/live/dusklight.example.com/privkey.pem

[Install]
WantedBy=multi-user.target
```
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now flight
journalctl -u flight -f      # look for "[server] ready"
```
Do **not** set `AJ_TRUSTED_PROXY` (no proxy here), `AJ_TRUST_LOCAL` or `AJ_REGISTER=1`; the server refuses to start with those on a public address.

## 8. First-time setup (the admin panel is localhost-only)
On a public server `/admin` only answers requests coming from the VM itself (or addresses in `AJ_ADMIN_ALLOW`). Use an SSH tunnel:
```sh
# [local]
ssh -i /path/to/ssh-key.key -L 8443:localhost:443 ubuntu@VM_IP
```
In PuTTY instead: Connection > SSH > Tunnels, source port `8443`, destination `localhost:443`, click **Add**, then connect (with your `.ppk` key set as in step 1).

Keep that connection open and browse to `https://localhost:8443/admin` (accept the certificate-name warning: the cert is for your domain). Alternatively add `AJ_ADMIN_ALLOW=YOUR_IP` to `/etc/flight.env` and restart; only do that with a fixed IP.

1. Enter the setup code from `journalctl -u flight | grep setup` if asked, and choose the admin password.
2. Make an account (or sign up at `https://dusklight.example.com/register`) and promote it to staff in the panel.
3. Open the **Invites** page, switch on **invite only**, and make codes. Do this before announcing the server.
4. Visit `https://dusklight.example.com/` and `/register` to check the site works with HTTPS.

## 9. Connect a game client
The game client (launcher) must point at `https://dusklight.example.com` with game port `9339`. With `AJ_REQUIRE_DEVICE=1` the server turns away clients that don't send device IDs (off by default), so use your own Dusklight launcher build rather than an old or official one. Set `AJ_DOWNLOAD_URL` in `/etc/flight.env` to show a download link on the home page.

Players can also play in a browser, with no download: they sign in at `https://dusklight.example.com/account` and click **Play in browser**. Fetch the browser Flash player once with `sudo -u flight node /home/flight/flight/tools/fetch-ruffle.js` (the automatic updater in step 10 fetches it again when its pinned release changes). The game's connection then goes through port 443 as a WebSocket (`/game-socket`), so no other port is needed. Set `AJ_BROWSER_PLAY=0` in `/etc/flight.env` to turn it off.

## 10. Updates
Manual:
```sh
sudo -u flight git -C /home/flight/flight pull --ff-only && sudo -u flight npm --prefix /home/flight/flight ci --omit=dev && sudo systemctl restart flight
```
Automatic (checks every 2 minutes; your branch is `master`, the script defaults to `main`):
```sh
sudo cp /home/flight/flight/deploy/flight-update.{service,timer} /etc/systemd/system/
sudo sed -i 's#/home/aj/ajc-private-server#/home/flight/flight#' /etc/systemd/system/flight-update.service   # fixes the script path
sudo mkdir -p /etc/systemd/system/flight-update.service.d
printf '[Service]\nEnvironment=FLIGHT_DIR=/home/flight/flight FLIGHT_USER=flight FLIGHT_BRANCH=master FLIGHT_INIT=systemd\n' | sudo tee /etc/systemd/system/flight-update.service.d/env.conf
sudo systemctl daemon-reload && sudo systemctl enable --now flight-update.timer
```

## 11. Backups (do this early)
All player data is in `/home/flight/flight/data/` (`game.sqlite`, daily copies in `backups/`, logs). It is gitignored; never commit it. Pull it to your computer regularly:
```sh
# [local]
rsync -az -e "ssh -i /path/to/ssh-key.key" --rsync-path="sudo rsync" ubuntu@VM_IP:/home/flight/flight/data/ ~/flight-backup/
```
(`--rsync-path="sudo rsync"` lets the `ubuntu` user read files owned by `flight`. On Windows with PuTTY, use `pscp -i key.ppk` or WinSCP instead; you may need `sudo chmod -R a+rX /home/flight/flight/data` first.) Also consider an Oracle boot-volume backup.

## Troubleshooting
- **Site unreachable:** both firewall layers (step 3); `sudo ss -tlnp | grep -E '443|9339'`.
- **Service won't start:** `journalctl -u flight -e`. A message about contradicting settings names the env var.
- **"permission denied" on cert:** re-run the `setfacl` commands in step 5.
- **Port 443 bind error:** check `AmbientCapabilities` is in the unit file.
- **Certbot fails:** DNS not propagated yet, or port 80 closed.
