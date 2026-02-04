"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Activity, ActivityType } from "@repo/types";

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<ActivityType, string> = {
  task_started: "▶️",
  task_completed: "✅",
  task_failed: "❌",
  agent_joined: "👋",
  agent_left: "👋",
  message_sent: "💬",
  document_created: "📄",
  document_updated: "📝",
  status_changed: "🔄",
};

const activityColors: Record<ActivityType, string> = {
  task_started: "text-blue-500",
  task_completed: "text-green-500",
  task_failed: "text-red-500",
  agent_joined: "text-green-500",
  agent_left: "text-gray-500",
  message_sent: "text-blue-500",
  document_created: "text-purple-500",
  document_updated: "text-yellow-500",
  status_changed: "text-orange-500",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatType = (type: ActivityType) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Feed</CardTitle>
          <Badge variant="secondary">{activities.length} recent</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <div key={activity._id} className="relative">
                <div className="flex gap-4 pb-4">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-[19px] top-8 bottom-0 w-px bg-border" />
                  )}
                  
                  {/* Icon */}
                  <div className={`shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg ${activityColors[activity.type]}`}>
                    {activityIcons[activity.type]}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{formatType(activity.type)}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(activity._creationTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.message}
                    </p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span key={key} className="inline-block bg-muted px-2 py-1 rounded mr-2">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
