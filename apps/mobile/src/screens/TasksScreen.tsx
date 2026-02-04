import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/convex/convex/_generated/api";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { DocumentViewerModal } from "../components/DocumentViewerModal";
import { SectionHeader } from "../components/SectionHeader";
import { colors, fonts, radius, shadow } from "../theme";
import { formatTimeAgo } from "../utils";

type TaskPriority = "low" | "medium" | "high" | "critical";
type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked"
  | "cancelled";

const priorityStyles: Record<
  TaskPriority,
  { bg: string; text: string; label: string }
> = {
  low: { bg: "#F3F4F6", text: "#4B5563", label: "Low" },
  medium: { bg: "#EEF4FF", text: "#4F46E5", label: "Medium" },
  high: { bg: "#FEF3C7", text: "#D97706", label: "High" },
  critical: { bg: "#FEE2E2", text: "#DC2626", label: "Critical" },
};

const statusStyles: Record<
  TaskStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  pending: {
    bg: "#F7F5F0",
    text: "#6B6B65",
    border: "#E8E4DB",
    label: "Pending",
  },
  in_progress: {
    bg: "#FEF3C7",
    text: "#D97706",
    border: "#FCD34D",
    label: "In Progress",
  },
  completed: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#A7F3D0",
    label: "Completed",
  },
  blocked: {
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
    label: "Blocked",
  },
  cancelled: {
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#D1D5DB",
    label: "Cancelled",
  },
};

const sections = [
  {
    id: "pending_unassigned",
    label: "Inbox",
    description: "New tasks waiting to be triaged",
  },
  {
    id: "pending_assigned",
    label: "Assigned",
    description: "Tasks assigned to agents",
  },
  {
    id: "in_progress",
    label: "In Progress",
    description: "Currently being worked on",
  },
  {
    id: "completed",
    label: "Review",
    description: "Ready for review",
  },
  {
    id: "blocked",
    label: "Done",
    description: "Completed tasks",
  },
];

const statusActions: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
];

const priorityValues: TaskPriority[] = ["low", "medium", "high", "critical"];
const statusValues: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "cancelled",
];

const getPriorityValue = (value: any): TaskPriority =>
  priorityValues.includes(value) ? value : "medium";
