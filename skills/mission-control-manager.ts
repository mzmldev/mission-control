import type { MissionControlEnv } from "./types";

/**
 * Mission Control Agent Skill - Database Management
 *
 * This skill enables agents to manage the Mission Control database operations
 * including creating, updating, and managing tasks, documents, agents, messages,
 * notifications, and activities.
 */

type State = {
  lastSyncTime?: number;
  operationCount: number;
  errors: string[];
};

export class MissionControlManager extends Agent<MissionControlEnv, State> {
  initialState = {
    operationCount: 0,
    errors: [],
  };

  // Task Management Operations
  @callable()
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
    try {
      this.setState({
        operationCount: this.state.operationCount + 1,
        errors: this.state.errors,
      });

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

      return { success: true, taskId: result };
    } catch (error) {
      const errorMsg = `Failed to create task: ${error}`;
      this.setState({
        errors: [...this.state.errors, errorMsg],
        operationCount: this.state.operationCount,
      });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async updateTaskStatus(params: {
    taskId: string;
    status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
    agentId?: string;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

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

      return { success: true, task: result };
    } catch (error) {
      const errorMsg = `Failed to update task status: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async assignTask(params: {
    taskId: string;
    assigneeIds: string[];
    agentId?: string;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

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

      return { success: true, task: result };
    } catch (error) {
      const errorMsg = `Failed to assign task: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Document Management Operations
  @callable()
  async createDocument(params: {
    title: string;
    content?: string;
    type: "markdown" | "code" | "json" | "text" | "link";
    taskId?: string;
    createdBy?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

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

      return { success: true, documentId: result };
    } catch (error) {
      const errorMsg = `Failed to create document: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async updateDocument(params: {
    documentId: string;
    title?: string;
    content?: string;
    agentId?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

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

      return { success: true, document: result };
    } catch (error) {
      const errorMsg = `Failed to update document: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Agent Management Operations
  @callable()
  async updateAgentStatus(params: {
    agentId: string;
    status: "idle" | "busy" | "offline" | "error";
    currentTaskId?: string;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

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

      return { success: true, agent: result };
    } catch (error) {
      const errorMsg = `Failed to update agent status: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async agentHeartbeat(params: { agentId: string }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

      const result = await this.env.convex.mutation("api.agents.heartbeat", {
        id: params.agentId,
      });

      return { success: true, agent: result };
    } catch (error) {
      const errorMsg = `Failed to update agent heartbeat: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Message Operations
  @callable()
  async createMessage(params: {
    taskId?: string;
    fromAgentId: string;
    content: string;
    messageType?: "text" | "system" | "action" | "error";
    metadata?: Record<string, any>;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

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

      return { success: true, messageId: result };
    } catch (error) {
      const errorMsg = `Failed to create message: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Notification Operations
  @callable()
  async createNotification(params: {
    agentId: string;
    content: string;
    notificationType?: "info" | "warning" | "error" | "success";
    relatedTaskId?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

      const result = await this.env.convex.mutation(
        "api.notifications.create",
        {
          agentId: params.agentId,
          content: params.content,
          notificationType: params.notificationType || "info",
          relatedTaskId: params.relatedTaskId,
          metadata: params.metadata,
        },
      );

      return { success: true, notificationId: result };
    } catch (error) {
      const errorMsg = `Failed to create notification: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async markNotificationDelivered(params: { notificationId: string }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

      const result = await this.env.convex.mutation(
        "api.notifications.markDelivered",
        {
          id: params.notificationId,
        },
      );

      return { success: true, notification: result };
    } catch (error) {
      const errorMsg = `Failed to mark notification as delivered: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Thread Subscription Operations
  @callable()
  async subscribeToTask(params: { taskId: string; agentId: string }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

      const result = await this.env.convex.mutation(
        "api.threadSubscriptions.subscribe",
        {
          taskId: params.taskId,
          agentId: params.agentId,
        },
      );

      return { success: true, subscription: result };
    } catch (error) {
      const errorMsg = `Failed to subscribe to task: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async unsubscribeFromTask(params: { taskId: string; agentId: string }) {
    try {
      this.setState({ operationCount: this.state.operationCount + 1 });

      const result = await this.env.convex.mutation(
        "api.threadSubscriptions.unsubscribe",
        {
          taskId: params.taskId,
          agentId: params.agentId,
        },
      );

      return { success: true, subscription: result };
    } catch (error) {
      const errorMsg = `Failed to unsubscribe from task: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Query Operations
  @callable()
  async getTasks(params?: {
    status?: string;
    assigneeId?: string;
    limit?: number;
  }) {
    try {
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

      return {
        success: true,
        tasks: params?.limit ? tasks.slice(0, params.limit) : tasks,
      };
    } catch (error) {
      const errorMsg = `Failed to get tasks: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async getAgents() {
    try {
      const agents = await this.env.convex.query("api.agents.list");
      return { success: true, agents };
    } catch (error) {
      const errorMsg = `Failed to get agents: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async getMessages(params?: {
    taskId?: string;
    fromAgentId?: string;
    limit?: number;
  }) {
    try {
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

      return {
        success: true,
        messages: params?.limit ? messages.slice(0, params.limit) : messages,
      };
    } catch (error) {
      const errorMsg = `Failed to get messages: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async getDocuments(params?: { taskId?: string; limit?: number }) {
    try {
      let documents;

      if (params?.taskId) {
        documents = await this.env.convex.query("api.documents.getByTask", {
          taskId: params.taskId,
        });
      } else {
        documents = await this.env.convex.query("api.documents.list");
      }

      return {
        success: true,
        documents: params?.limit ? documents.slice(0, params.limit) : documents,
      };
    } catch (error) {
      const errorMsg = `Failed to get documents: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  @callable()
  async getNotifications(params?: {
    agentId?: string;
    undeliveredOnly?: boolean;
    limit?: number;
  }) {
    try {
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

      return {
        success: true,
        notifications: params?.limit
          ? notifications.slice(0, params.limit)
          : notifications,
      };
    } catch (error) {
      const errorMsg = `Failed to get notifications: ${error}`;
      this.setState({ errors: [...this.state.errors, errorMsg] });
      return { success: false, error: errorMsg };
    }
  }

  // Status and Health Operations
  @callable()
  async getStatus() {
    return {
      success: true,
      status: {
        operationCount: this.state.operationCount,
        lastSyncTime: this.state.lastSyncTime,
        errorCount: this.state.errors.length,
        recentErrors: this.state.errors.slice(-5),
      },
    };
  }

  @callable()
  async clearErrors() {
    this.setState({ errors: [] });
    return { success: true };
  }
}

export default {
  fetch: (req, env) =>
    routeAgentRequest(req, env) ?? new Response("Not found", { status: 404 }),
};
