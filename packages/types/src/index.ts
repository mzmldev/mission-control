// Shared types for Mission Control dashboard

// Agent types
export type AgentStatus = "idle" | "busy" | "offline" | "error";

export interface Agent {
  _id: string;
  _creationTime: number;
  name: string;
  role: string;
  status: AgentStatus;
  sessionKey?: string;
  currentTaskId?: string;
  lastSeen?: number;
  metadata?: Record<string, any>;
}

// Task types
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  _id: string;
  _creationTime: number;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeIds: string[];
  priority: TaskPriority;
  createdBy?: string;
  parentTaskId?: string;
  dueDate?: number;
  completedAt?: number;
  metadata?: Record<string, any>;
}

// Message types
export type MessageType = "text" | "system" | "action" | "error";

export interface Message {
  _id: string;
  _creationTime: number;
  taskId?: string;
  fromAgentId: string;
  content: string;
  messageType?: MessageType;
  metadata?: Record<string, any>;
}

// Activity types
export type ActivityType =
  | "task_started"
  | "task_completed"
  | "task_failed"
  | "agent_joined"
  | "agent_left"
  | "message_sent"
  | "document_created"
  | "document_updated"
  | "status_changed";

export interface Activity {
  _id: string;
  _creationTime: number;
  type: ActivityType;
  agentId?: string;
  taskId?: string;
  message: string;
  metadata?: Record<string, any>;
}

// Document types
export type DocumentType = "markdown" | "code" | "json" | "text" | "link";

export interface Document {
  _id: string;
  _creationTime: number;
  title: string;
  content?: string;
  type: DocumentType;
  taskId?: string;
  createdBy?: string;
  version?: number;
  metadata?: Record<string, any>;
}

// Notification types
export type NotificationType = "info" | "warning" | "error" | "success";

export interface Notification {
  _id: string;
  _creationTime: number;
  agentId: string;
  content: string;
  delivered: boolean;
  notificationType?: NotificationType;
  relatedTaskId?: string;
  deliveredAt?: number;
  metadata?: Record<string, any>;
}

// Dashboard types
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  recentActivities: Activity[];
}
