import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/convex/convex/_generated/api";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { SectionHeader } from "../components/SectionHeader";
import { colors, fonts, radius, shadow } from "../theme";
import {
  formatDateLabel,
  formatTimeAgo,
  getAgentColor,
  getInitials,
  parseMentions,
} from "../utils";
import type { RootTabParamList } from "../types";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const activityConfig: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  task_started: { icon: "play-circle", color: "#D97706" },
  task_completed: { icon: "checkmark-circle", color: "#059669" },
  task_failed: { icon: "alert-circle", color: "#DC2626" },
  agent_joined: { icon: "person-add", color: "#2563EB" },
  agent_left: { icon: "person-remove", color: "#475569" },
  message_sent: { icon: "chatbubble-ellipses", color: "#4F46E5" },
  document_created: { icon: "document-text", color: "#0F766E" },
  document_updated: { icon: "document", color: "#0891B2" },
  status_changed: { icon: "swap-horizontal", color: "#7C3AED" },
};

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [messageOpen, setMessageOpen] = useState(false);

  const agents = useQuery(api.agents.list) || [];
  const tasks = useQuery(api.tasks.list) || [];
  const activities = useQuery(api.activities.getRecent, { limit: 50 }) || [];

  const activeAgents = agents.filter(
    (agent: any) => agent.status === "busy",
  ).length;
  const pendingTasks = tasks.filter(
    (task: any) => task.status === "pending",
  ).length;
  const inProgressTasks = tasks.filter(
    (task: any) => task.status === "in_progress",
  ).length;
  const completedToday = tasks.filter((task: any) => {
    if (task.status !== "completed" || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  const groupedActivities = useMemo(() => {
    const groups: { date: number; items: any[] }[] = [];

    activities.forEach((activity: any) => {
      const activityDate = new Date(activity._creationTime);
      activityDate.setHours(0, 0, 0, 0);
      const timestamp = activityDate.getTime();

      const existingGroup = groups.find((group) => group.date === timestamp);
      if (existingGroup) {
        existingGroup.items.push(activity);
      } else {
        groups.push({ date: timestamp, items: [activity] });
      }
    });

    return groups.sort((a, b) => b.date - a.date);
  }, [activities]);

  const getAgentById = (agentId?: string) => {
    if (!agentId) return undefined;
    return agents.find((agent: any) => agent._id === agentId);
  };

  const stats = [
    {
      label: "Active Agents",
      value: activeAgents,
      icon: "people",
      color: colors.statusSuccess,
      bg: "#ECFDF5",
      description: "Currently working",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      icon: "checkmark-circle",
      color: colors.statusWarning,
      bg: "#FEF3C7",
      description: "In queue",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: "time",
      color: colors.statusInfo,
      bg: "#EEF4FF",
      description: "Being worked on",
    },
    {
      label: "Completed Today",
      value: completedToday,
      icon: "pulse",
      color: "#7C3AED",
      bg: "#EDE9FE",
      description: "Tasks done",
    },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#FDFCF8", "#F7F5F0"]} style={styles.hero}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroTitle}>Mission Control</Text>
              <Text style={styles.heroSubtitle}>
                Real-time agent workforce orchestration
              </Text>
            </View>
            <Pressable
              style={styles.primaryButton}
              onPress={() => setMessageOpen(true)}
            >
              <Ionicons
                name="paper-plane"
                size={16}
                color={colors.inkInverse}
              />
              <Text style={styles.primaryButtonText}>Send Message</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Card key={stat.label} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statDescription}>{stat.description}</Text>
                </View>
                <View
                  style={[styles.statIconWrap, { backgroundColor: stat.bg }]}
                >
                  <Ionicons
                    name={stat.icon as any}
                    size={18}
                    color={stat.color}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("Tasks")}
            >
              <Ionicons name="grid" size={16} color={colors.accentWarm} />
              <Text style={styles.secondaryButtonText}>View Task Board</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.inkTertiary}
              />
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("Agents")}
            >
              <Ionicons name="people" size={16} color={colors.accentWarm} />
              <Text style={styles.secondaryButtonText}>Manage Agents</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.inkTertiary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Live Activity Feed"
            subtitle="Real-time stream of agent interactions and task updates"
            right={
              <Text style={styles.sectionCount}>
                {activities.length} updates
              </Text>
            }
          />
          <View style={styles.activityWrap}>
            {activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="pulse" size={32} color={colors.bgMuted} />
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptySubtitle}>
                  Activities will appear here as agents work
                </Text>
              </View>
            ) : (
              groupedActivities.map((group) => (
                <View key={group.date} style={styles.activityGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateLine} />
                    <Text style={styles.dateLabel}>
                      {formatDateLabel(group.date)}
                    </Text>
                    <View style={styles.dateLine} />
                  </View>
                  {group.items.map((activity: any) => (
                    <ActivityItem
                      key={activity._id}
                      activity={activity}
                      agent={getAgentById(activity.agentId)}
                    />
                  ))}
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="System Status" />
          <Card style={styles.statusCard}>
            <StatusRow label="All Systems" value="Operational" highlight />
            <StatusRow label="Agent Pool" value={`${agents.length} agents`} />
            <StatusRow
              label="Queue Health"
              value={pendingTasks > 10 ? "High Load" : "Normal"}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title={`Active Agents (${activeAgents})`} />
          <Card style={styles.listCard}>
            {agents.filter((agent: any) => agent.status === "busy").length ===
            0 ? (
              <Text style={styles.mutedText}>No active agents</Text>
            ) : (
              agents
                .filter((agent: any) => agent.status === "busy")
                .slice(0, 5)
                .map((agent: any) => (
                  <View key={agent._id} style={styles.agentRow}>
                    <Avatar name={agent.name} size={28} />
                    <View style={styles.agentInfo}>
                      <Text style={styles.agentName}>{agent.name}</Text>
                      <Text style={styles.agentRole}>{agent.role}</Text>
                    </View>
                    <View style={styles.pulseDot} />
                  </View>
                ))
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Recent Completions" />
          <Card style={styles.listCard}>
            {tasks.filter((task: any) => task.status === "completed").length ===
            0 ? (
              <Text style={styles.mutedText}>No completed tasks yet</Text>
            ) : (
              tasks
                .filter((task: any) => task.status === "completed")
                .slice(0, 5)
                .map((task: any) => (
                  <View key={task._id} style={styles.completionRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.statusSuccess}
                    />
                    <Text style={styles.completionText} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </View>
                ))
            )}
          </Card>
        </View>
      </ScrollView>

      <SendMessageModal
        agents={agents}
        visible={messageOpen}
        onClose={() => setMessageOpen(false)}
      />
    </View>
  );
}

function ActivityItem({ activity, agent }: { activity: any; agent?: any }) {
  const timeAgo = formatTimeAgo(activity._creationTime);
  const config = activityConfig[activity.type] || {
    icon: "pulse",
    color: colors.inkMuted,
  };
  const agentColor = agent ? getAgentColor(agent.name) : colors.inkMuted;
  const agentInitials = agent ? getInitials(agent.name) : "??";

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <View style={styles.iconBadge}>
          <Ionicons name={config.icon} size={16} color={config.color} />
        </View>
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityTop}>
          <Text style={styles.activityMessage}>{activity.message}</Text>
          <Text style={styles.activityTime}>{timeAgo}</Text>
        </View>
        {agent ? (
          <View style={styles.activityAgent}>
            <View
              style={[styles.activityAvatar, { backgroundColor: agentColor }]}
            >
              <Text style={styles.activityAvatarText}>{agentInitials}</Text>
            </View>
            <Text style={styles.activityAgentName}>{agent.name}</Text>
            <Text style={styles.activityAgentRole}>- {agent.role}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function StatusRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={styles.statusValueWrap}>
        {highlight ? <View style={styles.pulseDot} /> : null}
        <Text style={styles.statusValue}>{value}</Text>
      </View>
    </View>
  );
}

function SendMessageModal({
  agents,
  visible,
  onClose,
}: {
  agents: any[];
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const sendMessage = useMutation(api.messages.create);
  const createNotification = useMutation(api.notifications.create);
  const [message, setMessage] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const filteredAgents = mentionQuery
    ? agents.filter((agent: any) =>
        agent.name.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
    : agents;

  const handleTextChange = (text: string) => {
    setMessage(text);
    const mentionMatch = text.match(/@([a-zA-Z0-9_]*)$/);
    if (mentionMatch) {
      setShowMentionSuggestions(true);
      setMentionQuery(mentionMatch[1] || "");
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (agentName: string) => {
    const newMessage = message.replace(/@([a-zA-Z0-9_]*)$/, `@${agentName} `);
    setMessage(newMessage);
    setShowMentionSuggestions(false);
    setMentionQuery("");
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedAgentId) return;
    setIsSending(true);
    try {
      const mentions = parseMentions(message);
      await sendMessage({
        fromAgentId: selectedAgentId as any,
        content: message.trim(),
        messageType: "text",
      });

      for (const mentionName of mentions) {
        const mentionedAgent = agents.find(
          (agent: any) =>
            agent.name.toLowerCase() === mentionName.toLowerCase(),
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
      setSelectedAgentId(null);
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Message</Text>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={18} color={colors.inkTertiary} />
            </Pressable>
          </View>
          <Text style={styles.modalSubtitle}>
            Send a message to the team. Use @ to mention agents.
          </Text>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>From</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.agentChipRow}>
                {agents.map((agent: any) => {
                  const selected = selectedAgentId === agent._id;
                  return (
                    <Pressable
                      key={agent._id}
                      style={[
                        styles.agentChip,
                        selected ? styles.agentChipSelected : null,
                      ]}
                      onPress={() => setSelectedAgentId(agent._id)}
                    >
                      <Avatar name={agent.name} size={24} />
                      <Text style={styles.agentChipText}>{agent.name}</Text>
                      {selected ? <View style={styles.selectedDot} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Message</Text>
            <View style={styles.textareaWrap}>
              <TextInput
                value={message}
                onChangeText={handleTextChange}
                placeholder="Type your message..."
                placeholderTextColor={colors.inkMuted}
                multiline
                style={styles.textarea}
              />
              <Ionicons
                name="at"
                size={16}
                color={colors.inkMuted}
                style={styles.atIcon}
              />
            </View>
            {showMentionSuggestions && filteredAgents.length > 0 ? (
              <View style={styles.mentionsList}>
                {filteredAgents.map((agent: any) => (
                  <Pressable
                    key={agent._id}
                    style={styles.mentionItem}
                    onPress={() => insertMention(agent.name)}
                  >
                    <Avatar name={agent.name} size={26} />
                    <View>
                      <Text style={styles.mentionName}>{agent.name}</Text>
                      <Text style={styles.mentionRole}>{agent.role}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalHint}>Quick mentions:</Text>
            <View style={styles.quickMentions}>
              {agents.slice(0, 5).map((agent: any) => (
                <Pressable
                  key={agent._id}
                  style={styles.quickMentionChip}
                  onPress={() => setMessage((prev) => `${prev}@${agent.name} `)}
                >
                  <Ionicons name="at" size={12} color={colors.statusInfo} />
                  <Text style={styles.quickMentionText}>{agent.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Pressable style={styles.modalSecondary} onPress={onClose}>
              <Text style={styles.modalSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.modalPrimary}
              onPress={handleSend}
              disabled={!message.trim() || !selectedAgentId || isSending}
            >
              {isSending ? (
                <ActivityIndicator color={colors.inkInverse} />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane"
                    size={16}
                    color={colors.inkInverse}
                  />
                  <Text style={styles.modalPrimaryText}>Send Message</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  hero: {
    marginTop: 12,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.bgMuted,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.inkPrimary,
  },
  heroSubtitle: {
    marginTop: 6,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.accentCoral,
  },
  primaryButtonText: {
    color: colors.inkInverse,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.inkTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statValue: {
    marginTop: 6,
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.inkPrimary,
  },
  statDescription: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: 12,
  },
  sectionCount: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  actionRow: {
    gap: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgPrimary,
  },
  secondaryButtonText: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkSecondary,
  },
  activityWrap: {
    gap: 16,
  },
  activityGroup: {
    gap: 12,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.bgMuted,
  },
  dateLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.bgMuted,
  },
  activityIcon: {
    alignItems: "flex-start",
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.bgTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
    gap: 6,
  },
  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  activityMessage: {
    flex: 1,
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    color: colors.inkPrimary,
  },
  activityTime: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  activityAgent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityAvatar: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  activityAvatarText: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: colors.inkInverse,
  },
  activityAgentName: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.inkTertiary,
  },
  activityAgentRole: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.inkPrimary,
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
    textAlign: "center",
  },
  statusCard: {
    gap: 12,
    backgroundColor: colors.bgSecondary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkTertiary,
  },
  statusValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkSecondary,
  },
  listCard: {
    gap: 12,
    backgroundColor: colors.bgSecondary,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkPrimary,
  },
  agentRole: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusSuccess,
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completionText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSecondary,
  },
  mutedText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    gap: 16,
    ...shadow.soft,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.inkPrimary,
  },
  modalSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSecondary,
  },
  modalSection: {
    gap: 10,
  },
  modalLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  agentChipRow: {
    flexDirection: "row",
    gap: 10,
  },
  agentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
  },
  agentChipSelected: {
    borderColor: colors.accentCoral,
    backgroundColor: "#FEF2F2",
  },
  agentChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentCoral,
  },
  textareaWrap: {
    position: "relative",
  },
  textarea: {
    minHeight: 110,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
    padding: 12,
    paddingRight: 36,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkPrimary,
    textAlignVertical: "top",
  },
  atIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  mentionsList: {
    borderWidth: 1,
    borderColor: colors.bgMuted,
    borderRadius: radius.md,
    backgroundColor: colors.bgPrimary,
    maxHeight: 180,
  },
  mentionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgMuted,
  },
  mentionName: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  mentionRole: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  modalHint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  quickMentions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickMentionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: "#EEF4FF",
  },
  quickMentionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.statusInfo,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalSecondary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
  },
  modalSecondaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkSecondary,
  },
  modalPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.accentCoral,
  },
  modalPrimaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkInverse,
  },
});
