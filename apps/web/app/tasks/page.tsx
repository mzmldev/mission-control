"use client";

import * as React from "react";
import Link from "next/link";
import { 
  CheckSquare, 
  Plus, 
  Filter,
  Search,
  ArrowLeft,
  GripVertical,
  MoreHorizontal
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Kanban columns - mapped from schema status to display columns
const columns = [
  { id: "pending_unassigned", label: "Inbox", status: "pending", description: "New tasks waiting to be triaged" },
  { id: "pending_assigned", label: "Assigned", status: "pending", description: "Tasks assigned to agents" },
  { id: "in_progress", label: "In Progress", status: "in_progress", description: "Currently being worked on" },
  { id: "completed", label: "Review", status: "completed", description: "Ready for review" },
  { id: "blocked", label: "Done", status: "blocked", description: "Completed tasks" },
] as const;

// Agent color mapping
const agentColors: Record<string, string> = {
  "Jarvis": "#1E3A5F",
  "Shuri": "#0D7377",
  "Fury": "#8B4513",
  "Vision": "#4F46E5",
  "Loki": "#059669",
  "Quill": "#D97706",
  "Wanda": "#BE185D",
  "Pepper": "#C75B39",
  "Friday": "#475569",
  "Wong": "#78716C",
};

function getAgentColor(name: string): string {
  return agentColors[name] || "#475569";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n: any) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Column colors
const columnColors: Record<string, { bg: string; border: string; count: string; headerBg: string }> = {
  pending_unassigned: { bg: "bg-[#F7F5F0]", border: "border-[#E8E4DB]", count: "text-[#6B6B65]", headerBg: "bg-[#FDFCF8]" },
  pending_assigned: { bg: "bg-[#EEF4FF]", border: "border-[#C7D2FE]", count: "text-[#4F46E5]", headerBg: "bg-[#E0E7FF]" },
  in_progress: { bg: "bg-[#FEF3C7]", border: "border-[#FCD34D]", count: "text-[#D97706]", headerBg: "bg-[#FDE68A]" },
  completed: { bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", count: "text-[#059669]", headerBg: "bg-[#D1FAE5]" },
  blocked: { bg: "bg-[#F3F4F6]", border: "border-[#D1D5DB]", count: "text-[#6B7280]", headerBg: "bg-[#E5E7EB]" },
};

// Priority styles
const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },
  medium: { bg: "bg-blue-100", text: "text-blue-600", label: "Medium" },
  high: { bg: "bg-amber-100", text: "text-amber-600", label: "High" },
  critical: { bg: "bg-red-100", text: "text-red-600", label: "Critical" },
};

// Task Card Component
interface TaskCardProps {
  task: any;
  assignees: any[];
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: () => void;
}

function TaskCard({ task, assignees, isDragging, onDragStart, onDragEnd }: TaskCardProps) {
  const priority = (priorityStyles[task.priority] || priorityStyles.medium) as { bg: string; text: string; label: string };
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", task._id);
    onDragStart?.(e, task._id);
  };

  return (
    <Link href={`/tasks/${task._id}`}>
      <Card
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        className={`
          p-4 bg-[#FDFCF8] border-[#E8E4DB] rounded-md cursor-pointer
          hover:border-[#8A8A82] hover:shadow-sm hover:-translate-y-px
          transition-all duration-150 group
          ${isDragging ? "shadow-lg rotate-1 opacity-50" : ""}
        `}
      >
        <div className="flex items-start gap-2">
          <div 
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            onClick={(e) => e.preventDefault()}
          >
            <GripVertical className="h-4 w-4 text-[#8A8A82]" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* Priority badge */}
            <Badge className={`${priority.bg} ${priority.text} border-0 text-[10px] font-semibold uppercase tracking-wide`}>
              {priority.label}
            </Badge>

            {/* Title */}
            <h3 className="font-serif text-[15px] font-semibold text-[#1A1A1A] leading-snug">
              {task.title}
            </h3>

            {/* Description preview */}
            {task.description && (
              <p className="text-[13px] text-[#6B6B65] leading-relaxed line-clamp-2">
                {task.description.length > 100 
                  ? task.description.slice(0, 100) + "..." 
                  : task.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              {/* Assignee avatars */}
              <div className="flex items-center">
                {assignees.length > 0 ? (
                  <div className="flex -space-x-2">
                    {assignees.slice(0, 3).map((assignee: any) => (
                      <Avatar
                        key={assignee._id}
                        className="h-6 w-6 rounded-[4px] border-2 border-[#FDFCF8]"
                        style={{ backgroundColor: getAgentColor(assignee.name) }}
                      >
                        <AvatarFallback className="text-[9px] text-[#FDFCF8] bg-transparent">
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {assignees.length > 3 && (
                      <div className="h-6 w-6 rounded-[4px] bg-[#F0EDE6] border-2 border-[#FDFCF8] flex items-center justify-center">
                        <span className="text-[9px] text-[#4A4A45]">
                          +{assignees.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-[#8A8A82]">Unassigned</span>
                )}
              </div>

              {/* Task menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <button className="p-1 rounded hover:bg-[#F0EDE6] transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-[#8A8A82]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#FDFCF8] border-[#E8E4DB]">
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    Assign Agent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.preventDefault()} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Column Component
interface ColumnProps {
  column: typeof columns[number];
  tasks: any[];
  agents: any[];
  onDrop: (taskId: string, columnId: string) => void;
}

function KanbanColumn({ column, tasks, agents, onDrop }: ColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const colors = (columnColors[column.id] || columnColors.pending_unassigned) as { bg: string; border: string; count: string; headerBg: string };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, column.id);
    }
    setIsDragOver(false);
  };

  // Get assignees for a task
  const getTaskAssignees = (task: any) => {
    if (!task.assigneeIds) return [];
    return agents.filter((agent: any) => task.assigneeIds.includes(agent._id));
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column Header */}
      <div className={`
        p-3 rounded-t-lg border-t border-x ${colors.bg} ${colors.border}
        ${isDragOver ? "ring-2 ring-[#C75B39] ring-opacity-50" : ""}
      `}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-serif text-sm font-semibold text-[#1A1A1A]">
            {column.label}
          </h2>
          <span className={`text-xs font-medium ${colors.count} bg-white/50 px-2 py-0.5 rounded-full`}>
            {tasks.length}
          </span>
        </div>
        <p className="text-[11px] text-[#6B6B65]">
          {column.description}
        </p>
      </div>

      {/* Column Content */}
      <div 
        className={`
          flex-1 bg-[#F7F5F0] border-x border-b ${colors.border}
          rounded-b-lg p-3 min-h-[500px]
          transition-all duration-150
          ${isDragOver ? "bg-[#FEF2F2] border-[#C75B39]" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-3 pr-2">
            {tasks.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-[#E8E4DB] rounded-md">
                <CheckSquare className="h-6 w-6 text-[#C7D2FE] mx-auto mb-2" />
                <p className="text-xs text-[#8A8A82]">Drop tasks here</p>
              </div>
            ) : (
              tasks.map((task: any) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  assignees={getTaskAssignees(task)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Main Page Component
export default function TasksPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  // Real-time queries
  const tasks = useQuery(api.tasks.list) || [];
  const agents = useQuery(api.agents.list) || [];
  const updateTaskStatus = useMutation(api.tasks.updateStatus);
  const updateTaskAssignee = useMutation(api.tasks.assign);

  // Filter tasks for each column
  const getTasksForColumn = (columnId: string) => {
    return tasks.filter((task: any) => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      switch (columnId) {
        case "pending_unassigned":
          return task.status === "pending" && (!task.assigneeIds || task.assigneeIds.length === 0);
        case "pending_assigned":
          return task.status === "pending" && task.assigneeIds && task.assigneeIds.length > 0;
        case "in_progress":
          return task.status === "in_progress";
        case "completed":
          return task.status === "completed";
        case "blocked":
          return task.status === "blocked" || task.status === "cancelled";
        default:
          return false;
      }
    });
  };

  // Handle drag and drop
  const handleDrop = async (taskId: string, columnId: string) => {
    const task = tasks.find((t: any) => t._id === taskId);
    if (!task) return;

    // Map column to status
    let newStatus: string;
    switch (columnId) {
      case "pending_unassigned":
      case "pending_assigned":
        newStatus = "pending";
        break;
      case "in_progress":
        newStatus = "in_progress";
        break;
      case "completed":
        newStatus = "completed";
        break;
      case "blocked":
        newStatus = "blocked";
        break;
      default:
        return;
    }

    // Only update if status changed
    if (task.status !== newStatus) {
      await updateTaskStatus({
        id: taskId as any,
        status: newStatus as any,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="border-b border-[#E8E4DB] bg-[#FDFCF8] sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-[#6B6B65]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                  Task Board
                </h1>
                <p className="text-xs text-[#6B6B65]">
                  {tasks.length} total tasks • Drag and drop to move
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A82]" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-[#FDFCF8] border-[#E8E4DB] text-sm"
                />
              </div>

              <Button variant="outline" size="icon" className="border-[#E8E4DB]">
                <Filter className="h-4 w-4 text-[#6B6B65]" />
              </Button>

              <Button 
                className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column: any) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksForColumn(column.id)}
              agents={agents}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </main>

      {/* New Task Modal - Simple placeholder */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 bg-[#FDFCF8] border-[#E8E4DB] w-full max-w-md">
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
              Create New Task
            </h2>
            <p className="text-sm text-[#6B6B65] mb-4">
              Task creation would open a full form. This is a placeholder.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
                className="border-[#E8E4DB]"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setIsCreating(false)}
                className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]"
              >
                Create
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
