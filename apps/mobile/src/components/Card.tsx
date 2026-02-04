import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadow } from "../theme";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 1,
    borderColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: 16,
    ...shadow.soft,
  },
});