const getStatusValue = (value: any): TaskStatus =>
  statusValues.includes(value) ? value : "pending";

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const tasks = useQuery(api.tasks.list) || [];
  const agents = useQuery(api.agents.list) || [];
  const createTask = useMutation(api.tasks.create);
  const updateTaskStatus = useMutation(api.tasks.updateStatus);
  const updateTaskAssignee = useMutation(api.tasks.assign);

  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createExpanded, setCreateExpanded] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [editExpanded, setEditExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAssignees, setIsSavingAssignees] = useState(false);

  const documents =
    useQuery(
      api.documents.getByTask,
      detailTask ? { taskId: detailTask._id } : "skip",
    ) || [];
  const messages =
    useQuery(
      api.messages.getByTask,
      detailTask ? { taskId: detailTask._id } : "skip",
    ) || [];
  const activities =
    useQuery(
      api.activities.getByTask,
      detailTask ? { taskId: detailTask._id } : "skip",
    ) || [];

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignees, setTaskAssignees] = useState<string[]>([]);

  const [assigneesDraft, setAssigneesDraft] = useState<string[]>([]);
  const detailPriorityKey = detailTask
    ? getPriorityValue(detailTask.priority)
    : "medium";
  const detailStatusKey = detailTask
    ? getStatusValue(detailTask.status)
    : "pending";
  const detailPriorityStyle = priorityStyles[detailPriorityKey];
  const detailStatusStyle = statusStyles[detailStatusKey];

  useEffect(() => {
    if (detailTask) {
      setAssigneesDraft(detailTask.assigneeIds || []);
    }
  }, [detailTask]);

  useEffect(() => {
    if (!editOpen && detailTask) {
      setAssigneesDraft(detailTask.assigneeIds || []);
    }
  }, [editOpen, detailTask]);

  useEffect(() => {
    setCreateExpanded(false);
  }, [createOpen]);

  useEffect(() => {
    setDetailExpanded(false);
  }, [detailTask]);

  useEffect(() => {
    setEditExpanded(false);
  }, [editOpen]);

  useEffect(() => {
    if (!detailTask) {
      setSelectedDocument(null);
      setEditOpen(false);
      setDetailOpen(false);
    }
  }, [detailTask]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((task: any) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tasks, searchQuery]);

  const handleOpenTask = (task: any) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const handleCloseTask = () => {
    setDetailOpen(false);
    setDetailTask(null);
  };

  const handleOpenDocument = (document: any) => {
    setSelectedDocument(document);
    setEditOpen(false);
    setDetailOpen(false);
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
    if (detailTask) {
      setDetailOpen(true);
    }
  };

  const getTasksForSection = (sectionId: string) => {
    return filteredTasks.filter((task: any) => {
      switch (sectionId) {
        case "pending_unassigned":
          return (
            task.status === "pending" &&
            (!task.assigneeIds || task.assigneeIds.length === 0)
          );
        case "pending_assigned":
          return (
            task.status === "pending" &&
            task.assigneeIds &&
            task.assigneeIds.length > 0
          );
        case "in_progress":
          return task.status === "in_progress";
        case "completed":
          return task.status === "completed";
        case "blocked":
          return task.status === "blocked" || task.status === "cancelled";
        default:
          return false;
      }
    });
  };

  const resetCreateForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskDueDate("");
    setTaskAssignees([]);
  };

  const handleToggleAssignee = (agentId: string, setter: any) => {
    setter((current: string[]) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId],
    );
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const dueDate = taskDueDate.trim()
        ? new Date(`${taskDueDate}T00:00:00`).getTime()
        : undefined;
      await createTask({
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        assigneeIds: taskAssignees.length ? (taskAssignees as any) : undefined,
        dueDate: dueDate && !Number.isNaN(dueDate) ? dueDate : undefined,
      });
      resetCreateForm();
      setCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: TaskStatus) => {
    if (!detailTask) return;
    await updateTaskStatus({
      id: detailTask._id as any,
      status: status as any,
    });
  };

  const handleSaveAssignees = async () => {
    if (!detailTask) return;
    setIsSavingAssignees(true);
    try {
      await updateTaskAssignee({
        id: detailTask._id as any,
        assigneeIds: assigneesDraft as any,
      });
      setEditOpen(false);
    } finally {
      setIsSavingAssignees(false);
    }
  };

  const getTaskAssignees = (task: any) => {
    if (!task.assigneeIds) return [];
    return agents.filter((agent: any) => task.assigneeIds.includes(agent._id));
  };

  const getAgentById = (agentId?: string) => {
    if (!agentId) return undefined;
    return agents.find((item: any) => item._id === agentId);
  };

  const getAgentName = (agentId?: string) => {
    const agent = getAgentById(agentId);
    return agent ? agent.name : "Unknown";
  };

  const screenHeight = Dimensions.get("window").height;
  const getModalHeightStyle = (expanded: boolean) => ({
    height: expanded ? screenHeight : screenHeight * 0.65,
  });

  const renderMentionText = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_\s]+?)(?=@|\s|$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const label = part.trim().toLowerCase();
        const isAll = label === "@all";
        return (
          <Text
            key={`mention-${index}`}
            style={isAll ? styles.mentionPillAll : styles.mentionPill}
          >
            {part}
          </Text>
        );
      }
      return (
        <Text key={`text-${index}`} style={styles.messageTextSegment}>
          {part}
        </Text>
      );
    });
  };

  const detailAssignees = detailTask ? getTaskAssignees(detailTask) : [];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Task Board</Text>
            <Text style={styles.subtitle}>
              {tasks.length} total tasks - Manage from anywhere
            </Text>
          </View>
          <Pressable
            style={styles.primaryButton}
            onPress={() => setCreateOpen(true)}
          >
            <Ionicons name="add" size={18} color={colors.inkInverse} />
            <Text style={styles.primaryButtonText}>New Task</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.inkMuted} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={colors.inkMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {sections.map((section) => {
          const sectionTasks = getTasksForSection(section.id);
          return (
            <View key={section.id} style={styles.section}>
              <SectionHeader
                title={section.label}
                subtitle={section.description}
                right={
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{sectionTasks.length}</Text>
                  </View>
                }
              />
              {sectionTasks.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.bgMuted}
                  />
                  <Text style={styles.emptyText}>No tasks in this column</Text>
                </View>
              ) : (
                <View style={styles.taskList}>
                  {sectionTasks.map((task: any) => {
                    const priorityKey = getPriorityValue(task.priority);
                    const statusKey = getStatusValue(task.status);
                    const priority = priorityStyles[priorityKey];
                    const status = statusStyles[statusKey];
                    return (
                      <Pressable
                        key={task._id}
                        onPress={() => handleOpenTask(task)}
                      >
                        <Card style={styles.taskCard}>
                          <View style={styles.taskHeader}>
                            <View
                              style={[
                                styles.priorityBadge,
                                { backgroundColor: priority.bg },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.priorityText,
                                  { color: priority.text },
                                ]}
                              >
                                {priority.label}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor: status.bg,
                                  borderColor: status.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: status.text },
                                ]}
                              >
                                {status.label}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.taskTitle}>{task.title}</Text>
                          {task.description ? (
                            <Text
                              style={styles.taskDescription}
                              numberOfLines={2}
                            >
                              {task.description}
                            </Text>
                          ) : null}
                          <View style={styles.taskFooter}>
                            <View style={styles.assigneeRow}>
                              {getTaskAssignees(task).length > 0 ? (
                                getTaskAssignees(task)
                                  .slice(0, 3)
                                  .map((agent: any) => (
                                    <Avatar
                                      key={agent._id}
                                      name={agent.name}
                                      size={24}
                                      style={styles.assigneeAvatar}
                                    />
                                  ))
                              ) : (
                                <Text style={styles.assigneeEmpty}>
                                  Unassigned
                                </Text>
                              )}
                            </View>
                            {task.dueDate ? (
                              <View style={styles.dueWrap}>
                                <Ionicons
                                  name="calendar"
                                  size={12}
                                  color={colors.inkMuted}
                                />
                                <Text style={styles.dueText}>
                                  {new Date(task.dueDate).toLocaleDateString(
                                    "en-US",
                                  )}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={createOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCreateOpen(false)}
          />
          <View
            style={[
              styles.modalSheet,
              getModalHeightStyle(createExpanded),
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <SafeAreaView style={styles.modalSafeArea} edges={["top"]}>
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => setCreateExpanded(true)}
                scrollEventThrottle={16}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create New Task</Text>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => setCreateOpen(false)}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={colors.inkTertiary}
                    />
                  </Pressable>
                </View>
                <Text style={styles.modalSubtitle}>
                  Add a task to the board, set priority, and assign agents.
                </Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Title</Text>
                  <TextInput
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    placeholder="Add a concise task title"
                    placeholderTextColor={colors.inkMuted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <TextInput
                    value={taskDescription}
                    onChangeText={setTaskDescription}
                    placeholder="Add context, requirements, or acceptance criteria"
                    placeholderTextColor={colors.inkMuted}
                    style={styles.textarea}
                    multiline
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Priority</Text>
                  <View style={styles.priorityRow}>
                    {(Object.keys(priorityStyles) as TaskPriority[]).map(
                      (priority) => {
                        const style = priorityStyles[priority];
                        const selected = taskPriority === priority;
                        return (
                          <Pressable
                            key={priority}
                            onPress={() => setTaskPriority(priority)}
                            style={[
                              styles.priorityChip,
                              {
                                backgroundColor: style.bg,
                                borderColor: selected
                                  ? colors.accentCoral
                                  : colors.bgMuted,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityChipText,
                                { color: style.text },
                              ]}
                            >
                              {style.label}
                            </Text>
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Due Date</Text>
                  <TextInput
                    value={taskDueDate}
                    onChangeText={setTaskDueDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.inkMuted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.modalSection}>
                  <View style={styles.assigneeHeader}>
                    <Text style={styles.modalLabel}>Assignees</Text>
                    {taskAssignees.length > 0 ? (
                      <Text style={styles.assigneeCount}>
                        {taskAssignees.length} selected
                      </Text>
                    ) : (
                      <Text style={styles.assigneeCount}>Optional</Text>
                    )}
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.agentChipRow}>
                      {agents.length === 0 ? (
                        <Text style={styles.mutedText}>No agents yet.</Text>
                      ) : (
                        agents.map((agent: any) => {
                          const selected = taskAssignees.includes(agent._id);
                          return (
                            <Pressable
                              key={agent._id}
                              style={[
                                styles.agentChip,
                                selected ? styles.agentChipSelected : null,
                              ]}
                              onPress={() =>
                                handleToggleAssignee(
                                  agent._id,
                                  setTaskAssignees,
                                )
                              }
                            >
                              <Avatar name={agent.name} size={24} />
                              <View>
                                <Text style={styles.agentChipName}>
                                  {agent.name}
                                </Text>
                                <Text style={styles.agentChipRole}>
                                  {agent.role}
                                </Text>
                              </View>
                              {selected ? (
                                <View style={styles.selectedDot} />
                              ) : null}
                            </Pressable>
                          );
                        })
                      )}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.modalFooter}>
                  <Pressable
                    style={styles.modalSecondary}
                    onPress={() => {
                      resetCreateForm();
                      setCreateOpen(false);
                    }}
                  >
                    <Text style={styles.modalSecondaryText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.modalPrimary}
                    onPress={handleCreateTask}
                    disabled={!taskTitle.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={colors.inkInverse} />
                    ) : (
                      <Text style={styles.modalPrimaryText}>Create Task</Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailOpen && !!detailTask}
        transparent
        animationType="slide"
        onRequestClose={handleCloseTask}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseTask} />
          {detailTask ? (
            <View
              style={[
                styles.modalSheet,
                getModalHeightStyle(detailExpanded),
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <SafeAreaView style={styles.modalSafeArea} edges={["top"]}>
                <ScrollView
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  onScrollBeginDrag={() => setDetailExpanded(true)}
                  scrollEventThrottle={16}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Task Details</Text>
                    <View style={styles.modalHeaderActions}>
                      <Pressable
                        style={styles.editButton}
                        onPress={() => setEditOpen(true)}
                      >
                        <Ionicons
                          name="create-outline"
                          size={14}
                          color={colors.inkSecondary}
                        />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={styles.iconButton}
                        onPress={handleCloseTask}
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color={colors.inkTertiary}
                        />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.taskDetailTitle}>{detailTask.title}</Text>
                  {detailTask.description ? (
                    <Text style={styles.taskDetailDescription}>
                      {detailTask.description}
                    </Text>
                  ) : null}

                  <View style={styles.detailMetaRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: detailStatusStyle.bg,
                          borderColor: detailStatusStyle.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: detailStatusStyle.text },
                        ]}
                      >
                        {detailStatusStyle.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: detailPriorityStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: detailPriorityStyle.text },
                        ]}
                      >
                        {detailPriorityStyle.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Details</Text>
                    <View style={styles.detailList}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Created</Text>
                        <Text style={styles.detailValue}>
                          {formatTimeAgo(detailTask._creationTime)}
                        </Text>
                      </View>
                      {detailTask.dueDate ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Due Date</Text>
                          <Text style={styles.detailValue}>
                            {new Date(detailTask.dueDate).toLocaleDateString(
                              "en-US",
                            )}
                          </Text>
                        </View>
                      ) : null}
                      {detailTask.completedAt ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Completed</Text>
                          <Text style={styles.detailValue}>
                            {formatTimeAgo(detailTask.completedAt)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      Assignees ({detailAssignees.length})
                    </Text>
                    {detailAssignees.length === 0 ? (
                      <Text style={styles.mutedText}>Unassigned</Text>
                    ) : (
                      <View style={styles.assigneeList}>
                        {detailAssignees.map((agent: any) => (
                          <View key={agent._id} style={styles.assigneeItem}>
                            <Avatar name={agent.name} size={28} />
                            <View style={styles.assigneeInfo}>
                              <Text style={styles.assigneeName}>
                                {agent.name}
                              </Text>
                              <Text style={styles.assigneeRole}>
                                {agent.role}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      Documents ({documents.length})
                    </Text>
                    {documents.length === 0 ? (
                      <Text style={styles.mutedText}>No documents yet.</Text>
                    ) : (
                      <View style={styles.documentsList}>
                        {documents.map((document: any) => (
                          <Pressable
                            key={document._id}
                            style={styles.documentCard}
                            onPress={() => handleOpenDocument(document)}
                          >
                            <View style={styles.documentRow}>
                              <View style={styles.documentIcon}>
                                <Ionicons
                                  name="document-text"
                                  size={16}
                                  color={colors.inkSecondary}
                                />
                              </View>
                              <View style={styles.documentInfo}>
                                <Text style={styles.documentTitle}>
                                  {document.title}
                                </Text>
                                <Text style={styles.documentMeta}>
                                  {(document.type || "text").toUpperCase()} - v
                                  {document.version || 1} -{" "}
                                  {formatTimeAgo(document._creationTime)}
                                </Text>
                              </View>
                              <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={colors.inkMuted}
                              />
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      Messages ({messages.length})
                    </Text>
                    {messages.length === 0 ? (
                      <Text style={styles.mutedText}>No messages yet.</Text>
                    ) : (
                      <View style={styles.messageList}>
                        {messages.map((message: any) => {
                          const agent = getAgentById(message.fromAgentId);
                          const agentName = agent ? agent.name : "Unknown";
                          return (
                            <View key={message._id} style={styles.messageRow}>
                              <Avatar name={agentName} size={28} />
                              <View style={styles.messageContent}>
                                <View style={styles.messageHeader}>
                                  <Text style={styles.messageAuthor}>
                                    {agentName}
                                  </Text>
                                  <Text style={styles.messageTime}>
                                    {formatTimeAgo(message._creationTime)}
                                  </Text>
                                </View>
                                <Text style={styles.messageText}>
                                  {renderMentionText(message.content)}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>
                      Activity ({activities.length})
                    </Text>
                    {activities.length === 0 ? (
                      <Text style={styles.mutedText}>No activity yet.</Text>
                    ) : (
                      <View style={styles.activityList}>
                        {activities.map((activity: any) => (
                          <View key={activity._id} style={styles.activityRow}>
                            <Text style={styles.activityMessage}>
                              {activity.message}
                            </Text>
                            <Text style={styles.activityMeta}>
                              {formatTimeAgo(activity._creationTime)} -{" "}
                              {getAgentName(activity.agentId)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalFooter}>
                    <Pressable
                      style={styles.modalSecondary}
                      onPress={handleCloseTask}
                    >
                      <Text style={styles.modalSecondaryText}>Close</Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={editOpen && !!detailTask}
        transparent
        animationType="slide"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setEditOpen(false)}
          />
          {detailTask ? (
            <View
              style={[
                styles.modalSheet,
                getModalHeightStyle(editExpanded),
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <SafeAreaView style={styles.modalSafeArea} edges={["top"]}>
                <ScrollView
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  onScrollBeginDrag={() => setEditExpanded(true)}
                  scrollEventThrottle={16}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Task</Text>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => setEditOpen(false)}
                    >
                      <Ionicons
                        name="close"
                        size={18}
                        color={colors.inkTertiary}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.modalSubtitle}>
                    Update status and assignees for this task.
                  </Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Update Status</Text>
                    <View style={styles.statusActionRow}>
                      {statusActions.map((status) => {
                        const style = statusStyles[status];
                        return (
                          <Pressable
                            key={status}
                            onPress={() => handleUpdateStatus(status)}
                            style={[
                              styles.statusAction,
                              {
                                backgroundColor: style.bg,
                                borderColor: style.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusActionText,
                                { color: style.text },
                              ]}
                              numberOfLines={1}
                            >
                              {style.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Assignees</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.agentChipRow}>
                        {agents.map((agent: any) => {
                          const selected = assigneesDraft.includes(agent._id);
                          return (
                            <Pressable
                              key={agent._id}
                              style={[
                                styles.agentChip,
                                selected ? styles.agentChipSelected : null,
                              ]}
                              onPress={() =>
                                handleToggleAssignee(
                                  agent._id,
                                  setAssigneesDraft,
                                )
                              }
                            >
                              <Avatar name={agent.name} size={24} />
                              <Text style={styles.agentChipText}>
                                {agent.name}
                              </Text>
                              {selected ? (
                                <View style={styles.selectedDot} />
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  <View style={styles.modalFooter}>
                    <Pressable
                      style={styles.modalSecondary}
                      onPress={() => setEditOpen(false)}
                    >
                      <Text style={styles.modalSecondaryText}>Close</Text>
                    </Pressable>
                    <Pressable
                      style={styles.modalPrimary}
                      onPress={handleSaveAssignees}
                      disabled={isSavingAssignees}
                    >
                      {isSavingAssignees ? (
                        <ActivityIndicator color={colors.inkInverse} />
                      ) : (
                        <Text style={styles.modalPrimaryText}>
                          Save Assignees
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          ) : null}
        </View>
      </Modal>

      <DocumentViewerModal
        visible={!!selectedDocument}
        documentId={selectedDocument?._id}
        fallbackDocument={selectedDocument}
        onClose={handleCloseDocument}
        getAuthorName={getAgentName}
      />
    </SafeAreaView>
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
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.accentCoral,
  },
  primaryButtonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkInverse,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    paddingHorizontal: 12,
    backgroundColor: colors.bgSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkPrimary,
  },
  section: {
    gap: 12,
  },
  countBadge: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSecondary,
    alignItems: "center",
  },
  countText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.inkMuted,
  },
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    gap: 10,
    padding: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  priorityText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  taskTitle: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.inkPrimary,
  },
  taskDescription: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeAvatar: {
    marginRight: -6,
    borderWidth: 2,
    borderColor: colors.bgPrimary,
  },
  assigneeEmpty: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  dueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueText: {
    fontFamily: fonts.sans,
    fontSize: 11,
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
  modalSafeArea: {
    flex: 1,
  },
  modalScrollContent: {
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
  },
  editButtonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.inkSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
  detailList: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkTertiary,
  },
  detailValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  assigneeList: {
    gap: 10,
  },
  assigneeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeName: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  assigneeRole: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  messageList: {
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
  },
  messageContent: {
    flex: 1,
    gap: 4,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  messageAuthor: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  messageTime: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.inkMuted,
  },
  messageText: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    color: colors.inkSecondary,
  },
  messageTextSegment: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    color: colors.inkSecondary,
  },
  mentionPill: {
    backgroundColor: "#EEF4FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.statusInfo,
  },
  mentionPillAll: {
    backgroundColor: colors.accentCoral,
    borderColor: colors.accentCoral,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkInverse,
  },
  activityList: {
    gap: 10,
  },
  activityRow: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
    gap: 4,
  },
  activityMessage: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    color: colors.inkPrimary,
  },
  activityMeta: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.inkMuted,
  },
  documentsList: {
    gap: 10,
  },
  documentCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
    padding: 12,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  documentIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkPrimary,
  },
  documentMeta: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkPrimary,
  },
  textarea: {
    minHeight: 110,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkPrimary,
    textAlignVertical: "top",
  },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  priorityChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  assigneeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assigneeCount: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
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
  agentChipName: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkPrimary,
  },
  agentChipRole: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.accentCoral,
  },
  modalPrimaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkInverse,
  },
  taskDetailTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.inkPrimary,
  },
  taskDetailDescription: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkTertiary,
  },
  detailMetaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusActionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  mutedText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
