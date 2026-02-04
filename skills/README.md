# Mission Control Agent Skill

A comprehensive skill for managing the Mission Control database operations through AI agents.

## Overview

This skill enables agents to perform CRUD operations on the Mission Control Convex database, including managing tasks, documents, agents, messages, notifications, and activities.

## Two Implementation Options

### Option 1: Cloudflare Agents SDK Integration

Use `mission-control-manager.ts` with the Cloudflare Agents SDK for full persistent state and advanced features.

### Option 2: Simple Class Integration

Use `mission-control-operations.ts` for a lightweight approach that works with any framework.

## Features

### Task Management

- Create new tasks with assignments and priorities
- Update task status (pending, in_progress, completed, blocked, cancelled)
- Assign tasks to agents with automatic notifications

### Document Management

- Create documents (markdown, code, json, text, link)
- Update documents with version tracking
- Associate documents with tasks

### Agent Management

- Update agent status and current task
- Agent heartbeat for presence tracking
- Status change logging

### Messaging

- Create messages with automatic activity logging
- Support for different message types (text, system, action, error)
- Auto-subscription to task threads

### Notifications

- Create notifications for agents
- Mark notifications as delivered
- Support for different notification types (info, warning, error, success)

### Thread Subscriptions

- Subscribe/unsubscribe agents to task conversations
- Auto-subscription based on actions
- Get subscriber lists for notifications

### Query Operations

- Get tasks with filtering (status, assignee, limits)
- Get agents, messages, documents, notifications
- Flexible querying with optional parameters

### Status and Health

- Track operation counts and errors
- Get current status and recent errors
- Clear error logs

## Installation

### Option 1: Cloudflare Agents SDK

1. Install the required dependencies:

```bash
npm install agents
```

2. Add the skill to your agents configuration in `wrangler.jsonc`:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "MissionControlManager",
        "class_name": "MissionControlManager",
      },
    ],
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["MissionControlManager"] },
  ],
}
```

3. Set up the Convex client in your environment to access the Mission Control database.

### Option 2: Simple Class Integration

1. Import the operations class directly:

```typescript
import { MissionControlOperations } from "./skills/mission-control-operations";
import type { MissionControlEnv } from "./skills/types";
```

2. Create an instance with your environment:

```typescript
const missionControl = new MissionControlOperations(env);
```

## Usage

### Using Cloudflare Agents SDK

```typescript
// Creating a Task
const result = await agent.call("createTask", {
  title: "Implement new feature",
  description: "Add user authentication",
  assigneeIds: ["agent1", "agent2"],
  priority: "high",
  createdBy: "agent_manager",
});

// Updating Task Status
const result = await agent.call("updateTaskStatus", {
  taskId: "task_123",
  status: "in_progress",
  agentId: "agent1",
});
```

### Using Simple Class Integration

```typescript
// Creating a Task
const result = await missionControl.createTask({
  title: "Implement new feature",
  description: "Add user authentication",
  assigneeIds: ["agent1", "agent2"],
  priority: "high",
  createdBy: "agent_manager",
});

// Updating Task Status
const result = await missionControl.updateTaskStatus({
  taskId: "task_123",
  status: "in_progress",
  agentId: "agent1",
});
```

### Creating a Document

```typescript
const result = await missionControl.createDocument({
  title: "API Documentation",
  content: "# API Reference\n...",
  type: "markdown",
  taskId: "task_123",
  createdBy: "agent1",
});
```

### Sending a Message

```typescript
const result = await missionControl.createMessage({
  taskId: "task_123",
  fromAgentId: "agent1",
  content: "Working on the authentication module",
  messageType: "text",
});
```

### Creating a Notification

```typescript
const result = await missionControl.createNotification({
  agentId: "agent2",
  content: "You have been assigned to a new high-priority task",
  notificationType: "info",
  relatedTaskId: "task_123",
});
```

2. Add the skill to your agents configuration in `wrangler.jsonc`:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "MissionControlManager",
        "class_name": "MissionControlManager",
      },
    ],
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["MissionControlManager"] },
  ],
}
```

3. Set up the Convex client in your environment to access the Mission Control database.

## Usage

### Creating a Task

```typescript
const result = await agent.call("createTask", {
  title: "Implement new feature",
  description: "Add user authentication",
  assigneeIds: ["agent1", "agent2"],
  priority: "high",
  createdBy: "agent_manager",
});
```

### Updating Task Status

```typescript
const result = await agent.call("updateTaskStatus", {
  taskId: "task_123",
  status: "in_progress",
  agentId: "agent1",
});
```

### Creating a Document

```typescript
const result = await agent.call("createDocument", {
  title: "API Documentation",
  content: "# API Reference\n...",
  type: "markdown",
  taskId: "task_123",
  createdBy: "agent1",
});
```

### Sending a Message

```typescript
const result = await agent.call("createMessage", {
  taskId: "task_123",
  fromAgentId: "agent1",
  content: "Working on the authentication module",
  messageType: "text",
});
```

### Creating a Notification

```typescript
const result = await agent.call("createNotification", {
  agentId: "agent2",
  content: "You have been assigned to a new high-priority task",
  notificationType: "info",
  relatedTaskId: "task_123",
});
```

## API Reference

### Task Operations

- `createTask(params)` - Create a new task
- `updateTaskStatus(params)` - Update task status
- `assignTask(params)` - Assign task to agents
- `getTasks(params?)` - Get tasks with optional filtering

### Document Operations

- `createDocument(params)` - Create a new document
- `updateDocument(params)` - Update an existing document
- `getDocuments(params?)` - Get documents with optional filtering

### Agent Operations

- `updateAgentStatus(params)` - Update agent status
- `agentHeartbeat(params)` - Update agent heartbeat
- `getAgents()` - Get all agents

### Message Operations

- `createMessage(params)` - Create a new message
- `getMessages(params?)` - Get messages with optional filtering

### Notification Operations

- `createNotification(params)` - Create a new notification
- `markNotificationDelivered(params)` - Mark notification as delivered
- `getNotifications(params?)` - Get notifications with optional filtering

### Subscription Operations

- `subscribeToTask(params)` - Subscribe agent to task
- `unsubscribeFromTask(params)` - Unsubscribe agent from task

### Status Operations

- `getStatus()` - Get agent status and statistics
- `clearErrors()` - Clear error logs

## Error Handling

All operations return a standardized response format:

```typescript
{
  success: boolean;
  data?: any;           // Result data if successful
  error?: string;       // Error message if failed
}
```

Errors are automatically logged in the agent state and can be retrieved through the `getStatus()` method.

## Activity Logging

The skill automatically creates activity logs for:

- Task creation and status changes
- Document creation and updates
- Agent status changes
- Message creation

This provides a complete audit trail of all operations performed through the skill.

## Integration with Mission Control

The skill integrates seamlessly with the existing Mission Control infrastructure:

- Uses the same Convex database schema
- Follows the same activity logging patterns
- Maintains thread subscriptions automatically
- Generates notifications for relevant actions

## Security Considerations

- All operations require proper agent identification
- Sensitive operations (like status updates) are logged
- Access is controlled through the agent's session key
- All database operations are validated

## Performance

- State is persisted efficiently using Agent's built-in SQLite
- Error tracking helps identify bottlenecks
- Operation counters help monitor usage patterns
- Optional limits on query results prevent excessive data transfer
