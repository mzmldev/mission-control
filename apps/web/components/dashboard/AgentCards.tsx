"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Agent, AgentStatus } from "@repo/types";

interface AgentCardsProps {
  agents: Agent[];
}

const statusColors: Record<AgentStatus, string> = {
  idle: "bg-green-500",
  busy: "bg-yellow-500",
  offline: "bg-gray-500",
  error: "bg-red-500",
};

const statusVariants: Record<AgentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  idle: "default",
  busy: "secondary",
  offline: "outline",
  error: "destructive",
};

export function AgentCards({ agents }: AgentCardsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeSince = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Agents</CardTitle>
          <Badge variant="secondary">{agents.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <div key={agent._id}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColors[agent.status]}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{agent.name}</p>
                      <Badge variant={statusVariants[agent.status]} className="text-xs">
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {agent.role}
                    </p>
                    {agent.lastSeen && (
                      <p className="text-xs text-muted-foreground">
                        Last seen: {getTimeSince(agent.lastSeen)}
                      </p>
                    )}
                  </div>
                </div>
                {index < agents.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No agents connected
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
