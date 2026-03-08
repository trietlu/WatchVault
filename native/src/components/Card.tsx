import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
});
