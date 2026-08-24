import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface MetricCardProps {
  value: string;
  label: string;
  delta?: string;
  positive?: boolean;
}

export function MetricCard({ value, label, delta, positive = true }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {delta ? (
        <Text style={[styles.delta, positive ? styles.positive : styles.negative]}>
          {positive ? '+' : ''}{delta}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ghost,
    borderRadius: radius.sm,
    padding: spacing.md,
    minWidth: 140,
  },
  value: {
    fontFamily: 'SpaceMono',
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.slate,
    lineHeight: 18,
  },
  delta: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.error,
  },
});
