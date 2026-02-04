// Documents queries and mutations
import { v } from "convex/values";
import { query, mutation } from "./_generated/server.js";

// List all documents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").order("desc").collect();
  },
});

// Get document by ID
export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get documents by task
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Create a document
export const create = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    type: v.union(
      v.literal("markdown"),
      v.literal("code"),
      v.literal("json"),
      v.literal("text"),
      v.literal("link"),
    ),
    taskId: v.optional(v.id("tasks")),
    createdBy: v.optional(v.id("agents")),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ...args,
      version: 1,
    });
  },
});

// Update document
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(id, {
      ...updates,
      version: (doc.version || 1) + 1,
    });
  },
});
