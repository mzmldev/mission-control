// Notifications queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all notifications
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notifications").order("desc").take(100);
  },
});

// Get notifications for an agent
export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(50);
  },
});

// Get undelivered notifications for an agent
export const getUndelivered = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_agent_delivered", (q) => 
        q.eq("agentId", args.agentId).eq("delivered", false)
      )
      .order("desc")
      .take(50);
  },
});

// Create a notification
export const create = mutation({
  args: {
    agentId: v.id("agents"),
    content: v.string(),
    notificationType: v.optional(v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("success")
    )),
    relatedTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      notificationType: args.notificationType || "info",
      delivered: false,
    });
  },
});

// Mark notification as delivered
export const markDelivered = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      delivered: true,
      deliveredAt: Date.now(),
    });
  },
});

// Mark all notifications as delivered for an agent
export const markAllDelivered = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_agent_delivered", (q) => 
        q.eq("agentId", args.agentId).eq("delivered", false)
      )
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        delivered: true,
        deliveredAt: Date.now(),
      });
    }
  },
});

// Delete a notification
export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
