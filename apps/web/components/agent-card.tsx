"use client";

import * as React from "react";
import { Bot, Clock, Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Agent types matching the convex schema
export type AgentStatus = "idle" | "busy" | "offline" | "error";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  sessionKey?: string;
  currentTaskTitle?: string;
  currentTaskId?: string;
  lastSeen?: number;
  color?: string;
}

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

const statusConfig: Record<AgentStatus, { 
  label: string; 
  dotColor: string; 
  bgColor: string;
  borderColor: string;
  pulse?: boolean;
}> = {
  idle: {
    label: "Idle",
    dotColor: "bg-[#6B7280]",
    bgColor: "bg-[#F3F4F6]",
    borderColor: "border-[#D1D5DB]",
    pulse: false,
  },
  busy: {
    label: "Active",
    dotColor: "bg-[#059669]",
    bgColor: "bg-[#ECFDF5]",
    borderColor: "border-[#A7F3D0]",
    pulse: true,
  },
  offline: {
    label: "Offline",
    dotColor: "bg-[#8A8A82]",
    bgColor: "bg-[#F7F5F0]",
    borderColor: "border-[#E8E4DB]",
    pulse: false,
  },
  error: {
    label: "Blocked",
    dotColor: "bg-[#DC2626]",
    bgColor: "bg-[#FEF2F2]",
    borderColor: "border-[#FECACA]",
    pulse: false,
  },
};

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
    .map((n) => n[0])
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

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const agentColor = agent.color || getAgentColor(agent.name);
  const initials = getInitials(agent.name);

  return (
    <Card
      className={`
        p-5 bg-[#F7F5F0] border-[#E8E4DB] rounded-lg cursor-pointer
        hover:border-[#8A8A82] hover:shadow-sm
        transition-all duration-150
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with status dot */}
          <div className="relative">
            <Avatar 
              className="h-10 w-10 rounded-md"
              style={{ backgroundColor: agentColor }}
            >
              <AvatarFallback className="text-[#FDFCF8] font-semibold text-sm bg-transparent">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <div className={`
              absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-[#F7F5F0]
              ${status.dotColor}
              ${status.pulse ? "animate-pulse" : ""}
            `} />
          </div>

          {/* Name and role */}
          <div>
            <h3 className="font-serif text-base font-semibold text-[#1A1A1A]">
              {agent.name}
            </h3>
            <p className="text-xs text-[#6B6B65]">{agent.role}</p>
          </div>
        </div>

        {/* Status badge */}
        <Badge
          variant="secondary"
          className={`
            ${status.bgColor} ${status.borderColor} 
            text-[11px] font-semibold uppercase tracking-wide
            border
          `}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${status.dotColor} mr-1.5`} />
          {status.label}
        </Badge>
      </div>

      <Separator className="my-4 bg-[#E8E4DB]" />

      {/* Current task section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#6B6B65]">
          <Activity className="h-3.5 w-3.5" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Currently Working On
          </span>
        </div>

        {agent.currentTaskTitle ? (
          <div className="bg-[#FDFCF8] rounded-md p-3 border border-[#E8E4DB]">
            <p className="text-sm text-[#1A1A1A] font-medium line-clamp-2">
              {agent.currentTaskTitle}
            </p>
          </div>
        ) : (
          <div className="bg-[#FDFCF8]/50 rounded-md p-3 border border-[#E8E4DB]/50">
            <p className="text-sm text-[#8A8A82] italic">
              {agent.status === "busy" ? "Working on a task..." : "No active task"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8E4DB]/50">
        <div className="flex items-center gap-2 text-[#8A8A82]">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs">
            Last seen {formatLastSeen(agent.lastSeen)}
          </span>
        </div>

        {agent.sessionKey && (
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-[#8A8A82]" />
            <code className="text-[11px] text-[#6B6B65] font-mono bg-[#F0EDE6] px-1.5 py-0.5 rounded">
              {agent.sessionKey.slice(0, 8)}...
            </code>
          </div>
        )}
      </div>
    </Card>
  );
}

// Compact version for sidebars
export function AgentCardCompact({ agent, onClick }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const agentColor = agent.color || getAgentColor(agent.name);
  const initials = getInitials(agent.name);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-md hover:bg-[#F0EDE6] cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="relative">
        <Avatar 
          className="h-8 w-8 rounded-[4px]"
          style={{ backgroundColor: agentColor }}
        >
          <AvatarFallback className="text-[#FDFCF8] font-semibold text-xs bg-transparent">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className={`
          absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FDFCF8]
          ${status.dotColor}
        `} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] truncate">{agent.name}</p>
        <p className="text-xs text-[#6B6B65] truncate">
          {agent.currentTaskTitle || status.label}
        </p>
      </div>
    </div>
  );
}
