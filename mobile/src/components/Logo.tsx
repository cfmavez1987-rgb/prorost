import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { colors } from '../theme';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 32, showText = true }: LogoProps) {
  const markSize = size;
  const textSize = size * 0.85;

  return (
    <View style={styles.container}>
      <Svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
        <Rect x="4" y="28" width="8" height="16" rx="2.5" fill={colors.coral} opacity={0.5} />
        <Rect x="16" y="18" width="8" height="26" rx="2.5" fill={colors.coral} opacity={0.75} />
        <Rect x="28" y="6" width="8" height="38" rx="2.5" fill={colors.coral} />
        <Circle cx="32" cy="3" r="4" fill={colors.mint} />
      </Svg>
      {showText && (
        <Text style={[styles.text, { fontSize: textSize }]}>ПроРосТ</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.5,
  },
});
