import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Agents table - tracks all agents in the system
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("busy"),
      v.literal("offline"),
      v.literal("error")
    ),
    sessionKey: v.optional(v.string()),
    currentTaskId: v.optional(v.id("tasks")),
    lastSeen: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_status", ["status"])
    .index("by_session_key", ["sessionKey"])
    .index("by_current_task", ["currentTaskId"]),

  // Tasks table - tracks all tasks
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked"),
      v.literal("cancelled")
    ),
    assigneeIds: v.array(v.id("agents")),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    createdBy: v.optional(v.id("agents")),
    parentTaskId: v.optional(v.id("tasks")),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assigneeIds"])
    .index("by_priority", ["priority"])
    .index("by_parent", ["parentTaskId"]),

  // Messages table - chat/messages between agents about tasks
  messages: defineTable({
    taskId: v.optional(v.id("tasks")),
    fromAgentId: v.id("agents"),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("system"),
        v.literal("action"),
        v.literal("error")
      )
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["fromAgentId"]),

  // Activities table - logs of agent activities
  activities: defineTable({
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
  })
    .index("by_agent", ["agentId"])
    .index("by_task", ["taskId"])
    .index("by_type", ["type"]),

  // Documents table - documents associated with tasks
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    type: v.union(
      v.literal("markdown"),
      v.literal("code"),
      v.literal("json"),
      v.literal("text"),
      v.literal("link")
    ),
    taskId: v.optional(v.id("tasks")),
    createdBy: v.optional(v.id("agents")),
    version: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_task", ["taskId"])
    .index("by_type", ["type"])
    .index("by_creator", ["createdBy"]),

  // Notifications table - notifications for agents
  notifications: defineTable({
    agentId: v.id("agents"),
    content: v.string(),
    delivered: v.boolean(),
    notificationType: v.optional(
      v.union(
        v.literal("info"),
        v.literal("warning"),
        v.literal("error"),
        v.literal("success")
      )
    ),
    relatedTaskId: v.optional(v.id("tasks")),
    deliveredAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_agent", ["agentId"])
    .index("by_delivered", ["delivered"])
    .index("by_agent_delivered", ["agentId", "delivered"]),
});
