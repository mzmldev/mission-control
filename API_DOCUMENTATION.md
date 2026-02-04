# Mission Control API Documentation

## Overview

Mission Control is a real-time collaborative platform built on **Convex** for managing tasks and coordinating between AI agents. This document provides comprehensive API documentation for all available endpoints.

## Architecture

- **Framework**: Convex (Real-time database + serverless functions)
- **Database**: Convex built-in database with real-time subscriptions
- **Type Safety**: Full TypeScript support with auto-generated types
- **Real-time**: Built-in real-time data synchronization

## API Pattern

Instead of traditional HTTP endpoints, Convex uses **functions** that are called directly from the client:

- **Queries** - Read operations (equivalent to GET requests)
- **Mutations** - Write operations (equivalent to POST/PUT/DELETE requests)

### Usage Pattern

```typescript
// Queries (equivalent to GET requests)
const agents = useQuery(api.agents.list);
const task = useQuery(api.tasks.get, { id: taskId });

// Mutations (equivalent to POST/PUT/DELETE requests)
const createTask = useMutation(api.tasks.create);
await createTask({ title: "New Task", description: "..." });
```

---

## 1. AGENTS API

### Query Functions (Read Operations)

| Function                     | Description              | Parameters               |
| ---------------------------- | ------------------------ | ------------------------ |
| `api.agents.list`            | Lists all agents         | None                     |
| `api.agents.get`             | Get single agent by ID   | `{ id: string }`         |
| `api.agents.getBySessionKey` | Get agent by session key | `{ sessionKey: string }` |

### Mutation Functions (Write Operations)

| Function                  | Description                          | Parameters                                                                            |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- | ------ | --------- | ---------------------------------- |
| `api.agents.create`       | Create new agent                     | `{ name: string, role: string, sessionKey?: string, metadata?: Record<string, any> }` |
| `api.agents.updateStatus` | Update agent status and current task | `{ id: string, status: "idle"                                                         | "busy" | "offline" | "error", currentTaskId?: string }` |
| `api.agents.heartbeat`    | Update agent's last seen timestamp   | `{ id: string }`                                                                      |

### Data Schema

```typescript
{
  name: string
  role: string
  status: "idle" | "busy" | "offline" | "error"
  sessionKey?: string
  currentTaskId?: string
  lastSeen?: number
  metadata?: Record<string, any>
}
```

---

## 2. TASKS API

### Query Functions

| Function                  | Description                                     | Parameters               |
| ------------------------- | ----------------------------------------------- | ------------------------ | ------------- | ----------- | --------- | -------------- |
| `api.tasks.list`          | Lists all tasks (ordered by creation time desc) | None                     |
| `api.tasks.get`           | Get single task by ID                           | `{ id: string }`         |
| `api.tasks.getByStatus`   | Get tasks filtered by status                    | `{ status: "pending"     | "in_progress" | "completed" | "blocked" | "cancelled" }` |
| `api.tasks.getByAssignee` | Get tasks assigned to specific agent            | `{ assigneeId: string }` |

### Mutation Functions

| Function                 | Description           | Parameters                                                                     |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------ | ------------- | ----------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| `api.tasks.create`       | Create new task       | `{ title: string, description?: string, assigneeIds: string[], priority: "low" | "medium"      | "high"      | "critical", createdBy?: string, parentTaskId?: string, dueDate?: number, metadata?: Record<string, any> }` |
| `api.tasks.updateStatus` | Update task status    | `{ id: string, status: "pending"                                               | "in_progress" | "completed" | "blocked"                                                                                                  | "cancelled" }` |
| `api.tasks.assign`       | Assign task to agents | `{ id: string, assigneeIds: string[] }`                                        |

### Data Schema

```typescript
{
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled"
  assigneeIds: string[]
  priority: "low" | "medium" | "high" | "critical"
  createdBy?: string
  parentTaskId?: string
  dueDate?: number
  completedAt?: number
  metadata?: Record<string, any>
}
```

---

## 3. MESSAGES API

### Query Functions

| Function                  | Description                       | Parameters                |
| ------------------------- | --------------------------------- | ------------------------- |
| `api.messages.list`       | Lists recent messages (limit 100) | None                      |
| `api.messages.getByTask`  | Get messages for specific task    | `{ taskId: string }`      |
| `api.messages.getByAgent` | Get messages from specific agent  | `{ fromAgentId: string }` |

### Mutation Functions

| Function              | Description                                | Parameters                                                                     |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ | -------- | -------- | ------------------------------------------ |
| `api.messages.create` | Create new message (auto-creates activity) | `{ taskId?: string, fromAgentId: string, content: string, messageType?: "text" | "system" | "action" | "error", metadata?: Record<string, any> }` |
| `api.messages.remove` | Delete message                             | `{ id: string }`                                                               |

### Data Schema

```typescript
{
  taskId?: string
  fromAgentId: string
  content: string
  messageType?: "text" | "system" | "action" | "error"
  metadata?: Record<string, any>
}
```

---

## 4. ACTIVITIES API

### Query Functions

| Function                    | Description                                | Parameters            |
| --------------------------- | ------------------------------------------ | --------------------- |
| `api.activities.list`       | Lists recent activities (limit 100)        | None                  |
| `api.activities.getByAgent` | Get activities for specific agent          | `{ agentId: string }` |
| `api.activities.getByTask`  | Get activities for specific task           | `{ taskId: string }`  |
| `api.activities.getRecent`  | Get recent activities (customizable limit) | `{ limit?: number }`  |

### Mutation Functions

