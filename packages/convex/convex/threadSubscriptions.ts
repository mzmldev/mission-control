// Thread subscriptions for task conversations
// Agents auto-subscribe when they comment, are assigned, or are mentioned

import { v } from "convex/values";
import { query, mutation } from "./_generated/server.js";

// Get all subscribers for a task
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Get all tasks an agent is subscribed to
export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
  },
});

// Check if agent is subscribed to a task
export const isSubscribed = query({
  args: { 
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task_agent", (q) => 
        q.eq("taskId", args.taskId).eq("agentId", args.agentId)
      )
      .first();
    return !!subscription;
  },
});

// Subscribe an agent to a task
export const subscribe = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already subscribed
    const existing = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task_agent", (q) => 
        q.eq("taskId", args.taskId).eq("agentId", args.agentId)
      )
      .first();
    
    if (existing) {
      return { id: existing._id, alreadySubscribed: true };
    }
    
    const id = await ctx.db.insert("threadSubscriptions", {
      taskId: args.taskId,
      agentId: args.agentId,
      subscribedAt: Date.now(),
      reason: args.reason,
    });
    
    return { id, alreadySubscribed: false };
  },
});

// Unsubscribe an agent from a task
export const unsubscribe = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task_agent", (q) => 
        q.eq("taskId", args.taskId).eq("agentId", args.agentId)
      )
      .first();
    
    if (subscription) {
      await ctx.db.delete(subscription._id);
      return { success: true };
    }
    
    return { success: false, error: "Not subscribed" };
  },
});

// Auto-subscribe agent when they perform an action on a task
export const autoSubscribe = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    action: v.union(
      v.literal("commented"),
      v.literal("assigned"),
      v.literal("mentioned"),
      v.literal("created")
    ),
  },
  handler: async (ctx, args) => {
    const reasonMap = {
      commented: "You commented on this task",
      assigned: "You were assigned to this task",
      mentioned: "You were mentioned in this task",
      created: "You created this task",
    };
    
    const existing = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task_agent", (q) => 
        q.eq("taskId", args.taskId).eq("agentId", args.agentId)
      )
      .first();
    
    if (existing) {
      return { id: existing._id, alreadySubscribed: true };
    }
    
    const id = await ctx.db.insert("threadSubscriptions", {
      taskId: args.taskId,
      agentId: args.agentId,
      subscribedAt: Date.now(),
      reason: reasonMap[args.action],
    });
    
    return { id, alreadySubscribed: false };
  },
});

// Get subscribers to notify (excluding the sender)
export const getSubscribersToNotify = query({
  args: {
    taskId: v.id("tasks"),
    excludeAgentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const allSubscribers = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    
    return allSubscribers.filter(sub => sub.agentId !== args.excludeAgentId);
  },
});
