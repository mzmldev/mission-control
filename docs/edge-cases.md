# Edge Case Analysis: Mission Control Dashboard

## Overview
This document identifies critical edge cases for a real-time Mission Control dashboard managing 10 AI agents with Convex backend, 15-minute heartbeat intervals, and @mentions/notifications.

---

## 1. UX Edge Cases

### Concurrent Task Editing
| Aspect | Details |
|--------|---------|
| **Severity** | 🔴 **High** |
| **Scenario** | Two agents (or a human and agent) edit the same task simultaneously |
| **Symptoms** | Last-write-wins data loss, conflicting status updates, overwritten descriptions |
| **Impact** | Task state corruption, duplicate work, agent confusion |

**Recommended Solutions:**
1. **Optimistic Locking**: Implement version fields on tasks; reject updates with stale versions
2. **Operational Transforms**: Use Convex's `mutation` with conflict resolution strategies
3. **Presence Indicators**: Show "Agent X is editing..." to prevent collisions
4. **Field-Level Granularity**: Lock individual fields, not entire tasks

```typescript
// Example: Version-based conflict detection
const updateTask = mutation({
  args: { taskId: v.id("tasks"), updates: v.object({...}), expectedVersion: v.number() },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (task.version !== args.expectedVersion) {
      throw new Error("Conflict: Task was modified by another agent");
    }
    return ctx.db.patch(args.taskId, { ...args.updates, version: task.version + 1 });
  }
});
```

---

### Offline Agent Detection & Display
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Scenario** | Agent misses 2+ heartbeats (30+ minutes offline) |
| **Symptoms** | UI shows agent as "active" when unavailable; tasks assigned to ghost agents |
| **Impact** | Deadlocks on assigned tasks, unrealistic SLA expectations |

**Recommended Solutions:**
1. **Grace Period**: Mark "stale" after 15 min, "offline" after 30 min
2. **Auto-Reassignment**: Offer to reassign tasks from offline agents
3. **Visual Degradation**: Gray out avatar, show "Last seen X min ago"
4. **Stale Task Queue**: Surface tasks assigned to offline agents for redistribution

---

### Notification Spam / @mention Flooding
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Scenario** | Agent mentions @all or multiple agents in rapid succession; circular @mention chains |
| **Symptoms** | Notification fatigue, dropped important alerts, agent thrashing |
| **Impact** | Agents miss critical notifications; system feels chaotic |

**Recommended Solutions:**
1. **Rate Limiting**: Max 5 @mentions/minute per agent; burst allowance for emergencies
2. **Deduplication**: Batch multiple mentions in same task into single notification
3. **Urgency Levels**: `@agent` (normal) vs `@agent!` (urgent); filter by priority
4. **Quiet Hours**: Respect agent-configured focus windows
5. **Digest Mode**: Option to batch non-urgent mentions into 15-min digests

---

### Agent Identity Confusion
| Aspect | Details |
|--------|---------|
| **Severity** | 🟢 **Low** |
| **Scenario** | Similar agent names ("Researcher-1" vs "Researcher-2") cause mis-assignment |
| **Symptoms** | Tasks go to wrong agent; @mentions target incorrect recipient |
| **Impact** | Workflow delays, inter-agent miscommunication |

**Recommended Solutions:**
1. **Distinct Avatars**: Unique colors/icons per agent (not just names)
2. **Autocomplete**: Show agent specialty/role in mention dropdown
3. **Confirmation Dialog**: For high-priority tasks, confirm assignment

---

## 2. Data Consistency

### Race Condition: Task Status Transitions
| Aspect | Details |
|--------|---------|
| **Severity** | 🔴 **High** |
| **Scenario** | Two agents simultaneously transition task: `in_progress` → `done` and `in_progress` → `blocked` |
| **Symptoms** | Invalid state combinations (done + blocked simultaneously) |
| **Impact** | State machine corruption, workflow logic breaks |

**Recommended Solutions:**
1. **State Machine Enforcement**: Centralized transition validation
2. **Single Writer Pattern**: Route all status changes through coordinator agent
3. **Atomic Updates**: Use Convex's transactional guarantees

```typescript
// Valid transitions matrix
const VALID_TRANSITIONS = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['done', 'blocked', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  done: ['archived'],
  cancelled: [],
  archived: []
};
```

---

### Stale Heartbeat False Positives
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Scenario** | Agent is processing a long task (>15 min) and doesn't heartbeat; OR network blip |
| **Symptoms** | Healthy agents marked offline; unnecessary panic/reassignment |
| **Impact** | Churn, duplicate work, agent frustration |

**Recommended Solutions:**
1. **Task-Aware Heartbeats**: Agents can indicate "busy with long task" status
2. **Heartbeat Exponential Backoff**: Missed beat → retry in 2 min, 4 min, 8 min...
3. **Network Partition Detection**: Distinguish agent crash from network issues
4. **Graceful Degradation**: Allow agents to self-report extended busy periods

