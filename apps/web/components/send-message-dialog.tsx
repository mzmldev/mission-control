"use client";

import * as React from "react";
import { Send, AtSign, Bot } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SendMessageDialogProps {
  trigger?: React.ReactNode;
  defaultAgentId?: string;
  children?: React.ReactNode;
}

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

// Parse @mentions from message
function parseMentions(content: string): { text: string; mentions: string[] } {
  const mentionRegex = /@([a-zA-Z0-9_\s]+?)(?=@|\s|$)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    if (match[1]) mentions.push(match[1].trim());
  }
  
  return { text: content, mentions };
}

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

export function SendMessageDialog({ trigger, defaultAgentId, children }: SendMessageDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(defaultAgentId || null);
  const [showMentionSuggestions, setShowMentionSuggestions] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const agents = useQuery(api.agents.list) || [];
  const sendMessage = useMutation(api.messages.create);
  const createNotification = useMutation(api.notifications.create);

  // Filter agents for mentions
  const filteredAgents = mentionQuery
    ? agents.filter((a: any) => 
        a.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : agents;

  const handleSend = async () => {
    if (!message.trim() || !selectedAgentId) return;
    
    const { mentions } = parseMentions(message);
    
    await sendMessage({
      fromAgentId: selectedAgentId as any,
      content: message.trim(),
      messageType: "text",
    });
    
    // Create notifications for mentioned agents
    for (const mentionName of mentions) {
      const mentionedAgent = agents.find((a: any) => 
        a.name.toLowerCase() === mentionName.toLowerCase()
      );
      if (mentionedAgent) {
        await createNotification({
          agentId: mentionedAgent._id,
          content: `You were mentioned in a message: "${message.slice(0, 50)}..."`,
          notificationType: "info",
        });
      }
    }
    
    setMessage("");
    setOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
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
    const textBeforeCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);
    
    // Replace the @query with @AgentName
    const newTextBeforeCursor = textBeforeCursor.replace(/@([a-zA-Z0-9_]*)$/, `@${agentName} `);
    const newMessage = newTextBeforeCursor + textAfterCursor;
    
    setMessage(newMessage);
    setShowMentionSuggestions(false);
    setMentionQuery("");
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = newTextBeforeCursor.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || trigger || (
          <Button className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]">
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to the team. Use @ to mention agents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Agent Selection */}
          <div>
            <label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
              From
            </label>
            <ScrollArea className="h-24 rounded-md border border-[#E8E4DB] bg-[#FDFCF8] p-2">
              <div className="flex flex-wrap gap-2">
                {agents.map((agent: any) => (
                  <button
                    key={agent._id}
                    onClick={() => setSelectedAgentId(agent._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                      selectedAgentId === agent._id
                        ? "border-[#C75B39] bg-[#FEF2F2]"
                        : "border-[#E8E4DB] hover:border-[#8A8A82]"
                    }`}
                  >
                    <Avatar 
                      className="h-6 w-6 rounded-[4px]"
                      style={{ backgroundColor: getAgentColor(agent.name) }}
                    >
                      <AvatarFallback className="text-[10px] text-[#FDFCF8] bg-transparent">
                        {getInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-[#1A1A1A]">{agent.name}</span>
                    {selectedAgentId === agent._id && (
                      <span className="h-2 w-2 rounded-full bg-[#C75B39]" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Message Input */}
          <div className="relative">
            <label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
              Message
            </label>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message... Use @ to mention agents"
                value={message}
                onChange={handleTextChange}
                className="min-h-[120px] pr-10"
              />
              <AtSign className="absolute right-3 top-3 h-4 w-4 text-[#8A8A82]" />
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
          </div>
          
          {/* Preview */}
          {message && (
            <div className="bg-[#F7F5F0] rounded-md p-3 border border-[#E8E4DB]">
              <p className="text-xs text-[#6B6B65] mb-1">Preview</p>
              <p className="text-sm text-[#1A1A1A]">
                <HighlightMentions text={message} agents={agents} />
              </p>
            </div>
          )}
          
          {/* Quick mentions */}
          <div>
            <p className="text-xs text-[#6B6B65] mb-2">Quick mentions:</p>
            <div className="flex flex-wrap gap-1">
              {agents.slice(0, 5).map((agent: any) => (
                <button
                  key={agent._id}
                  onClick={() => {
                    const newMessage = message + `@${agent.name} `;
                    setMessage(newMessage);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#EEF4FF] text-[#4F46E5] rounded hover:bg-[#C7D2FE] transition-colors"
                >
                  <AtSign className="h-3 w-3" />
                  {agent.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-[#E8E4DB]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || !selectedAgentId}
            className="bg-[#C75B39] hover:bg-[#B54D2E] text-[#FDFCF8]"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SendMessageDialog;
