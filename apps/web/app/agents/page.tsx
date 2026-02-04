"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Search,
  ArrowLeft,
  LayoutGrid,
  List
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard } from "@/components/agent-card";

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

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Real-time query
  const agents = useQuery(api.agents.list) || [];
  const tasks = useQuery(api.tasks.list) || [];

  // Calculate stats
  const stats = {
    total: agents.length,
    active: agents.filter((a: any) => a.status === "busy").length,
    idle: agents.filter((a: any) => a.status === "idle").length,
    offline: agents.filter((a: any) => a.status === "offline").length,
    error: agents.filter((a: any) => a.status === "error").length,
  };

  // Map agents to AgentCard format with current task info
  const mappedAgents = agents.map((agent: any) => {
    const currentTask = agent.currentTaskId 
      ? tasks.find((t: any) => t._id === agent.currentTaskId)
      : null;
    
    return {
      id: agent._id,
      name: agent.name,
      role: agent.role,
      status: agent.status as any,
      sessionKey: agent.sessionKey,
      currentTaskTitle: currentTask?.title,
      currentTaskId: agent.currentTaskId,
      lastSeen: agent.lastSeen,
      color: getAgentColor(agent.name),
    };
  });

  // Filter agents
  const filteredAgents = mappedAgents.filter((agent: any) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status
  const groupedAgents = {
    active: filteredAgents.filter((a: any) => a.status === "busy"),
    idle: filteredAgents.filter((a: any) => a.status === "idle"),
    offline: filteredAgents.filter((a: any) => a.status === "offline"),
    error: filteredAgents.filter((a: any) => a.status === "error"),
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="border-b border-[#E8E4DB] bg-[#FDFCF8] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-[#6B6B65]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                  Agent Directory
                </h1>
                <p className="text-xs text-[#6B6B65]">
                  {stats.active} active · {stats.idle} idle · {stats.offline} offline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A82]" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-[#FDFCF8] border-[#E8E4DB] text-sm"
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-[#E8E4DB] rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${viewMode === "grid" ? "bg-[#F0EDE6]" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4 text-[#6B6B65]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${viewMode === "list" ? "bg-[#F0EDE6]" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 text-[#6B6B65]" />
                </Button>
              </div>

              <Button className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Status summary */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] rounded-full border border-[#A7F3D0]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-[#059669]">
              {stats.active} Active
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] rounded-full border border-[#D1D5DB]">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-[#6B7280]">
              {stats.idle} Idle
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F5F0] rounded-full border border-[#E8E4DB]">
            <span className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-sm font-medium text-[#8A8A82]">
              {stats.offline} Offline
            </span>
          </div>
          {stats.error > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] rounded-full border border-[#FECACA]">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-[#DC2626]">
                {stats.error} Blocked
              </span>
            </div>
          )}
        </div>

        {/* Agents display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent: any) => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <AgentCard
                  agent={agent}
                  onClick={() => {}}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Section */}
            {groupedAgents.active.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Active ({groupedAgents.active.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedAgents.active.map((agent: any) => (
                    <Link key={agent.id} href={`/agents/${agent.id}`}>
                      <AgentCard
                        agent={agent}
                        onClick={() => {}}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Idle Section */}
            {groupedAgents.idle.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  Idle ({groupedAgents.idle.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedAgents.idle.map((agent: any) => (
                    <Link key={agent.id} href={`/agents/${agent.id}`}>
                      <AgentCard
                        agent={agent}
                        onClick={() => {}}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Offline Section */}
            {groupedAgents.offline.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  Offline ({groupedAgents.offline.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {groupedAgents.offline.map((agent: any) => (
                    <Link key={agent.id} href={`/agents/${agent.id}`}>
                      <AgentCard
                        agent={agent}
                        onClick={() => {}}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Error Section */}
            {groupedAgents.error.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Blocked ({groupedAgents.error.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedAgents.error.map((agent: any) => (
                    <Link key={agent.id} href={`/agents/${agent.id}`}>
                      <AgentCard
                        agent={agent}
                        onClick={() => {}}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Empty state */}
        {filteredAgents.length === 0 && (
          <div className="py-16 text-center">
            <Users className="h-12 w-12 text-[#E8E4DB] mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-2">
              No agents found
            </h3>
            <p className="text-sm text-[#6B6B65]">
              Try adjusting your search query
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
