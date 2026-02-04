import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@repo/convex/convex/_generated/api";
import { colors, fonts, radius, shadow } from "../theme";
import { formatTimeAgo } from "../utils";

type DocumentViewerModalProps = {
  visible: boolean;
  documentId?: string | null;
  fallbackDocument?: any;
  onClose: () => void;
  getAuthorName: (agentId?: string) => string;
};

const screenHeight = Dimensions.get("window").height;

export function DocumentViewerModal({
  visible,
  documentId,
  fallbackDocument,
  onClose,
  getAuthorName,
}: DocumentViewerModalProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const document = useQuery(
    api.documents.get,
    documentId ? { id: documentId as any } : "skip",
  );

  useEffect(() => {
    if (!visible) {
      setExpanded(false);
    }
  }, [visible, documentId]);

  const resolvedDocument = useMemo(
    () =>
      document === undefined ? fallbackDocument : document || fallbackDocument,
    [document, fallbackDocument],
  );
  const isLoading = visible && !!documentId && document === undefined;

  const normalizeContent = (value: any) => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  };

  const getDocumentMarkdown = (doc: any) => {
    const rawContent = normalizeContent(doc?.content);
    const content = rawContent.trim();
    const type = doc?.type || "text";
    const fence = "```";
    const language =
      typeof doc?.metadata?.language === "string"
        ? doc.metadata.language
        : undefined;

    const buildCodeBlock = (value: string, lang?: string) =>
      `${fence}${lang || ""}\n${value}\n${fence}`;

    let body = "";

    if (!content) {
      body = "_No content provided._";
    } else if (type === "markdown") {
      body = content;
    } else if (type === "code") {
      body = buildCodeBlock(content, language);
    } else if (type === "json") {
      body = buildCodeBlock(content, "json");
    } else if (type === "link") {
      const link = content.startsWith("http") ? content : `https://${content}`;
      body = `[${content}](${link})`;
    } else {
      body = content;
    }

    if (doc?.metadata && typeof doc.metadata === "object") {
      const metadataKeys = Object.keys(doc.metadata || {});
      if (metadataKeys.length > 0) {
        const metadataJson = JSON.stringify(doc.metadata, null, 2);
        body += `\n\n## Metadata\n${buildCodeBlock(metadataJson, "json")}`;
      }
    }

    return body;
  };

  const modalHeightStyle = {
    height: expanded ? screenHeight : screenHeight * 0.65,
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
            modalHeightStyle,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={["top"]}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => setExpanded(true)}
              scrollEventThrottle={16}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Document</Text>
                <Pressable style={styles.iconButton} onPress={onClose}>
                  <Ionicons name="close" size={18} color={colors.inkTertiary} />
                </Pressable>
              </View>

              {resolvedDocument ? (
                <>
                  <Text style={styles.documentTitle}>
                    {resolvedDocument.title}
                  </Text>
                  <View style={styles.documentMeta}>
                    <View style={styles.documentBadge}>
                      <Text style={styles.documentBadgeText}>
                        {(resolvedDocument.type || "text").toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.documentMetaText}>
                      v{resolvedDocument.version || 1}
                    </Text>
                    <Text style={styles.documentMetaText}>
                      Created {formatTimeAgo(resolvedDocument._creationTime)}
                    </Text>
                    <Text style={styles.documentMetaText}>
                      Author {getAuthorName(resolvedDocument.createdBy)}
                    </Text>
                  </View>

                  <View style={styles.documentContentCard}>
                    <Markdown
                      style={markdownStyles}
                      onLinkPress={(url) => {
                        void Linking.openURL(url);
                        return false;
                      }}
                    >
                      {getDocumentMarkdown(resolvedDocument)}
                    </Markdown>
                  </View>
                </>
              ) : isLoading ? (
                <View style={styles.documentLoading}>
                  <ActivityIndicator color={colors.accentCoral} />
                  <Text style={styles.mutedText}>Loading document...</Text>
                </View>
              ) : (
                <View style={styles.documentLoading}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={colors.inkMuted}
                  />
                  <Text style={styles.mutedText}>Document not found.</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.inkPrimary,
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  heading1: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.inkPrimary,
    marginBottom: 8,
  },
  heading2: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.inkPrimary,
    marginBottom: 6,
  },
  heading3: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.inkPrimary,
    marginBottom: 6,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  link: {
    color: colors.accentCoral,
  },
  code_block: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkPrimary,
    backgroundColor: colors.bgSecondary,
    padding: 10,
    borderRadius: radius.sm,
  },
  code_inline: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkPrimary,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  blockquote: {
    borderLeftColor: colors.bgMuted,
    borderLeftWidth: 3,
    paddingLeft: 10,
    color: colors.inkTertiary,
  },
});

const styles = StyleSheet.create({
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
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.inkPrimary,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSecondary,
  },
  documentTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.inkPrimary,
  },
  documentMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  documentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSecondary,
  },
  documentBadgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.inkSecondary,
    letterSpacing: 0.6,
  },
  documentMetaText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkMuted,
  },
  documentContentCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    backgroundColor: colors.bgSecondary,
    padding: 12,
  },
  documentLoading: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  mutedText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
