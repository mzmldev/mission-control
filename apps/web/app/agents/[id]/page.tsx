"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Clock,
  Activity,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@repo/convex/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendMessageDialog } from "@/components/send-message-dialog";

// Agent color mapping
const agentColors: Record<string, string> = {
  Jarvis: "#1E3A5F",
  Shuri: "#0D7377",
  Fury: "#8B4513",
  Vision: "#4F46E5",
  Loki: "#059669",
  Quill: "#D97706",
  Wanda: "#BE185D",
  Pepper: "#C75B39",
  Friday: "#475569",
  Wong: "#78716C",
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

function formatLastSeen(timestamp?: number): string {
  if (!timestamp) return "Unknown";
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

type AgentStatus = "idle" | "busy" | "offline" | "error";

const statusConfig: Record<
  AgentStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  idle: {
    label: "Idle",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    dotColor: "bg-gray-400",
  },
  busy: {
    label: "Active",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    dotColor: "bg-emerald-500",
  },
  offline: {
    label: "Offline",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    dotColor: "bg-gray-300",
  },
  error: {
    label: "Blocked",
    color: "text-red-600",
    bgColor: "bg-red-50",
    dotColor: "bg-red-500",
  },
};

const activityIcons: Record<string, React.ReactNode> = {
  task_started: <Activity className="h-4 w-4 text-amber-600" />,
  task_completed: <CheckCircle className="h-4 w-4 text-emerald-600" />,
  task_failed: <AlertCircle className="h-4 w-4 text-red-600" />,
  agent_joined: <User className="h-4 w-4 text-blue-600" />,
  agent_left: <User className="h-4 w-4 text-slate-600" />,
  message_sent: <MessageSquare className="h-4 w-4 text-indigo-600" />,
  document_created: <Activity className="h-4 w-4 text-teal-600" />,
  document_updated: <Activity className="h-4 w-4 text-cyan-600" />,
  status_changed: <Activity className="h-4 w-4 text-violet-600" />,
};

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;

  const agent = useQuery(api.agents.get, { id: agentId as any });
  const activities =
    useQuery(api.activities.getByAgent, { agentId: agentId as any }) || [];
  const messages =
    useQuery(api.messages.getByAgent, { agentId: agentId as any }) || [];
  const currentTask = agent?.currentTaskId
    ? useQuery(api.tasks.get, { id: agent.currentTaskId })
    : null;

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-12 w-12 bg-[#E8E4DB] rounded-full mx-auto mb-4" />
          <p className="text-[#6B6B65]">Loading agent...</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[agent.status as AgentStatus];
  const agentColor = getAgentColor(agent.name);
  const initials = getInitials(agent.name);

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="border-b border-[#E8E4DB] bg-[#FDFCF8] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/agents">
                <Button variant="ghost" size="icon" className="text-[#6B6B65]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-10 w-10 rounded-md"
                  style={{ backgroundColor: agentColor }}
                >
                  <AvatarFallback className="text-[#FDFCF8] font-semibold text-sm bg-transparent">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                    {agent.name}
                  </h1>
                  <p className="text-xs text-[#6B6B65]">{agent.role}</p>
                </div>
              </div>
            </div>

            <SendMessageDialog defaultAgentId={agentId}>
              <Button className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </SendMessageDialog>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Agent info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status card */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Agent Status
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FDFCF8] rounded-md p-4 border border-[#E8E4DB]">
                  <p className="text-xs text-[#6B6B65] uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${status.dotColor}`}
                    />
                    <span className={`font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="bg-[#FDFCF8] rounded-md p-4 border border-[#E8E4DB]">
                  <p className="text-xs text-[#6B6B65] uppercase tracking-wide mb-1">
                    Last Seen
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6B6B65]" />
                    <span className="text-[#1A1A1A]">
                      {formatLastSeen(agent.lastSeen)}
                    </span>
                  </div>
                </div>
                {agent.sessionKey && (
                  <div className="bg-[#FDFCF8] rounded-md p-4 border border-[#E8E4DB] col-span-2">
                    <p className="text-xs text-[#6B6B65] uppercase tracking-wide mb-1">
                      Session
                    </p>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-[#6B6B65]" />
                      <code className="text-sm text-[#1A1A1A] font-mono bg-[#F0EDE6] px-2 py-1 rounded">
                        {agent.sessionKey}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Current Task */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Current Task
              </h2>
              {currentTask ? (
                <Link href={`/tasks/${currentTask._id}`}>
                  <div className="bg-[#FDFCF8] rounded-md p-4 border border-[#E8E4DB] hover:border-[#8A8A82] transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-[#1A1A1A]">
                        {currentTask.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {currentTask.status}
                      </Badge>
                    </div>
                    {currentTask.description && (
                      <p className="text-sm text-[#6B6B65] line-clamp-2">
                        {currentTask.description}
                      </p>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="bg-[#FDFCF8]/50 rounded-md p-8 border border-[#E8E4DB]/50 text-center">
                  <Activity className="h-8 w-8 text-[#8A8A82] mx-auto mb-2" />
                  <p className="text-sm text-[#6B6B65]">No active task</p>
                  <p className="text-xs text-[#8A8A82] mt-1">
                    {agent.status === "busy"
                      ? "Working on a task not tracked in the system"
                      : "Agent is idle"}
                  </p>
                </div>
              )}
            </Card>

            {/* Recent Activities */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Recent Activities
              </h2>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-8 w-8 text-[#8A8A82] mx-auto mb-2" />
                      <p className="text-sm text-[#6B6B65]">
                        No recent activities
                      </p>
                    </div>
                  ) : (
                    activities.map((activity: any) => (
                      <div
                        key={activity._id}
                        className="flex items-start gap-3 p-3 bg-[#FDFCF8] rounded-md border border-[#E8E4DB]"
                      >
                        <div className="mt-0.5">
                          {activityIcons[activity.type] || (
                            <Activity className="h-4 w-4 text-[#6B6B65]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A1A]">
                            {activity.message}
                          </p>
                          <p className="text-xs text-[#8A8A82] mt-1">
                            {formatLastSeen(activity._creationTime)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Right column - Messages */}
          <div className="space-y-6">
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Recent Messages
              </h2>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-[#8A8A82] mx-auto mb-2" />
                      <p className="text-sm text-[#6B6B65]">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message: any) => (
                      <div
                        key={message._id}
                        className="p-3 bg-[#FDFCF8] rounded-md border border-[#E8E4DB]"
                      >
                        <p className="text-sm text-[#1A1A1A]">
                          {message.content}
                        </p>
                        <p className="text-xs text-[#8A8A82] mt-2">
                          {formatLastSeen(message._creationTime)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Metadata */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Metadata
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B65]">Agent ID</span>
                  <code className="text-[#1A1A1A] font-mono text-xs bg-[#F0EDE6] px-2 py-0.5 rounded">
                    {agent._id.slice(0, 8)}...
                  </code>
                </div>
                <Separator className="bg-[#E8E4DB]" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B65]">Activities</span>
                  <span className="text-[#1A1A1A]">{activities.length}</span>
                </div>
                <Separator className="bg-[#E8E4DB]" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B65]">Messages</span>
                  <span className="text-[#1A1A1A]">{messages.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
