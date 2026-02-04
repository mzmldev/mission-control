// Messages queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server.js";

// List all messages
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").take(100);
  },
});

// Get messages by task
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(50);
  },
});

// Get messages by agent
export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_agent", (q) => q.eq("fromAgentId", args.agentId))
      .order("desc")
      .take(50);
  },
});

// Create a message
export const create = mutation({
  args: {
    taskId: v.optional(v.id("tasks")),
    fromAgentId: v.id("agents"),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("system"),
        v.literal("action"),
        v.literal("error"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ...args,
      messageType: args.messageType || "text",
    });

    // Create activity for this message
    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      taskId: args.taskId,
      message: args.content.slice(0, 100),
    });

    return messageId;
  },
});

// Delete a message
export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