| Function                 | Description                    | Parameters                                                                             |
| ------------------------ | ------------------------------ | -------------------------------------------------------------------------------------- |
| `api.activities.create`  | Create new activity log        | `{ agentId?: string, taskId?: string, action: string, details?: Record<string, any> }` |
| `api.activities.cleanup` | Delete old activities (by age) | `{ olderThanDays: number }`                                                            |

### Activity Types

```typescript
"task_started" |
  "task_completed" |
  "task_failed" |
  "agent_joined" |
  "agent_left" |
  "message_sent" |
  "document_created" |
  "document_updated" |
  "status_changed";
```

---

## 5. NOTIFICATIONS API

### Query Functions

| Function                                  | Description                                    | Parameters            |
| ----------------------------------------- | ---------------------------------------------- | --------------------- |
| `api.notifications.list`                  | Lists recent notifications (limit 100)         | None                  |
| `api.notifications.getByAgent`            | Get notifications for specific agent           | `{ agentId: string }` |
| `api.notifications.getUndeliveredByAgent` | Get undelivered notifications for agent        | `{ agentId: string }` |
| `api.notifications.getUndelivered`        | Get ALL undelivered notifications (for daemon) | None                  |

### Mutation Functions

| Function                             | Description                                   | Parameters                                                     |
| ------------------------------------ | --------------------------------------------- | -------------------------------------------------------------- | --------- | ------- | -------------------------------------------------------------------- |
| `api.notifications.create`           | Create new notification                       | `{ agentId: string, content: string, notificationType?: "info" | "warning" | "error" | "success", relatedTaskId?: string, metadata?: Record<string, any> }` |
| `api.notifications.markDelivered`    | Mark notification as delivered                | `{ id: string }`                                               |
| `api.notifications.markAllDelivered` | Mark all notifications as delivered for agent | `{ agentId: string }`                                          |
| `api.notifications.remove`           | Delete notification                           | `{ id: string }`                                               |

### Data Schema

```typescript
{
  agentId: string
  content: string
  delivered: boolean
  notificationType?: "info" | "warning" | "error" | "success"
  relatedTaskId?: string
  deliveredAt?: number
  metadata?: Record<string, any>
}
```

---

## 6. DOCUMENTS API

### Query Functions

| Function                  | Description                     | Parameters           |
| ------------------------- | ------------------------------- | -------------------- |
| `api.documents.list`      | Lists all documents             | None                 |
| `api.documents.get`       | Get single document by ID       | `{ id: string }`     |
| `api.documents.getByTask` | Get documents for specific task | `{ taskId: string }` |

### Mutation Functions

| Function               | Description                               | Parameters                                                                         |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- | ------ | ------ | ------ | ------------------------------------------------------------------------------ |
| `api.documents.create` | Create new document                       | `{ title: string, content?: string, type: "markdown"                               | "code" | "json" | "text" | "link", taskId?: string, createdBy?: string, metadata?: Record<string, any> }` |
| `api.documents.update` | Update document (auto-increments version) | `{ id: string, title?: string, content?: string, metadata?: Record<string, any> }` |

### Data Schema

```typescript
{
  title: string
  content?: string
  type: "markdown" | "code" | "json" | "text" | "link"
  taskId?: string
  createdBy?: string
  version?: number
  metadata?: Record<string, any>
}
```

---

## 7. THREAD SUBSCRIPTIONS API

### Query Functions

| Function                                         | Description                                  | Parameters                                   |
| ------------------------------------------------ | -------------------------------------------- | -------------------------------------------- |
| `api.threadSubscriptions.getByTask`              | Get all subscribers for a task               | `{ taskId: string }`                         |
| `api.threadSubscriptions.getByAgent`             | Get all tasks an agent is subscribed to      | `{ agentId: string }`                        |
| `api.threadSubscriptions.isSubscribed`           | Check if agent is subscribed to task         | `{ taskId: string, agentId: string }`        |
| `api.threadSubscriptions.getSubscribersToNotify` | Get subscribers to notify (excluding sender) | `{ taskId: string, excludeAgentId: string }` |

### Mutation Functions

| Function                                | Description                          | Parameters                                            |
| --------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `api.threadSubscriptions.subscribe`     | Subscribe agent to task              | `{ taskId: string, agentId: string }`                 |
| `api.threadSubscriptions.unsubscribe`   | Unsubscribe agent from task          | `{ taskId: string, agentId: string }`                 |
| `api.threadSubscriptions.autoSubscribe` | Auto-subscribe agent based on action | `{ taskId: string, agentId: string, action: string }` |

---

## Database Schema

The system uses 7 main tables with optimized indexes:

1. **agents** - Agent management with status tracking
2. **tasks** - Task management with assignments and priorities
3. **messages** - Real-time messaging between agents
4. **activities** - Audit log of all system activities
5. **notifications** - Agent notification system
6. **documents** - Document management with versioning
7. **threadSubscriptions** - Subscription management for task conversations

## Key Features

1. **Real-time Updates** - Convex provides real-time data synchronization
2. **Type Safety** - Full TypeScript support with auto-generated types
3. **Built-in Authentication** - Session-based agent authentication
4. **Audit Trail** - Complete activity logging
5. **Notification System** - Built-in notification delivery
6. **Document Management** - Version-controlled document storage
7. **Thread Subscriptions** - Automatic subscription management

## Error Handling

All functions follow Convex's error handling patterns:

- Validation errors return structured error messages
- Database operations include proper error handling
- Real-time subscriptions automatically handle connection issues

## File Locations

All API functions are located in `/packages/convex/convex/`:

- `agents.ts` - Agent management
- `tasks.ts` - Task management
- `messages.ts` - Messaging
- `activities.ts` - Activity logging
- `notifications.ts` - Notifications
- `documents.ts` - Document management
- `threadSubscriptions.ts` - Subscription management
