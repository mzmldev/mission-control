export const agentColors: Record<string, string> = {
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

export function getAgentColor(name: string): string {
  return agentColors[name] || "#475569";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatTimeAgo(timestamp: number): string {
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

export function formatDateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const isToday = new Date().toDateString() === date.toDateString();
  const isYesterday =
    new Date(Date.now() - 86400000).toDateString() === date.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function parseMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_\s]+?)(?=@|\s|$)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match[1]) mentions.push(match[1].trim());
  }

  return mentions;
}
