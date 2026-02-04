"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  CheckSquare,
  Clock,
  MessageSquare,
  Send,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  AtSign,
  User
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

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

function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return "Unknown";
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

type TaskStatus = "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "critical";

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string; borderColor: string; }> = {
  pending: { label: "Pending", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  in_progress: { label: "In Progress", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  completed: { label: "Completed", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  blocked: { label: "Blocked", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
  cancelled: { label: "Cancelled", color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string; }> = {
  low: { label: "Low", color: "text-gray-600", bgColor: "bg-gray-100" },
  medium: { label: "Medium", color: "text-blue-600", bgColor: "bg-blue-100" },
  high: { label: "High", color: "text-amber-600", bgColor: "bg-amber-100" },
  critical: { label: "Critical", color: "text-red-600", bgColor: "bg-red-100" },
};

// Highlight mentions in text
function HighlightMentions({ text, agents }: { text: string; agents: any[] }) {
  const parts = text.split(/(@[a-zA-Z0-9_\s]+?)(?=@|\s|$)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const mentionName = part.slice(1).trim();
          const isValidMention = agents.some(a => 
            a.name.toLowerCase() === mentionName.toLowerCase()
          );
          
          if (isValidMention) {
            return (
              <span
                key={index}
                className="text-[#4F46E5] font-semibold bg-[#EEF4FF] px-1 rounded"
              >
                {part}
              </span>
            );
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  
  const task = useQuery(api.tasks.get, { id: taskId as any });
  const messages = useQuery(api.messages.getByTask, { taskId: taskId as any }) || [];
  const allAgents = useQuery(api.agents.list) || [];
  const activities = useQuery(api.activities.getByTask, { taskId: taskId as any }) || [];
  
  const updateStatus = useMutation(api.tasks.updateStatus);
  const createMessage = useMutation(api.messages.create);
  const createNotification = useMutation(api.notifications.create);
  const createActivity = useMutation(api.activities.create);
  
  const [comment, setComment] = React.useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Get assignee details
  const assignees = React.useMemo(() => {
    if (!task?.assigneeIds) return [];
    return allAgents.filter((agent: any) => task.assigneeIds.includes(agent._id));
  }, [task, allAgents]);

  // Filter agents for mentions
  const filteredAgents = mentionQuery
    ? allAgents.filter((a: any) => 
        a.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : allAgents;

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    
    await updateStatus({ 
      id: taskId as any, 
      status: newStatus as any 
    });
    
    await createActivity({
      type: "status_changed",
      taskId: taskId as any,
      message: `Task status changed to ${newStatus}`,
    });
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    // Parse mentions
    const mentionRegex = /@([a-zA-Z0-9_\s]+?)(?=@|\s|$)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(comment)) !== null) {
      if (match[1]) mentions.push(match[1].trim());
    }
    
    // Create message
    await createMessage({
      taskId: taskId as any,
      fromAgentId: allAgents[0]?._id, // Default to first agent, ideally should be current user
      content: comment.trim(),
      messageType: "text",
    });
    
    // Create notifications for mentioned agents
    for (const mentionName of mentions) {
      const mentionedAgent = allAgents.find((a: any) => 
        a.name.toLowerCase() === mentionName.toLowerCase()
      );
      if (mentionedAgent) {
        await createNotification({
          agentId: mentionedAgent._id,
          content: `You were mentioned in task "${task?.title}": "${comment.slice(0, 50)}..."`,
          notificationType: "info",
          relatedTaskId: taskId as any,
        });
      }
    }
    
    setComment("");
    setShowMentionSuggestions(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    
    // Check if we should show mention suggestions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    
    if (mentionMatch) {
      setShowMentionSuggestions(true);
      setMentionQuery(mentionMatch[1] || "");
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (agentName: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = comment.slice(0, cursorPosition);
    const textAfterCursor = comment.slice(cursorPosition);
    
    // Replace the @query with @AgentName
    const newTextBeforeCursor = textBeforeCursor.replace(/@([a-zA-Z0-9_]*)$/, `@${agentName} `);
    const newMessage = newTextBeforeCursor + textAfterCursor;
    
    setComment(newMessage);
    setShowMentionSuggestions(false);
    setMentionQuery("");
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = newTextBeforeCursor.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-12 w-12 bg-[#E8E4DB] rounded-full mx-auto mb-4" />
          <p className="text-[#6B6B65]">Loading task...</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[task.status as TaskStatus];
  const priority = priorityConfig[task.priority as TaskPriority];

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="border-b border-[#E8E4DB] bg-[#FDFCF8] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tasks">
                <Button variant="ghost" size="icon" className="text-[#6B6B65]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                    {task.title}
                  </h1>
                  <Badge className={`${priority.bgColor} ${priority.color} border-0`}>
                    {priority.label}
                  </Badge>
                </div>
                <p className="text-xs text-[#6B6B65] mt-1">
                  Task #{task._id.slice(0, 8)}
                </p>
              </div>
            </div>

            {/* Status change buttons */}
            <div className="flex items-center gap-2">
              {task.status !== "in_progress" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("in_progress")}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {task.status !== "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("completed")}
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
              {task.status !== "blocked" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("blocked")}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Block
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Task details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Description
              </h2>
              {task.description ? (
                <p className="text-[#1A1A1A] leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-[#8A8A82] italic">No description provided</p>
              )}
            </Card>

            {/* Comments Thread */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Comments ({messages.length})
              </h2>
              
              {/* Comment list */}
              <ScrollArea className="h-[300px] mb-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-[#8A8A82] mx-auto mb-2" />
                      <p className="text-sm text-[#6B6B65]">No comments yet</p>
                      <p className="text-xs text-[#8A8A82] mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message: any) => {
                      const agent = allAgents.find((a: any) => a._id === message.fromAgentId);
                      return (
                        <div 
                          key={message._id} 
                          className="flex gap-3 p-3 bg-[#FDFCF8] rounded-md border border-[#E8E4DB]"
                        >
                          <Avatar 
                            className="h-8 w-8 rounded-[4px]"
                            style={{ backgroundColor: agent ? getAgentColor(agent.name) : "#8A8A82" }}
                          >
                            <AvatarFallback className="text-[10px] text-[#FDFCF8] bg-transparent">
                              {agent ? getInitials(agent.name) : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-[#1A1A1A]">
                                {agent?.name || "Unknown"}
                              </span>
                              <span className="text-xs text-[#8A8A82]">
                                {formatTimeAgo(message._creationTime)}
                              </span>
                            </div>
                            <p className="text-sm text-[#4A4A45]">
                              <HighlightMentions text={message.content} agents={allAgents} />
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Add comment */}
              <div className="relative">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Add a comment... Use @ to mention agents"
                    value={comment}
                    onChange={handleTextChange}
                    className="min-h-[100px] pr-12"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="absolute right-3 bottom-3 p-2 bg-[#C75B39] text-white rounded-md hover:bg-[#B54D2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Mention Suggestions */}
                {showMentionSuggestions && filteredAgents.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[#FDFCF8] border border-[#E8E4DB] rounded-md shadow-lg max-h-40 overflow-auto">
                    {filteredAgents.map((agent: any) => (
                      <button
                        key={agent._id}
                        onClick={() => insertMention(agent.name)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F0EDE6] transition-colors"
                      >
                        <Avatar 
                          className="h-6 w-6 rounded-[4px]"
                          style={{ backgroundColor: getAgentColor(agent.name) }}
                        >
                          <AvatarFallback className="text-[10px] text-[#FDFCF8] bg-transparent">
                            {getInitials(agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-sm font-medium text-[#1A1A1A]">{agent.name}</p>
                          <p className="text-xs text-[#6B6B65]">{agent.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[#8A8A82]">
                    Use @ to mention agents
                  </p>
                  <div className="flex items-center gap-1">
                    {allAgents.slice(0, 3).map((agent: any) => (
                      <button
                        key={agent._id}
                        onClick={() => {
                          const newComment = comment + `@${agent.name} `;
                          setComment(newComment);
                        }}
                        className="text-xs text-[#4F46E5] hover:underline"
                      >
                        @{agent.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column - Task info */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Status
              </h2>
              <div className={`p-4 rounded-md border ${status.bgColor} ${status.borderColor}`}>
                <div className="flex items-center gap-2">
                  <CheckSquare className={`h-5 w-5 ${status.color}`} />
                  <span className={`font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </Card>

            {/* Assignees */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Assignees ({assignees.length})
              </h2>
              <div className="space-y-3">
                {assignees.length === 0 ? (
                  <div className="flex items-center gap-2 text-[#8A8A82]">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Unassigned</span>
                  </div>
                ) : (
                  assignees.map((agent: any) => (
                    <Link key={agent._id} href={`/agents/${agent._id}`}>
                      <div className="flex items-center gap-3 p-2 bg-[#FDFCF8] rounded-md border border-[#E8E4DB] hover:border-[#8A8A82] transition-colors cursor-pointer">
                        <Avatar 
                          className="h-8 w-8 rounded-[4px]"
                          style={{ backgroundColor: getAgentColor(agent.name) }}
                        >
                          <AvatarFallback className="text-[10px] text-[#FDFCF8] bg-transparent">
                            {getInitials(agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{agent.name}</p>
                          <p className="text-xs text-[#6B6B65]">{agent.role}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B65]">Created</span>
                  <span className="text-[#1A1A1A]">{formatTimeAgo(task._creationTime)}</span>
                </div>
                {task.dueDate && (
                  <>
                    <Separator className="bg-[#E8E4DB]" />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B65]">Due Date</span>
                      <span className="text-[#1A1A1A]">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
                {task.completedAt && (
                  <>
                    <Separator className="bg-[#E8E4DB]" />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B65]">Completed</span>
                      <span className="text-[#1A1A1A]">{formatTimeAgo(task.completedAt)}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Activity */}
            <Card className="p-6 bg-[#F7F5F0] border-[#E8E4DB]">
              <h2 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-4">
                Activity
              </h2>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-sm text-[#8A8A82]">No activity yet</p>
                  ) : (
                    activities.map((activity: any) => (
                      <div key={activity._id} className="text-sm">
                        <p className="text-[#1A1A1A]">{activity.message}</p>
                        <p className="text-xs text-[#8A8A82] mt-1">
                          {formatTimeAgo(activity._creationTime)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
