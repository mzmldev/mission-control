"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Task, TaskStatus, TaskPriority } from "@repo/types";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const statusColumns: TaskStatus[] = ["pending", "in_progress", "completed", "blocked"];

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const priorityVariants: Record<TaskPriority, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  critical: "destructive",
};

export function TaskBoard({ tasks, onTaskClick }: TaskBoardProps) {
  const tasksByStatus = statusColumns.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Task Board</CardTitle>
          <Badge variant="secondary">{tasks.length} tasks</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statusColumns.map((status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{statusLabels[status]}</h3>
                  <Badge variant="outline" className="text-xs">
                    {tasksByStatus[status].length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {tasksByStatus[status].map((task) => (
                    <Card
                      key={task._id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onTaskClick?.(task)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm line-clamp-2">
                            {task.title}
                          </p>
                          <Badge
                            variant={priorityVariants[task.priority]}
                            className="text-xs shrink-0"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.assigneeIds.length} assignees</span>
                          {task.dueDate && (
                            <span>Due: {formatDate(task.dueDate)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasksByStatus[status].length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