---

### Clock Skew in Activity Timestamps
| Aspect | Details |
|--------|---------|
| **Severity** | 🟢 **Low** |
| **Scenario** | Agent system clocks differ; server vs client timestamp mismatch |
| **Symptoms** | Activity feed shows future/past events out of order |
| **Impact** | Audit trail confusion, incorrect "time since" calculations |

**Recommended Solutions:**
1. **Server-Authoritative Timestamps**: All timestamps set by Convex backend
2. **Monotonic Clocks**: Use `Date.now()` from mutation context, not client
3. **Ordering Guarantee**: Convex's internal `_creationTime` for sequencing

---

### Orphaned Tasks (No Owner)
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Scenario** | Agent crashes during task assignment; or task created without assignee |
| **Symptoms** | Tasks exist in DB but appear in no agent's view |
| **Impact** | Work falls through cracks; invisible backlog accumulation |

**Recommended Solutions:**
1. **Required Assignee**: Schema validation prevents unassigned tasks
2. **Default Owner**: Auto-assign to coordinator/scheduler agent
3. **Orphan Detector**: Scheduled query to find `assignedTo: null` tasks
4. **Escalation Path**: Unclaimed tasks auto-escalate after N minutes

---

## 3. Scalability

### Activity Feed Unbounded Growth
| Aspect | Details |
|--------|---------|
| **Severity** | 🔴 **High** |
| **Scenario** | 10 agents × 100 actions/day × 365 days = 365K activity records |
| **Symptoms** | Query latency degrades; dashboard loads slowly; memory pressure |
| **Impact** | Poor UX, increasing infrastructure costs |

**Recommended Solutions:**
1. **Time-Boxed Queries**: Default to "last 24 hours"; paginate everything
2. **Aggressive Archival**: Move >30 day activities to cold storage
3. **Aggregation Tables**: Pre-compute daily summaries; detail on demand
4. **Capped Collections**: Convex doesn't natively support TTL, implement soft-delete

```typescript
// Pagination pattern for activity feed
const getRecentActivity = query({
  args: { cursor: v.optional(v.string()), limit: v.number() },
  handler: async (ctx, args) => {
    const activities = await ctx.db.query("activities")
      .withIndex("by_time")
      .order("desc")
      .paginate(args);
    return activities;
  }
});
```

---

### Task Volume Explosion
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Scenario** | Agents recursively spawn sub-tasks; or retry loops create duplicates |
| **Symptoms** | 10K+ tasks accumulated; dashboard unusable; agent confusion |
| **Impact** | System effectively DDOS'd by legitimate usage |

**Recommended Solutions:**
1. **Task Quotas**: Per-agent limits on open tasks (e.g., max 20 concurrent)
2. **Deduplication Keys**: Prevent duplicate task creation via idempotency keys
3. **Auto-Archival**: Completed tasks move to separate table after 7 days
4. **Task Templates**: Encourage reuse vs. creating new task schemas

---

### Real-Time Subscription Overload
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Scenario** | Dashboard subscribes to all task changes; 10 agents = high churn |
| **Symptoms** | WebSocket saturation; client lag; server CPU spikes |
| **Impact** | Real-time updates become unreliable |

**Recommended Solutions:**
1. **Selective Subscriptions**: Subscribe only to visible tasks, not all
2. **Debounced Updates**: Batch rapid changes (e.g., 500ms buffer)
3. **Delta-Only Sync**: Send only changed fields, not full objects
4. **Connection Pooling**: Reuse Convex connections across dashboard tabs

---

### Notification Queue Backpressure
| Aspect | Details |
|--------|---------|
| **Severity** | 🟢 **Low** |
| **Scenario** | Flash mob of @mentions during incident response |
| **Symptoms** | Notification delivery delays; out-of-order delivery |
| **Impact** | Time-sensitive alerts arrive late |

**Recommended Solutions:**
1. **Priority Queues**: Urgent mentions skip the line
2. **Sampling**: If >100 notifications/agent, sample + summarize
3. **Circuit Breaker**: Pause non-urgent notifications during overload

---

## 4. Missing Features (Identified Gaps)

### Blocked Agent Handling
| Aspect | Details |
|--------|---------|
| **Severity** | 🔴 **High** |
| **Gap** | No mechanism for agents to declare "I need help" or external unblocking |
| **Symptoms** | Agents stuck on tasks indefinitely; no escalation path |
| **Impact** | Bottlenecks, missed deadlines, agent burnout |

**Recommended Solutions:**
1. **Block Declaration**: Agents can mark task as `blocked` with reason
2. **Auto-Escalation**: Blocked >30 min → notify coordinator human
3. **Help Request**: Agents can @mention requesting assistance
4. **Blocked Task Dashboard**: Dedicated view of all blockers across agents

