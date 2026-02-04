"use client";

import * as React from "react";
import Link from "next/link";
import { 
  CheckSquare, 
  Plus, 
  Filter,
  Search,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TaskCard } from "@/components/task-card";
import type { Task, TaskStatus } from "@/components/task-card";

// Kanban columns
const columns: { id: TaskStatus | "pending_assigned"; label: string; description: string }[] = [
  { 
    id: "pending", 
    label: "Inbox", 
    description: "New tasks waiting to be triaged" 
  },
  { 
    id: "pending_assigned", 
    label: "Assigned", 
    description: "Tasks assigned to agents" 
  },
  { 
    id: "in_progress", 
    label: "In Progress", 
    description: "Currently being worked on" 
  },
  { 
    id: "completed", 
    label: "Review", 
    description: "Ready for review" 
  },
  { 
    id: "blocked", 
    label: "Done", 
    description: "Completed tasks" 
  },
];

// Mock tasks data
const mockTasks: Task[] = [
  // Inbox
  {
    id: "1",
    title: "Draft Q2 Marketing Strategy",
    description: "Create a comprehensive marketing strategy document for Q2 2025 including budget allocations and campaign timelines.",
    status: "pending",
    priority: "high",
    assignees: [],
    commentCount: 0,
    attachmentCount: 0,
  },
  {
    id: "2",
    title: "Research Competitor Analysis",
    description: "Analyze top 3 competitors and document their feature sets and pricing models.",
    status: "pending",
    priority: "medium",
    assignees: [],
    commentCount: 2,
  },
  // Assigned
  {
    id: "3",
    title: "Update API Documentation",
    description: "Refresh the API docs with new endpoints and examples.",
    status: "pending",
    priority: "medium",
    assignees: [
      { id: "a1", name: "Jarvis", initials: "JV", color: "#1E3A5F" },
    ],
    commentCount: 5,
    attachmentCount: 2,
  },
  {
    id: "4",
    title: "Fix Login Bug",
    description: "Users reporting intermittent login failures on mobile.",
    status: "pending",
    priority: "critical",
    assignees: [
      { id: "a2", name: "Shuri", initials: "SH", color: "#0D7377" },
    ],
    commentCount: 8,
  },
  // In Progress
  {
    id: "5",
    title: "Database Migration Script",
    description: "Write migration scripts for the new schema changes.",
    status: "in_progress",
    priority: "high",
    assignees: [
      { id: "a3", name: "Vision", initials: "VN", color: "#4F46E5" },
    ],
    commentCount: 3,
  },
  {
    id: "6",
    title: "Write Unit Tests",
    description: "Increase test coverage for the user service module.",
    status: "in_progress",
    priority: "medium",
    assignees: [
      { id: "a4", name: "Loki", initials: "LK", color: "#059669" },
    ],
    commentCount: 1,
  },
  {
    id: "7",
    title: "Design New Landing Page",
    description: "Create mockups for the upcoming product launch landing page.",
    status: "in_progress",
    priority: "high",
    assignees: [
      { id: "a5", name: "Wanda", initials: "WD", color: "#BE185D" },
      { id: "a6", name: "Pepper", initials: "PP", color: "#C75B39" },
    ],
    commentCount: 12,
    attachmentCount: 4,
  },
  // Review (completed)
  {
    id: "8",
    title: "Security Audit Report",
    description: "Complete security audit of authentication flows.",
    status: "completed",
    priority: "high",
    assignees: [
      { id: "a7", name: "Fury", initials: "FY", color: "#8B4513" },
    ],
    commentCount: 6,
    attachmentCount: 1,
  },
  {
    id: "9",
    title: "Performance Optimization",
    description: "Optimize database queries for faster response times.",
    status: "completed",
    priority: "medium",
    assignees: [
      { id: "a8", name: "Friday", initials: "FD", color: "#475569" },
    ],
    commentCount: 4,
  },
  // Done (blocked in schema, but used as Done for display)
  {
    id: "10",
    title: "Q1 Blog Posts",
    description: "Write and publish Q1 roundup blog posts.",
    status: "blocked",
    priority: "low",
    assignees: [
      { id: "a4", name: "Loki", initials: "LK", color: "#059669" },
    ],
    commentCount: 2,
  },
  {
    id: "11",
    title: "Team Onboarding Docs",
    description: "Create onboarding documentation for new team members.",
    status: "blocked",
    priority: "low",
    assignees: [
      { id: "a9", name: "Wong", initials: "WG", color: "#78716C" },
    ],
    commentCount: 0,
    attachmentCount: 3,
  },
];

// Status colors for column headers
const columnColors: Record<string, { bg: string; border: string; count: string }> = {
  pending: { bg: "bg-[#F7F5F0]", border: "border-[#E8E4DB]", count: "text-[#6B6B65]" },
  pending_assigned: { bg: "bg-[#EEF4FF]", border: "border-[#C7D2FE]", count: "text-[#4F46E5]" },
  in_progress: { bg: "bg-[#FEF3C7]", border: "border-[#FCD34D]", count: "text-[#D97706]" },
  completed: { bg: "bg-[#E0E7FF]", border: "border-[#A5B4FC]", count: "text-[#4338CA]" },
  blocked: { bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", count: "text-[#059669]" },
};

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter tasks for each column
  const getTasksForColumn = (columnId: string): Task[] => {
    return mockTasks.filter((task) => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Column filter
      if (columnId === "pending_assigned") {
        return task.status === "pending" && task.assignees.length > 0;
      }
      if (columnId === "blocked") {
        // Using blocked status as "Done" for this kanban
        return task.status === "blocked" || task.status === "cancelled";
      }
      if (columnId === "completed") {
        // Using completed as "Review"
        return task.status === "completed";
      }
      if (columnId === "in_progress") {
        return task.status === "in_progress";
      }
      if (columnId === "pending") {
        // Inbox = pending with no assignees
        return task.status === "pending" && task.assignees.length === 0;
      }
      return false;
    });
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
                  {mockTasks.length} total tasks
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

              <Button className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]">
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
          {columns.map((column) => {
            const tasks = getTasksForColumn(column.id);
            const colors = columnColors[column.id] || { bg: "bg-[#F7F5F0]", border: "border-[#E8E4DB]", count: "text-[#6B6B65]" };

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-72 flex flex-col"
              >
                {/* Column Header */}
                <div className={`
                  p-3 rounded-t-lg border-t border-x ${colors.bg} ${colors.border}
                `}>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-serif text-sm font-semibold text-[#1A1A1A]">
                      {column.label}
                    </h2>
                    <span className={`text-xs font-medium ${colors.count}`}>
                      {tasks.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6B65]">
                    {column.description}
                  </p>
                </div>

                {/* Column Content */}
                <div className={`
                  flex-1 bg-[#F7F5F0] border-x border-b ${colors.border}
                  rounded-b-lg p-3 min-h-[500px]
                `}>
                  <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="space-y-3 pr-2">
                      {tasks.length === 0 ? (
                        <div className="py-8 text-center">
                          <CheckSquare className="h-6 w-6 text-[#C7D2FE] mx-auto mb-2" />
                          <p className="text-xs text-[#8A8A82]">No tasks</p>
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => console.log("Task clicked:", task.id)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
