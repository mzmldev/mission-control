import Link from "next/link";
import { 
  CheckSquare, 
  Users, 
  Clock, 
  Activity as ActivityIcon,
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActivityFeed } from "@/components/activity-feed";
import type { Activity } from "@/components/activity-feed";

// Mock data for the dashboard
const mockActivities: Activity[] = [
  {
    id: "1",
    type: "task_completed",
    message: "Loki completed the blog post draft",
    agentName: "Loki",
    agentInitials: "LK",
    taskTitle: "Write Q1 Blog Post",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 min ago
  },
  {
    id: "2",
    type: "status_changed",
    message: "Jarvis moved 'API Integration' to In Progress",
    agentName: "Jarvis",
    agentInitials: "JV",
    taskTitle: "API Integration",
    timestamp: Date.now() - 1000 * 60 * 45, // 45 min ago
  },
  {
    id: "3",
    type: "document_created",
    message: "Shuri created a new technical specification",
    agentName: "Shuri",
    agentInitials: "SH",
    taskTitle: "Database Schema Design",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: "4",
    type: "task_started",
    message: "Vision started working on 'Authentication Flow'",
    agentName: "Vision",
    agentInitials: "VN",
    taskTitle: "Authentication Flow",
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  },
  {
    id: "5",
    type: "message_sent",
    message: "Friday sent a message in 'Q1 Planning'",
    agentName: "Friday",
    agentInitials: "FD",
    taskTitle: "Q1 Planning",
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
  },
  {
    id: "6",
    type: "agent_joined",
    message: "Pepper joined the team",
    agentName: "Pepper",
    agentInitials: "PP",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

const stats = [
  {
    label: "Active Agents",
    value: "4",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    description: "Currently working",
  },
  {
    label: "Pending Tasks",
    value: "12",
    icon: CheckSquare,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    description: "In queue",
  },
  {
    label: "In Progress",
    value: "5",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Being worked on",
  },
  {
    label: "Completed Today",
    value: "8",
    icon: ActivityIcon,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    description: "Tasks done",
  },
];

export default function DashboardPage() {
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
                Orchestrate your AI agent workforce
              </p>
            </div>
            <div className="flex items-center gap-3">
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
          {stats.map((stat) => (
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
            <ActivityFeed activities={mockActivities} />
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
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6B65]">Agent Pool</span>
                  <span className="text-xs text-[#4A4A45]">6 active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B6B65]">Queue Health</span>
                  <span className="text-xs text-[#4A4A45]">Normal</span>
                </div>
              </div>
            </Card>

            {/* Recent completions */}
            <Card className="p-5 bg-[#F7F5F0] border-[#E8E4DB]">
              <h3 className="font-serif text-base font-semibold text-[#1A1A1A] mb-4">
                Recent Completions
              </h3>
              <div className="space-y-3">
                {[
                  "Blog Post Draft",
                  "API Documentation",
                  "Test Suite Update",
                ].map((task) => (
                  <div
                    key={task}
                    className="flex items-center gap-2 text-sm text-[#4A4A45]"
                  >
                    <CheckSquare className="h-4 w-4 text-emerald-500" />
                    <span className="line-clamp-1">{task}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