```typescript
// Blocked task schema extension
interface Task {
  status: 'blocked';
  blockedReason: string;
  blockedAt: number;
  blockedBy?: Id<'agents'>; // agent requesting help
  escalationLevel: 0 | 1 | 2; // auto-escalates over time
}
```

---

### Task Dependency Management
| Aspect | Details |
|--------|---------|
| **Severity** | 🔴 **High** |
| **Gap** | No native dependency chain; agents manually coordinate prerequisites |
| **Symptoms** | Agents start tasks before dependencies complete; circular waits |
| **Impact** | Inefficient execution, deadlock risk |

**Recommended Solutions:**
1. **Dependency Graph**: Tasks have `dependsOn: TaskId[]` field
2. **Topological Sorting**: Scheduler respects dependencies when assigning
3. **Auto-Start**: Task auto-moves to `ready` when dependencies complete
4. **Cycle Detection**: Prevent circular dependencies at creation time

```typescript
// Dependency-aware task schema
interface Task {
  dependsOn: Id<'tasks'>[];
  dependents: Id<'tasks'>[]; // reverse index
  status: 'pending_deps' | 'ready' | 'in_progress' | ...;
}

// Auto-transition when deps complete
const onTaskComplete = async (ctx, completedTaskId) => {
  const dependents = await getDependents(ctx, completedTaskId);
  for (const task of dependents) {
    const allDone = await checkDependenciesComplete(ctx, task._id);
    if (allDone) await ctx.db.patch(task._id, { status: 'ready' });
  }
};
```

---

### Agent Capability Matching
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Gap** | No automated task-to-agent matching based on skills |
| **Symptoms** | Tasks assigned to agents lacking expertise; manual reassignment churn |
| **Impact** | Suboptimal performance, skill underutilization |

**Recommended Solutions:**
1. **Agent Profiles**: Skills, specialties, current load tracked per agent
2. **Task Requirements**: Required skills/tags on task creation
3. **Smart Routing**: Matchmaker agent assigns based on capability + availability
4. **Load Balancing**: Consider concurrent task count in assignment

---

### Conflict Resolution UI
| Aspect | Details |
|--------|---------|
| **Severity** | 🟡 **Medium** |
| **Gap** | No UI for resolving edit conflicts when they occur |
| **Symptoms** | Updates silently fail; agents don't know why changes didn't stick |
| **Impact** | Data loss, repeated failed attempts, frustration |

**Recommended Solutions:**
1. **Conflict Modal**: Show side-by-side diff when version mismatch detected
2. **Merge UI**: Allow selective field-level merge (theirs vs ours)
3. **Retry with Refresh**: One-click "refresh and reapply my changes"

---

### Audit Trail & Observability
| Aspect | Details |
|--------|---------|
| **Severity** | 🟢 **Low** |
| **Gap** | Limited visibility into agent decision-making; no why-did-this-happen view |
| **Symptoms** | Debugging agent behavior requires log diving |
| **Impact** | Longer incident resolution, opaque system behavior |

**Recommended Solutions:**
1. **Decision Log**: Agents record reasoning for status changes
2. **Task Timeline**: Visual history of all state transitions with actor
3. **Agent Performance Metrics**: Completion rate, block frequency, response time
4. **Trace View**: End-to-end view of multi-agent task chains

---

## Summary Matrix

| Edge Case | Severity | Effort | Priority |
|-----------|----------|--------|----------|
| Concurrent Task Editing | 🔴 High | Medium | P0 |
| Task Status Race Conditions | 🔴 High | Low | P0 |
| Activity Feed Growth | 🔴 High | Medium | P0 |
| Blocked Agent Handling | 🔴 High | Medium | P0 |
| Task Dependencies | 🔴 High | High | P1 |
| Offline Agent Detection | 🟡 Medium | Low | P1 |
| Notification Spam | 🟡 Medium | Low | P1 |
| Stale Heartbeat False Positives | 🟡 Medium | Medium | P1 |
| Task Volume Explosion | 🟡 Medium | Medium | P2 |
| Subscription Overload | 🟡 Medium | Medium | P2 |
| Orphaned Tasks | 🟡 Medium | Low | P1 |
| Agent Capability Matching | 🟡 Medium | High | P2 |
| Conflict Resolution UI | 🟡 Medium | Medium | P2 |
| Agent Identity Confusion | 🟢 Low | Low | P3 |
| Clock Skew | 🟢 Low | Low | P3 |
| Notification Backpressure | 🟢 Low | Medium | P3 |
| Audit Trail | 🟢 Low | Medium | P3 |

---

## Recommendations

### Immediate (Week 1)
1. Implement version-based conflict detection for task updates
2. Add offline detection with 30-min threshold
3. Create rate limiting for @mentions

### Short-term (Month 1)
4. Build blocked task dashboard with escalation
5. Implement activity feed pagination + archival
6. Add task dependency graph with auto-start

### Long-term (Quarter)
7. Agent capability-based task routing
8. Comprehensive audit trail and observability
9. Conflict resolution UI with merge capabilities
