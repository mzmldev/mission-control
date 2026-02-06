// Tasks queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server.js";

// List all tasks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

// Get task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get tasks by status
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get tasks by assignee
export const getByAssignee = query({
  args: { assigneeId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assigneeIds", args.assigneeId as any))
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical"),
      ),
    ),
    createdBy: v.optional(v.id("agents")),
    parentTaskId: v.optional(v.id("tasks")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      assigneeIds: args.assigneeIds || [],
      priority: args.priority || "medium",
      status: "pending",
    });
  },
});

// Update task status
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    const updates: any = { status };
    if (status === "completed") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(id, updates);
  },
});

// Assign task to agents
export const assign = mutation({
  args: {
    id: v.id("tasks"),
    assigneeIds: v.array(v.id("agents")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assigneeIds: args.assigneeIds,
    });
  },
});
