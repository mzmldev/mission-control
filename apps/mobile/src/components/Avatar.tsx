import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, fonts, radius } from "../theme";
import { getAgentColor, getInitials } from "../utils";

type AvatarProps = {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
};

export function Avatar({ name, size = 32, color, style }: AvatarProps) {
  const backgroundColor = color || getAgentColor(name);
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRadius: radius.sm,
        },
        style,
      ]}
    >
      <Text
        style={[styles.text, { fontSize: Math.max(10, size * 0.32) }]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.inkInverse,
    fontFamily: fonts.sansSemiBold,
    textTransform: "uppercase",
  },
});
