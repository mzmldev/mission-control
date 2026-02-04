#!/usr/bin/env node
/**
 * Daily Standup Generator
 * 
 * Generates a daily summary of agent activities and sends it to the user.
 * Run via cron: 0 18 * * * (6 PM daily)
 * 
 * Usage:
 *   node scripts/daily-standup.js
 *   
 * Or via npm:
 *   npm run standup
 */

const { ConvexClient } = require("convex/browser");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

// Initialize Convex
const convex = new ConvexClient(CONVEX_URL);

// Format date
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Get today's start timestamp
function getTodayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

// Get yesterday's start timestamp
function getYesterdayStart() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

// Generate standup report
async function generateStandup() {
  const today = getTodayStart();
  const yesterday = getYesterdayStart();
  
  // Fetch data
  const agents = await convex.query(api.agents.list, {});
  const allActivities = await convex.query(api.activities.list, {});
  const allTasks = await convex.query(api.tasks.list, {});
  
  // Filter to today's activities
  const todayActivities = allActivities.filter(a => a._creationTime >= yesterday);
  
  // Group by type
  const completedTasks = todayActivities.filter(a => a.type === "task_completed");
  const startedTasks = todayActivities.filter(a => a.type === "task_started");
  const failedTasks = todayActivities.filter(a => a.type === "task_failed");
  
  // Group by agent
  const agentActivity = {};
  for (const agent of agents) {
    agentActivity[agent._id] = {
      name: agent.name,
      role: agent.role,
      activities: todayActivities.filter(a => a.agentId === agent._id),
      completed: completedTasks.filter(a => a.agentId === agent._id),
      inProgress: allTasks.filter(t => 
        t.status === "in_progress" && 
        t.assigneeIds?.includes(agent._id)
      ),
      blocked: allTasks.filter(t => 
        t.status === "blocked" && 
        t.assigneeIds?.includes(agent._id)
      ),
    };
  }
  
  // Generate report
  const date = formatDate(new Date());
  let report = `📊 DAILY STANDUP — ${date}\n\n`;
  
  // Completed today
  report += `✅ COMPLETED TODAY\n`;
  if (completedTasks.length > 0) {
    for (const activity of completedTasks) {
      const agent = agents.find(a => a._id === activity.agentId);
      report += `• ${agent?.name || "Unknown"}: ${activity.message}\n`;
    }
  } else {
    report += `• No tasks completed today\n`;
  }
  report += `\n`;
  
  // In progress
  report += `🔄 IN PROGRESS\n`;
  let hasInProgress = false;
  for (const [agentId, data] of Object.entries(agentActivity)) {
    if (data.inProgress.length > 0) {
      hasInProgress = true;
      for (const task of data.inProgress) {
        report += `• ${data.name}: ${task.title}\n`;
      }
    }
  }
  if (!hasInProgress) {
    report += `• No tasks in progress\n`;
  }
  report += `\n`;
  
  // Blocked
  let hasBlocked = false;
  for (const [agentId, data] of Object.entries(agentActivity)) {
    if (data.blocked.length > 0) {
      if (!hasBlocked) {
        report += `🚫 BLOCKED\n`;
        hasBlocked = true;
      }
      for (const task of data.blocked) {
        report += `• ${data.name}: ${task.title}\n`;
      }
    }
  }
  if (hasBlocked) report += `\n`;
  
  // Recent activity
  const recentMessages = todayActivities
    .filter(a => a.type === "message_sent")
    .slice(0, 5);
  
  if (recentMessages.length > 0) {
    report += `💬 RECENT DISCUSSION\n`;
    for (const activity of recentMessages) {
      const agent = agents.find(a => a._id === activity.agentId);
      report += `• ${agent?.name || "Unknown"}: ${activity.message}\n`;
    }
    report += `\n`;
  }
  
  // Agent status summary
  report += `👥 AGENT STATUS\n`;
  for (const agent of agents) {
    const status = agent.status === "busy" ? "🟢" : 
                   agent.status === "idle" ? "⚪" : 
                   agent.status === "error" ? "🔴" : "⚫";
    report += `${status} ${agent.name} (${agent.role})\n`;
  }
  
  return report;
}

// Send standup to user
async function sendStandup() {
  try {
    console.log("Generating daily standup...");
    const report = await generateStandup();
    
    // Send via OpenClaw to main session
    const command = `openclaw sessions send --session "agent:main:main" --message "${report.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    
    await execAsync(command);
    console.log("✅ Daily standup sent successfully");
  } catch (error) {
    console.error("❌ Failed to send daily standup:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  sendStandup();
}

module.exports = { generateStandup, sendStandup };
