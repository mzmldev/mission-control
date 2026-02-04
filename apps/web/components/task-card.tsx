"use client";

import * as React from "react";
import { MessageSquare, Paperclip, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Task types matching the convex schema
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: {
    id: string;
    name: string;
    initials: string;
    color?: string;
  }[];
  commentCount?: number;
  attachmentCount?: number;
  dueDate?: number;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

const statusStyles: Record<TaskStatus, { bg: string; border: string; text: string; label: string }> = {
  pending: {
    bg: "bg-[#F7F5F0]",
    border: "border-[#E8E4DB]",
    text: "text-[#6B6B65]",
    label: "Inbox",
  },
  in_progress: {
    bg: "bg-[#FEF3C7]",
    border: "border-[#FCD34D]",
    text: "text-[#D97706]",
    label: "In Progress",
  },
  completed: {
    bg: "bg-[#ECFDF5]",
    border: "border-[#A7F3D0]",
    text: "text-[#059669]",
    label: "Done",
  },
  blocked: {
    bg: "bg-[#FEF2F2]",
    border: "border-[#FECACA]",
    text: "text-[#DC2626]",
    label: "Blocked",
  },
  cancelled: {
    bg: "bg-[#F3F4F6]",
    border: "border-[#D1D5DB]",
    text: "text-[#6B7280]",
    label: "Cancelled",
  },
};

const priorityStyles: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  low: {
    bg: "bg-[#F7F5F0]",
    text: "text-[#6B6B65]",
    label: "Low",
  },
  medium: {
    bg: "bg-[#EEF4FF]",
    text: "text-[#4F46E5]",
    label: "Medium",
  },
  high: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#D97706]",
    label: "High",
  },
  critical: {
    bg: "bg-[#FEF2F2]",
    text: "text-[#DC2626]",
    label: "Critical",
  },
};

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const statusStyle = statusStyles[task.status];
  const priorityStyle = priorityStyles[task.priority];

  const displayDescription = task.description
    ? task.description.length > 100
      ? task.description.slice(0, 100) + "..."
      : task.description
    : null;

  return (
    <Card
      className={`
        group relative p-4 bg-[#FDFCF8] border-[#E8E4DB] rounded-md cursor-pointer
        hover:border-[#8A8A82] hover:shadow-sm hover:-translate-y-px
        transition-all duration-150
        ${isDragging ? "shadow-lg rotate-1" : ""}
      `}
      onClick={onClick}
    >
      {/* Drag handle - visual only for now */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-[#8A8A82]" />
      </div>

      <div className="space-y-3">
        {/* Badges row */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`${priorityStyle.bg} ${priorityStyle.text} border-0 text-[11px] font-semibold uppercase tracking-wide`}
          >
            {priorityStyle.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-serif text-[15px] font-semibold text-[#1A1A1A] leading-snug">
          {task.title}
        </h3>

        {/* Description preview */}
        {displayDescription && (
          <p className="text-[13px] text-[#6B6B65] leading-relaxed line-clamp-2">
            {displayDescription}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2">
          {/* Assignee avatars */}
          <div className="flex items-center">
            {task.assignees.length > 0 ? (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <Avatar
                    key={assignee.id}
                    className="h-6 w-6 rounded-[4px] border-2 border-[#FDFCF8]"
                    style={{ backgroundColor: assignee.color || "#E8E4DB" }}
                  >
                    <AvatarFallback className="text-[10px] text-[#4A4A45] bg-transparent">
                      {assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 3 && (
                  <div className="h-6 w-6 rounded-[4px] bg-[#F0EDE6] border-2 border-[#FDFCF8] flex items-center justify-center">
                    <span className="text-[10px] text-[#4A4A45]">
                      +{task.assignees.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-[#8A8A82]">Unassigned</span>
            )}
          </div>

          {/* Meta indicators */}
          <div className="flex items-center gap-3">
            {task.attachmentCount && task.attachmentCount > 0 && (
              <div className="flex items-center gap-1 text-[#8A8A82]">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="text-xs">{task.attachmentCount}</span>
              </div>
            )}
            {task.commentCount && task.commentCount > 0 && (
              <div className="flex items-center gap-1 text-[#8A8A82]">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{task.commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Column variant for Kanban - shows status badge
export function TaskCardWithStatus({ task, isDragging, onClick }: TaskCardProps) {
  const statusStyle = statusStyles[task.status];
  
  return (
    <TaskCard
      task={task}
      isDragging={isDragging}
      onClick={onClick}
    />
  );
}
