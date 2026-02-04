// Activities queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List recent activities
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("activities")
      .order("desc")
      .take(limit);
  },
});

// Get activities by agent
export const getByAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("activities")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(limit);
  },
});

// Get activities by task
export const getByTask = query({
  args: {
    taskId: v.id("tasks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("activities")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(limit);
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
