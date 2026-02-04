# Mission Control Notification Daemon

This daemon polls Convex for undelivered notifications and sends them to agents via OpenClaw sessions.

## How It Works

1. **Polls Convex every 2 seconds** for undelivered notifications
2. **Looks up agent session keys** from the agents table
3. **Sends notifications** via `openclaw sessions send`
4. **Marks notifications as delivered** in Convex

If an agent is offline, the notification stays queued and will be delivered on the next poll once they're back.

## Setup

### 1. Install pm2 globally

```bash
npm install -g pm2
```

### 2. Set environment variables

Create a `.env` file in the project root:

```bash
CONVEX_URL="your-convex-deployment-url"
CONVEX_ADMIN_KEY="your-convex-admin-key"  # Optional, for admin access
```

### 3. Start the daemon

```bash
# Using pm2 directly
pm2 start daemon/notifications.js --name "mc-notifications"

# Or using the ecosystem file
pm2 start ecosystem.config.js

# Or using npm
npm run daemon:start
```

### 4. Save pm2 config (to auto-start on boot)

```bash
pm2 save
pm2 startup
```

## Commands

```bash
# Start daemon
pm2 start mc-notifications

# Stop daemon
pm2 stop mc-notifications

# Restart daemon
pm2 restart mc-notifications

# View logs
pm2 logs mc-notifications

# Monitor
pm2 monit
```

## Logs

Logs are stored in:
- `./logs/notifications.out.log` - Standard output
- `./logs/notifications.error.log` - Errors

## Architecture

```
User posts comment with @Vision
         ↓
Frontend creates notification in Convex
         ↓
Daemon polls Convex every 2s
         ↓
Finds undelivered notification for Vision
         ↓
Sends via: openclaw sessions send --session "agent:seo-analyst:main"
         ↓
Marks notification as delivered
         ↓
Vision receives message on next heartbeat
```

## Troubleshooting

### Daemon won't start
- Check that `CONVEX_URL` is set correctly
- Verify the Convex deployment is accessible
- Check logs: `pm2 logs mc-notifications`

### Notifications not being delivered
- Check agent has a valid `sessionKey` in the database
- Verify OpenClaw is running: `openclaw gateway status`
- Check the agent's session exists: `openclaw sessions list`

### High CPU/memory usage
- The daemon uses very little resources by design
- If issues occur, restart: `pm2 restart mc-notifications`

## Thread Subscriptions

The daemon also supports thread subscriptions. When an agent:
- Comments on a task
- Gets assigned to a task  
- Gets @mentioned in a task
- Creates a task

They are automatically subscribed and will receive notifications for all future comments (without needing @mentions).

See `convex/threadSubscriptions.ts` for the subscription logic.
