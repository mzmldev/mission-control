// Messages queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get messages for a task
export const getByTask = query({
  args: {
    taskId: v.id("tasks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("messages")
      .withIndex("by_task_time", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(limit);
  },
});

// Get messages by agent
export const getByAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("messages")
      .withIndex("by_agent", (q) => q.eq("fromAgentId", args.agentId))
      .order("desc")
      .take(limit);
  },
});

// Send a message
export const send = mutation({
  args: {
    fromAgentId: v.id("agents"),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("system"),
        v.literal("action"),
        v.literal("error")
      )
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      messageType: args.messageType || "text",
    });
  },
});
