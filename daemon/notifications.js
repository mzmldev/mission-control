#!/usr/bin/env node
/**
 * Mission Control Notification Daemon
 * 
 * Polls Convex for undelivered notifications and sends them to agents
 * via OpenClaw sessions. Runs continuously via pm2.
 * 
 * Setup:
 *   npm install convex
 *   pm2 start daemon/notifications.js --name "mc-notifications"
 * 
 * Environment variables:
 *   CONVEX_URL - Your Convex deployment URL
 *   CONVEX_ADMIN_KEY - Convex admin key for server-side access
 */

const { ConvexClient } = require("convex/browser");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Configuration
const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const CONVEX_ADMIN_KEY = process.env.CONVEX_ADMIN_KEY;

// Agent session key mapping
const AGENT_SESSIONS = {
  // These will be populated from the database
  // Format: agentId -> sessionKey
};

// Initialize Convex client
let convex;

try {
  convex = new ConvexClient(CONVEX_URL);
  
  if (CONVEX_ADMIN_KEY) {
    // For admin access, we'd need to set up authentication
    // For now, we use the public API (notifications should be readable)
  }
} catch (error) {
  console.error("Failed to connect to Convex:", error.message);
  process.exit(1);
}

// Send notification to agent via OpenClaw
async function sendNotificationToAgent(agentId, content, notificationId) {
  try {
    // Get agent's session key from database
    const agent = await convex.query(api.agents.get, { id: agentId });
    
    if (!agent || !agent.sessionKey) {
      console.warn(`No session key found for agent ${agentId}`);
      return false;
    }
    
    // Send via OpenClaw CLI
    const command = `openclaw sessions send --session "${agent.sessionKey}" --message "${content.replace(/"/g, '\\"')}"`;
    
    try {
      await execAsync(command);
      console.log(`✅ Notification delivered to ${agent.name} (${agent.sessionKey})`);
      return true;
    } catch (execError) {
      // Agent might be offline - notification stays queued
      console.log(`⏳ Agent ${agent.name} is offline, notification queued`);
      return false;
    }
  } catch (error) {
    console.error(`Failed to send notification to ${agentId}:`, error.message);
    return false;
  }
}

// Mark notification as delivered
async function markDelivered(notificationId) {
  try {
    await convex.mutation(api.notifications.markDelivered, { id: notificationId });
  } catch (error) {
    console.error(`Failed to mark notification ${notificationId} as delivered:`, error.message);
  }
}

// Process undelivered notifications
async function processNotifications() {
  try {
    // Fetch undelivered notifications
    const undelivered = await convex.query(api.notifications.getUndelivered, {});
    
    if (undelivered.length > 0) {
      console.log(`📬 Processing ${undelivered.length} undelivered notifications...`);
    }
    
    for (const notification of undelivered) {
      const delivered = await sendNotificationToAgent(
        notification.agentId,
        notification.content,
        notification._id
      );
      
      if (delivered) {
        await markDelivered(notification._id);
      }
    }
  } catch (error) {
    console.error("Error processing notifications:", error.message);
  }
}

// Main loop
async function main() {
  console.log("🚀 Mission Control Notification Daemon starting...");
  console.log(`📡 Connected to: ${CONVEX_URL}`);
  console.log(`⏱️  Polling every ${POLL_INTERVAL_MS}ms`);
  
  // Initial check
  await processNotifications();
  
  // Start polling loop
  setInterval(processNotifications, POLL_INTERVAL_MS);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down notification daemon...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down notification daemon...");
  process.exit(0);
});

// Start the daemon
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
