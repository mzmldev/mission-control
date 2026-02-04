// Activities queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all activities
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activities").order("desc").take(100);
  },
});

// Get activities by agent
export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(50);
  },
});

// Get activities by task
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(50);
  },
});

// Get recent activities (newspaper style)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit || 50);
  },
});

// Create an activity
export const create = mutation({
  args: {
    type: v.union(
      v.literal("task_started"),
      v.literal("task_completed"),
      v.literal("task_failed"),
      v.literal("agent_joined"),
      v.literal("agent_left"),
      v.literal("message_sent"),
      v.literal("document_created"),
      v.literal("document_updated"),
      v.literal("status_changed")
    ),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});

// Delete old activities
export const cleanup = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.lt(q.field("_creationTime"), cutoff))
      .collect();
    
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }
    
    return activities.length;
  },
});
