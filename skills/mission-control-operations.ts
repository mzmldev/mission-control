/**
 * Mission Control Database Operations Skill
 *
 * A simplified version that can be used with existing frameworks
 * without requiring the agents-sdk dependency.
 */

import type { MissionControlEnv } from "./types";

export class MissionControlOperations {
  private env: MissionControlEnv;
  private operationCount: number = 0;
  private errors: string[] = [];

  constructor(env: MissionControlEnv) {
    this.env = env;
  }

  private async handleOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      this.operationCount++;
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      const errorMsg = `Failed to ${operationName}: ${error}`;
      this.errors.push(errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Task Management Operations
  async createTask(params: {
    title: string;
    description?: string;
    assigneeIds: string[];
    priority?: "low" | "medium" | "high" | "critical";
    createdBy?: string;
    parentTaskId?: string;
    dueDate?: number;
    metadata?: Record<string, any>;
  }) {
    return this.handleOperation("create task", async () => {
      const result = await this.env.convex.mutation("api.tasks.create", {
        title: params.title,
        description: params.description,
        assigneeIds: params.assigneeIds,
        priority: params.priority || "medium",
        createdBy: params.createdBy,
        parentTaskId: params.parentTaskId,
        dueDate: params.dueDate,
        metadata: params.metadata,
      });

      // Log activity
      await this.env.convex.mutation("api.activities.create", {
        agentId: params.createdBy,
        taskId: result,
        action: "task_created",
        details: { title: params.title, priority: params.priority },
      });

      return result;
    });
  }

  async updateTaskStatus(params: {
    taskId: string;
    status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
    agentId?: string;
  }) {
    return this.handleOperation("update task status", async () => {
      const result = await this.env.convex.mutation("api.tasks.updateStatus", {
        id: params.taskId,
        status: params.status,
      });

      // Get task details for activity log
      const task = await this.env.convex.query("api.tasks.get", {
        id: params.taskId,
      });

      await this.env.convex.mutation("api.activities.create", {
        agentId: params.agentId,
        taskId: params.taskId,
        action: `task_${params.status}`,
        details: { taskTitle: task?.title },
      });

      return result;
    });
  }

  async assignTask(params: {
    taskId: string;
    assigneeIds: string[];
    agentId?: string;
  }) {
    return this.handleOperation("assign task", async () => {
      const result = await this.env.convex.mutation("api.tasks.assign", {
        id: params.taskId,
        assigneeIds: params.assigneeIds,
      });

      // Create notifications for assignees
      for (const assigneeId of params.assigneeIds) {
        await this.env.convex.mutation("api.notifications.create", {
          agentId: assigneeId,
          content: `You have been assigned to a new task`,
          notificationType: "info",
          relatedTaskId: params.taskId,
        });
      }

      return result;
    });
  }

  async getTasks(params?: {
    status?: string;
    assigneeId?: string;
    limit?: number;
  }) {
    return this.handleOperation("get tasks", async () => {
      let tasks;

      if (params?.status) {
        tasks = await this.env.convex.query("api.tasks.getByStatus", {
          status: params.status as any,
        });
      } else if (params?.assigneeId) {
        tasks = await this.env.convex.query("api.tasks.getByAssignee", {
          assigneeId: params.assigneeId,
        });
      } else {
        tasks = await this.env.convex.query("api.tasks.list");
      }

      return params?.limit ? tasks.slice(0, params.limit) : tasks;
    });
  }

  // Document Management Operations
  async createDocument(params: {
    title: string;
    content?: string;
    type: "markdown" | "code" | "json" | "text" | "link";
    taskId?: string;
    createdBy?: string;
    metadata?: Record<string, any>;
  }) {
    return this.handleOperation("create document", async () => {
      const result = await this.env.convex.mutation("api.documents.create", {
        title: params.title,
        content: params.content,
        type: params.type,
        taskId: params.taskId,
        createdBy: params.createdBy,
        metadata: params.metadata,
      });

      // Log activity
      await this.env.convex.mutation("api.activities.create", {
        agentId: params.createdBy,
        taskId: params.taskId,
        action: "document_created",
        details: { documentTitle: params.title, type: params.type },
      });

      return result;
    });
  }

  async updateDocument(params: {
    documentId: string;
    title?: string;
    content?: string;
    agentId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.handleOperation("update document", async () => {
      const result = await this.env.convex.mutation("api.documents.update", {
        id: params.documentId,
        title: params.title,
        content: params.content,
        metadata: params.metadata,
      });

      // Get document details for activity log
      const doc = await this.env.convex.query("api.documents.get", {
        id: params.documentId,
      });

      await this.env.convex.mutation("api.activities.create", {
        agentId: params.agentId,
        taskId: doc?.taskId,
        action: "document_updated",
        details: { documentTitle: doc?.title },
      });

      return result;
    });
  }

  async getDocuments(params?: { taskId?: string; limit?: number }) {
    return this.handleOperation("get documents", async () => {
      let documents;

      if (params?.taskId) {
        documents = await this.env.convex.query("api.documents.getByTask", {
          taskId: params.taskId,
        });
      } else {
        documents = await this.env.convex.query("api.documents.list");
      }

      return params?.limit ? documents.slice(0, params.limit) : documents;
    });
  }

  // Agent Management Operations
  async updateAgentStatus(params: {
    agentId: string;
    status: "idle" | "busy" | "offline" | "error";
    currentTaskId?: string;
  }) {
    return this.handleOperation("update agent status", async () => {
      const result = await this.env.convex.mutation("api.agents.updateStatus", {
        id: params.agentId,
        status: params.status,
        currentTaskId: params.currentTaskId,
      });

      await this.env.convex.mutation("api.activities.create", {
        agentId: params.agentId,
        action: "status_changed",
        details: {
          newStatus: params.status,
          currentTaskId: params.currentTaskId,
        },
      });

      return result;
    });
  }

  async agentHeartbeat(params: { agentId: string }) {
    return this.handleOperation("agent heartbeat", async () => {
      return await this.env.convex.mutation("api.agents.heartbeat", {
        id: params.agentId,
      });
    });
  }

  async getAgents() {
    return this.handleOperation("get agents", async () => {
      return await this.env.convex.query("api.agents.list");
    });
  }

  // Message Operations
  async createMessage(params: {
    taskId?: string;
    fromAgentId: string;
    content: string;
    messageType?: "text" | "system" | "action" | "error";
    metadata?: Record<string, any>;
  }) {
    return this.handleOperation("create message", async () => {
      const result = await this.env.convex.mutation("api.messages.create", {
        taskId: params.taskId,
        fromAgentId: params.fromAgentId,
        content: params.content,
        messageType: params.messageType || "text",
        metadata: params.metadata,
      });

      // Auto-subscribe message sender to task thread
      if (params.taskId) {
        await this.env.convex.mutation(
          "api.threadSubscriptions.autoSubscribe",
          {
            taskId: params.taskId,
            agentId: params.fromAgentId,
            action: "message_sent",
          },
        );
      }

      return result;
    });
  }

  async getMessages(params?: {
    taskId?: string;
    fromAgentId?: string;
    limit?: number;
  }) {
    return this.handleOperation("get messages", async () => {
      let messages;

      if (params?.taskId) {
        messages = await this.env.convex.query("api.messages.getByTask", {
          taskId: params.taskId,
        });
      } else if (params?.fromAgentId) {
        messages = await this.env.convex.query("api.messages.getByAgent", {
          fromAgentId: params.fromAgentId,
        });
      } else {
        messages = await this.env.convex.query("api.messages.list");
      }

      return params?.limit ? messages.slice(0, params.limit) : messages;
    });
  }

  // Notification Operations
  async createNotification(params: {
    agentId: string;
    content: string;
    notificationType?: "info" | "warning" | "error" | "success";
    relatedTaskId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.handleOperation("create notification", async () => {
      return await this.env.convex.mutation("api.notifications.create", {
        agentId: params.agentId,
        content: params.content,
        notificationType: params.notificationType || "info",
        relatedTaskId: params.relatedTaskId,
        metadata: params.metadata,
      });
    });
  }

  async markNotificationDelivered(params: { notificationId: string }) {
    return this.handleOperation("mark notification delivered", async () => {
      return await this.env.convex.mutation("api.notifications.markDelivered", {
        id: params.notificationId,
      });
    });
  }

  async getNotifications(params?: {
    agentId?: string;
    undeliveredOnly?: boolean;
    limit?: number;
  }) {
    return this.handleOperation("get notifications", async () => {
      let notifications;

      if (params?.agentId) {
        if (params?.undeliveredOnly) {
          notifications = await this.env.convex.query(
            "api.notifications.getUndeliveredByAgent",
            {
              agentId: params.agentId,
            },
          );
        } else {
          notifications = await this.env.convex.query(
            "api.notifications.getByAgent",
            {
              agentId: params.agentId,
            },
          );
        }
      } else if (params?.undeliveredOnly) {
        notifications = await this.env.convex.query(
          "api.notifications.getUndelivered",
        );
      } else {
        notifications = await this.env.convex.query("api.notifications.list");
      }

      return params?.limit
        ? notifications.slice(0, params.limit)
        : notifications;
    });
  }

  // Thread Subscription Operations
  async subscribeToTask(params: { taskId: string; agentId: string }) {
    return this.handleOperation("subscribe to task", async () => {
      return await this.env.convex.mutation(
        "api.threadSubscriptions.subscribe",
        {
          taskId: params.taskId,
          agentId: params.agentId,
        },
      );
    });
  }

  async unsubscribeFromTask(params: { taskId: string; agentId: string }) {
    return this.handleOperation("unsubscribe from task", async () => {
      return await this.env.convex.mutation(
        "api.threadSubscriptions.unsubscribe",
        {
          taskId: params.taskId,
          agentId: params.agentId,
        },
      );
    });
  }

  // Status and Health Operations
  getStatus() {
    return {
      success: true,
      data: {
        operationCount: this.operationCount,
        errorCount: this.errors.length,
        recentErrors: this.errors.slice(-5),
      },
    };
  }

  clearErrors() {
    this.errors = [];
    return { success: true, data: "Errors cleared" };
  }
}
