import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@repo/convex/convex/_generated/api";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { SectionHeader } from "../components/SectionHeader";
import { colors, fonts, radius } from "../theme";
import { formatTimeAgo } from "../utils";

const statusStyles: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  idle: { label: "Idle", bg: "#F7F5F0", text: "#6B6B65" },
  busy: { label: "Busy", bg: "#ECFDF5", text: "#059669" },
  offline: { label: "Offline", bg: "#F3F4F6", text: "#6B7280" },
  error: { label: "Error", bg: "#FEF2F2", text: "#DC2626" },
};

export function AgentsScreen() {
  const insets = useSafeAreaInsets();
  const agents = useQuery(api.agents.list) || [];

  const counts = {
    busy: agents.filter((agent: any) => agent.status === "busy").length,
    idle: agents.filter((agent: any) => agent.status === "idle").length,
    offline: agents.filter((agent: any) => agent.status === "offline").length,
    error: agents.filter((agent: any) => agent.status === "error").length,
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Agents</Text>
            <Text style={styles.subtitle}>
              Monitor availability and coverage
            </Text>
          </View>
          <View style={styles.agentCount}>
            <Ionicons name="people" size={14} color={colors.inkTertiary} />
            <Text style={styles.agentCountText}>{agents.length} total</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Busy</Text>
            <Text style={styles.statValue}>{counts.busy}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Idle</Text>
            <Text style={styles.statValue}>{counts.idle}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Offline</Text>
            <Text style={styles.statValue}>{counts.offline}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Agent Directory" subtitle="All known agents" />
          <View style={styles.list}>
            {agents.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No agents found yet.</Text>
              </Card>
            ) : (
              agents.map((agent: any) => {
                const statusStyle =
                  statusStyles[agent.status] || statusStyles.idle;
                return (
                  <Card key={agent._id} style={styles.agentCard}>
                    <View style={styles.agentRow}>
                      <Avatar name={agent.name} size={36} />
                      <View style={styles.agentInfo}>
                        <Text style={styles.agentName}>{agent.name}</Text>
                        <Text style={styles.agentRole}>{agent.role}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusStyle.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusStyle.text },
                          ]}
                        >
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time"
                          size={12}
                          color={colors.inkMuted}
                        />
                        <Text style={styles.metaText}>
                          Last seen{" "}
                          {agent.lastSeen
                            ? formatTimeAgo(agent.lastSeen)
                            : "unknown"}
                        </Text>
                      </View>
                      {agent.currentTaskId ? (
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="briefcase"
                            size={12}
                            color={colors.inkMuted}
                          />
                          <Text style={styles.metaText}>On task</Text>
                        </View>
                      ) : null}
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.inkPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
  },
  agentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
  },
  agentCountText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    fontSize: 20,
    color: colors.inkPrimary,
  },
  section: {
    gap: 12,
  },
  list: {
    gap: 12,
  },
  emptyCard: {
    paddingVertical: 16,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
  agentCard: {
    gap: 10,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.inkPrimary,
  },
  agentRole: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
});
