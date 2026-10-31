# Setting up Discord

Discord is optional and has two independent parts. You can use either, both, or neither.

| Part | What it gives you | You need |
|---|---|---|
| **Sign-in with Discord** (OAuth) | Players link their Discord name to their account (shown on their in-game card). Staff and allowed owners can sign in to the dashboards with Discord. | A Discord application's **client ID and secret** |
| **The bot** | Staff slash commands (player lookup, moderation, announcements), report and log channels, a public status card, the Server Booster badge, optional AutoMod. | The application's **bot token** and your server's **guild ID** |

Both come from one Discord application. **Sign-in does not need the bot**: set up only the client ID and secret (step 2) and it works on its own. Secrets go in environment variables, never in the repository.

## 1. Create the application
1. Open <https://discord.com/developers/applications> and choose **New Application**. Name it after your server.
2. Under **General Information**, copy the **Application ID**. This is `AJ_DISCORD_CLIENT_ID`.

## 2. Sign-in with Discord (OAuth)
1. In the application, open **OAuth2**.
2. Copy the **Client Secret** (reset it if needed). This is `AJ_DISCORD_CLIENT_SECRET`. Treat it like a password.
3. Under **Redirects**, add these three addresses exactly, using the address of your **website**. That is
   `AJ_SITE_URL` if you set it, otherwise `AJ_PUBLIC_URL`, with a trailing slash and no extra path:
   ```
   https://YOUR-SITE/account/discord/callback
   https://YOUR-SITE/dashboard/admin/discord/callback
   https://YOUR-SITE/dashboard/staff/discord/callback
   ```
   The scope used is `identify` only: the server learns the player's Discord user ID and name, nothing else.
4. Set the two variables (see step 4) and restart. The bot (step 3) is not needed for this. The account page now offers **Link Discord**.

Notes:
- One Discord account can be linked to **one** server account.
- The Discord account is only trusted after its owner proves they own the game account by signing in
  to Discord from the account page. Knowing someone's Discord name is never enough.
- Local testing: use `http://127.0.0.1:PORT/...` redirects and add them too; Discord accepts `http` for localhost.

## 3. The bot
1. In the application, open **Bot**, choose **Reset Token**, and copy it. This is `AJ_DISCORD_BOT_TOKEN`.
2. Still on **Bot**, under **Privileged Gateway Intents**, enable only what you will use:
   - **Server Members Intent**: welcome and goodbye messages, and AutoMod anti-raid.
   - **Message Content Intent**: AutoMod (blocked words, invite blocking, spam).
   Leave both off if you do not use those features; the bot then needs neither.
3. Create the invite: **OAuth2 > URL Generator**. Scopes: **bot** and **applications.commands**. Bot permissions:
   at minimum **View Channels**, **Send Messages**, **Embed Links** and **Read Message History**.
   Add **Manage Channels** for the ticket feature, and **Moderate Members**, **Kick Members**, **Ban Members** and
   **Manage Messages** only if you want the `/discord ...` moderation commands. Open the generated URL and add the
   bot to your Discord server.
4. Get your server's **guild ID**: in Discord, User Settings > Advanced > turn on **Developer Mode**, then
   right-click your server's icon > **Copy Server ID**. This is `AJ_DISCORD_GUILD_ID`.
5. Optional channels: right-click a channel > **Copy Channel ID** for any of these. Leave any you do not want unset:

   | Variable | Used for |
   |---|---|
   | `AJ_DISCORD_REPORTS_CHANNEL_ID` | player reports |
   | `AJ_DISCORD_STATUS_CHANNEL_ID` | the public status card |
   | `AJ_DISCORD_GAME_LOGS_CHANNEL_ID` | players joining and leaving |
   | `AJ_DISCORD_MOD_LOGS_CHANNEL_ID` | the moderation audit trail |
   | `AJ_DISCORD_BOT_LOGS_CHANNEL_ID` | the bot's own command log |
   | `AJ_DISCORD_UPDATES_CHANNEL_ID` | update cards from GitHub pushes (also needs `AJ_GITHUB_REPOSITORY` and `AJ_GITHUB_WEBHOOK_SECRET`) |

   Make sure the bot can see and post in each channel.

## 4. Environment variables
Put them in a file only the service can read (for systemd: `EnvironmentFile=/etc/yourserver.env`, mode 600):
```
AJ_DISCORD_CLIENT_ID=...
AJ_DISCORD_CLIENT_SECRET=...
AJ_DISCORD_BOT_TOKEN=...
AJ_DISCORD_GUILD_ID=...
# optional channels from step 3.5
```
Then restart the server. The log shows the bot signing in. The bot's commands are registered for your server
(guild) only, so they appear within a minute or so.

## 5. Using it
- **Players:** on their account page, **Link Discord**. A linked account that boosts your Discord server gets the
  Server Booster badge (checked every few hours).
- **Staff:** a staff member (a role such as moderator) links Discord from their own account page, then can use
  **Sign in with Discord** on the staff dashboard. This works without the bot. Their account must still be active
  staff, which includes having 2FA turned on, and must not be banned or locked. The bot's slash commands are a
  separate feature and need the bot.
- **Owners:** in the admin dashboard, give an account **dashboard access** (it must have Discord linked). They then
  see **Sign in with Discord** on the owner dashboard.
  **Important:** the owner dashboard is only reachable from the server itself and from the addresses in
  `AJ_ADMIN_ALLOW` on a public server. Discord sign-in does not bypass that. Use an SSH tunnel or add trusted
  addresses.
- **Admin dashboard > Discord tab:** shows whether the bot is running and lets you start, stop, and configure
  status cards, AutoMod and welcome messages.

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| **Link Discord** button missing | `AJ_DISCORD_CLIENT_ID` or `AJ_DISCORD_CLIENT_SECRET` unset, or the server was not restarted. |
| Discord says "Invalid OAuth2 redirect_uri" | The redirect in step 2.3 differs from your site address by even a slash or `http`/`https`. It must match `AJ_SITE_URL` (or `AJ_PUBLIC_URL`). |
| Bot never comes online | Wrong token or guild ID, or the bot was not added to that server. Check the server log. |
| Slash commands missing | Missing `applications.commands` scope on the invite; re-add the bot with it. |
| Bot cannot post in a channel | It lacks **View Channel** or **Send Messages** there. |
| "Used disallowed intents" in the log | You enabled AutoMod or member messages without turning on the matching privileged intent in step 3.2. |
| Booster badge never appears | The bot must be in the server and the player's Discord linked. Allow a few hours for the recheck. |
| Staff Discord sign-in refused | The Discord account is not linked to an active staff account, or that account has no 2FA. |

## Security
- Never put the client secret or bot token in Git, chat, screenshots or logs. If one leaks, reset it in the
  Developer Portal and update the environment file.
- Give the bot only the permissions you use.
- Discord sign-in only proves identity; roles and permissions are still decided by the server.

## Handing out invite codes through a Discord bot (optional)

The separate **FireFly-bot** can give out invite codes: members agree to the rules in Discord and are sent
one code by DM. The server does not need it. To connect it, set these on the Dusklight server and restart:

| Variable | What it does |
|---|---|
| `AJ_INVITE_HOOK_URL` | Where the bot listens, for example `http://127.0.0.1:8787`. |
| `AJ_INVITE_HOOK_TOKEN` | A shared secret; the bot's `INVITE_HOOK_TOKEN` must match. |

With both set, codes made on the **Invites** page are also sent to the bot, and revoked codes are withdrawn.
The panel still shows every code, and its reply has `handedOver` (`true`, `false`, or `null` when this is not
set up). With either variable missing, nothing is sent.
