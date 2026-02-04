"use client";

import * as React from "react";
import { 
  CheckSquare, 
  MessageSquare, 
  FileText, 
  ArrowRight,
  User,
  Activity as ActivityIcon 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Activity types matching the convex schema
export type ActivityType = 
  | "task_started"
  | "task_completed"
  | "task_failed"
  | "agent_joined"
  | "agent_left"
  | "message_sent"
  | "document_created"
  | "document_updated"
  | "status_changed";

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  agentName?: string;
  agentInitials?: string;
  taskTitle?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  task_started: <CheckSquare className="h-4 w-4" />,
  task_completed: <CheckSquare className="h-4 w-4" />,
  task_failed: <ActivityIcon className="h-4 w-4" />,
  agent_joined: <User className="h-4 w-4" />,
  agent_left: <User className="h-4 w-4" />,
  message_sent: <MessageSquare className="h-4 w-4" />,
  document_created: <FileText className="h-4 w-4" />,
  document_updated: <FileText className="h-4 w-4" />,
  status_changed: <ArrowRight className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, string> = {
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

function ActivityItem({ activity }: { activity: Activity }) {
  const timeAgo = React.useMemo(() => {
    return formatTimeAgo(activity.timestamp);
  }, [activity.timestamp]);

  const icon = activityIcons[activity.type];
  const colorClass = activityColors[activity.type];

  return (
    <div className="group flex gap-4 py-4 border-b border-[#E8E4DB] last:border-b-0 hover:bg-[#F7F5F0] transition-colors duration-150 px-2 -mx-2 rounded">
      {/* Icon column */}
      <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
        <div className="w-8 h-8 rounded-md bg-[#F0EDE6] flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] text-[#1A1A1A] leading-relaxed font-serif">
            {activity.message}
          </p>
          <span className="text-xs text-[#8A8A82] whitespace-nowrap flex-shrink-0">
            {timeAgo}
          </span>
        </div>
        
        {activity.taskTitle && (
          <p className="text-[13px] text-[#6B6B65] mt-1">
            Task: {activity.taskTitle}
          </p>
        )}

        {activity.agentName && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-5 w-5 rounded-[4px]">
              <AvatarFallback className="text-[10px] bg-[#E8E4DB] text-[#4A4A45]">
                {activity.agentInitials || activity.agentName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-[#6B6B65]">{activity.agentName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold text-[#1A1A1A]">
          Activity Feed
        </h2>
        <span className="text-xs text-[#8A8A82]">
          {activities.length} updates
        </span>
      </div>
      
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="pr-4">
          {activities.length === 0 ? (
            <div className="py-8 text-center">
              <ActivityIcon className="h-8 w-8 text-[#8A8A82] mx-auto mb-3" />
              <p className="text-sm text-[#6B6B65]">No activity yet</p>
              <p className="text-xs text-[#8A8A82] mt-1">
                Updates will appear here as agents work
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
