"use client";

import * as React from "react";
import Link from "next/link";
import { 
  CheckSquare, 
  Users, 
  Clock, 
  Activity as ActivityIcon,
  ArrowRight,
  Zap,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  User,
  ArrowRightLeft
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendMessageDialog } from "@/components/send-message-dialog";

// Activity icons mapping
const activityIcons: Record<string, React.ReactNode> = {
  task_started: <ActivityIcon className="h-4 w-4 text-amber-600" />,
  task_completed: <CheckCircle className="h-4 w-4 text-emerald-600" />,
  task_failed: <AlertCircle className="h-4 w-4 text-red-600" />,
  agent_joined: <User className="h-4 w-4 text-blue-600" />,
  agent_left: <User className="h-4 w-4 text-slate-600" />,
  message_sent: <MessageSquare className="h-4 w-4 text-indigo-600" />,
  document_created: <FileText className="h-4 w-4 text-teal-600" />,
  document_updated: <FileText className="h-4 w-4 text-cyan-600" />,
  status_changed: <ArrowRightLeft className="h-4 w-4 text-violet-600" />,
};

// Activity colors
const activityColors: Record<string, string> = {
  task_started: "text-amber-600",
  task_completed: "text-emerald-600",
  task_failed: "text-red-600",
  agent_joined: "text-blue-600",
  agent_left: "text-slate-600",
  message_sent: "text-indigo-600",
  document_created: "text-teal-600",
  document_updated: "text-cyan-600",
  status_changed: "text-violet-600",
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
    .map((n: any) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

// Newspaper-style activity item
function ActivityItem({ activity, agent }: { activity: any; agent?: any }) {
  const timeAgo = formatTimeAgo(activity._creationTime);
  const icon = activityIcons[activity.type] || <ActivityIcon className="h-4 w-4 text-[#6B6B65]" />;
  const colorClass = activityColors[activity.type] || "text-[#6B6B65]";
  const agentColor = agent ? getAgentColor(agent.name) : "#8A8A82";
  const agentInitials = agent ? getInitials(agent.name) : "??";

  return (
    <div className="group flex gap-4 py-4 border-b border-[#E8E4DB] last:border-b-0 hover:bg-[#F7F5F0] transition-colors duration-150 px-2 -mx-2 rounded">
      {/* Icon column */}
      <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
        <div className="w-10 h-10 rounded-md bg-[#F0EDE6] flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[15px] text-[#1A1A1A] leading-relaxed font-serif">
              {activity.message}
            </p>
            {activity.taskId && (
              <Link href={`/tasks/${activity.taskId}`}>
                <p className="text-[13px] text-[#4F46E5] mt-1 hover:underline">
                  View task →
                </p>
              </Link>
            )}
          </div>
          <span className="text-xs text-[#8A8A82] whitespace-nowrap flex-shrink-0">
            {timeAgo}
          </span>
        </div>
        
        {agent && (
          <div className="flex items-center gap-2 mt-3">
            <Avatar 
              className="h-6 w-6 rounded-[4px]"
              style={{ backgroundColor: agentColor }}
            >
              <AvatarFallback className="text-[10px] text-[#FDFCF8] bg-transparent">
                {agentInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-[#6B6B65]">{agent.name}</span>
            <span className="text-xs text-[#8A8A82]">• {agent.role}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Newspaper-style date header
function DateHeader({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  const isToday = new Date().toDateString() === date.toDateString();
  const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();
  
  let label = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  if (isToday) label = "Today";
  if (isYesterday) label = "Yesterday";
  
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-[#E8E4DB]" />
      <span className="text-xs font-medium text-[#8A8A82] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#E8E4DB]" />
    </div>
  );
}

export default function DashboardPage() {
  // Real-time queries
  const agents = useQuery(api.agents.list) || [];
  const tasks = useQuery(api.tasks.list) || [];
  const activities = useQuery(api.activities.getRecent, { limit: 50 }) || [];

  // Calculate stats
  const activeAgents = agents.filter((a: any) => a.status === "busy").length;
  const pendingTasks = tasks.filter((t: any) => t.status === "pending").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "in_progress").length;
  const completedToday = tasks.filter((t: any) => {
    if (t.status !== "completed" || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      label: "Active Agents",
      value: activeAgents.toString(),
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Currently working",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.toString(),
      icon: CheckSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "In queue",
    },
    {
      label: "In Progress",
      value: inProgressTasks.toString(),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Being worked on",
    },
    {
      label: "Completed Today",
      value: completedToday.toString(),
      icon: ActivityIcon,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      description: "Tasks done",
    },
  ];

  // Group activities by date
  const groupedActivities = React.useMemo(() => {
    const groups: { date: number; items: any[] }[] = [];
    
    activities.forEach((activity: any) => {
      const activityDate = new Date(activity._creationTime);
      activityDate.setHours(0, 0, 0, 0);
      const timestamp = activityDate.getTime();
      
      const existingGroup = groups.find((g: any) => g.date === timestamp);
      if (existingGroup) {
        existingGroup.items.push(activity);
      } else {
        groups.push({ date: timestamp, items: [activity] });
      }
    });
    
    return groups.sort((a, b) => b.date - a.date);
  }, [activities]);

  // Get agent by ID
  const getAgent = (agentId?: string) => {
    if (!agentId) return undefined;
    return agents.find((a: any) => a._id === agentId);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="border-b border-[#E8E4DB] bg-[#FDFCF8]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                Mission Control
              </h1>
              <p className="text-sm text-[#6B6B65] mt-1">
                Real-time agent workforce orchestration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SendMessageDialog />
              <Link href="/tasks">
                <Button variant="outline" className="border-[#E8E4DB] text-[#4A4A45]">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Task Board
                </Button>
              </Link>
              <Link href="/agents">
                <Button className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]">
                  <Users className="h-4 w-4 mr-2" />
                  Agents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat: any) => (
            <Card
              key={stat.label}
              className="p-5 bg-[#FDFCF8] border-[#E8E4DB] hover:border-[#8A8A82] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6B6B65] uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="font-serif text-3xl font-semibold text-[#1A1A1A] mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#8A8A82] mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} p-2.5 rounded-md`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">
              Quick Actions
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tasks">
              <Button
                variant="outline"
                className="border-[#E8E4DB] text-[#4A4A45] hover:bg-[#F7F5F0]"
              >
                <Zap className="h-4 w-4 mr-2 text-[#B8860B]" />
                View Task Board
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/agents">
              <Button
                variant="outline"
                className="border-[#E8E4DB] text-[#4A4A45] hover:bg-[#F7F5F0]"
              >
                <Users className="h-4 w-4 mr-2 text-[#B8860B]" />
                Manage Agents
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="my-8 bg-[#E8E4DB]" />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed - takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                    Live Activity Feed
                  </h2>
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-xs text-[#8A8A82]">
                  {activities.length} updates
                </span>
              </div>
              <p className="text-sm text-[#6B6B65] mt-1">
                Real-time stream of agent interactions and task updates
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="pr-4">
                {groupedActivities.length === 0 ? (
                  <div className="py-12 text-center">
                    <ActivityIcon className="h-12 w-12 text-[#E8E4DB] mx-auto mb-4" />
                    <p className="text-lg font-serif text-[#1A1A1A] mb-2">No activity yet</p>
                    <p className="text-sm text-[#6B6B65]">
                      Activities will appear here as agents work
                    </p>
                  </div>
                ) : (
                  groupedActivities.map((group: any) => (
                    <div key={group.date}>
                      <DateHeader timestamp={group.date} />
                      <div className="space-y-1">
                        {group.items.map((activity: any) => (
                          <ActivityItem 
                            key={activity._id} 
                            activity={activity} 
                            agent={getAgent(activity.agentId)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System status */}
            <Card className="p-5 bg-[#F7F5F0] border-[#E8E4DB]">
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A] mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6B65]">All Systems</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6B65]">Agent Pool</span>
                  <span className="text-xs text-[#4A4A45]">{agents.length} agents</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6B65]">Queue Health</span>
                  <span className="text-xs text-[#4A4A45]">
                    {pendingTasks > 10 ? "High Load" : "Normal"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Active agents */}
            <Card className="p-5 bg-[#F7F5F0] border-[#E8E4DB]">
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A] mb-4">
                Active Agents ({activeAgents})
              </h3>
              <div className="space-y-2">
                {agents.filter((a: any) => a.status === "busy").slice(0, 5).map((agent: any) => (
                  <Link key={agent._id} href={`/agents/${agent._id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-[#FDFCF8] transition-colors cursor-pointer">
                      <Avatar 
                        className="h-8 w-8 rounded-[4px]"
                        style={{ backgroundColor: getAgentColor(agent.name) }}
                      >
                        <AvatarFallback className="text-[10px] text-[#FDFCF8] bg-transparent">
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{agent.name}</p>
                        <p className="text-xs text-[#6B6B65] truncate">{agent.role}</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </Link>
                ))}
                {activeAgents === 0 && (
                  <p className="text-sm text-[#8A8A82]">No active agents</p>
                )}
              </div>
            </Card>

            {/* Recent completions */}
            <Card className="p-5 bg-[#F7F5F0] border-[#E8E4DB]">
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A] mb-4">
                Recent Completions
              </h3>
              <div className="space-y-3">
                {tasks
                  .filter((t: any) => t.status === "completed")
                  .slice(0, 5)
                  .map((task: any) => (
                    <Link key={task._id} href={`/tasks/${task._id}`}>
                      <div className="flex items-center gap-2 text-sm text-[#4A4A45] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="line-clamp-1">{task.title}</span>
                      </div>
                    </Link>
                  ))}
                {tasks.filter((t: any) => t.status === "completed").length === 0 && (
                  <p className="text-sm text-[#8A8A82]">No completed tasks yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
