import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { api, AnalyticsOverview, ReachDynamics, ApiError } from '../../api/client';
import { MetricCard } from '../../components/MetricCard';
import { LoadingScreen, ErrorState } from '../../components/States';
import { useTheme, fontSize, spacing } from '../../theme';

const CHART_WIDTH = Dimensions.get('window').width - spacing.lg * 2;

export function AnalyticsScreen() {
  const { colors } = useTheme();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dynamics, setDynamics] = useState<ReachDynamics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [ov, dyn] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getReachDynamics(30),
      ]);
      setOverview(ov);
      setDynamics(dyn);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить аналитику');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!overview) return null;

  const styles = makeStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Аналитика</Text>

      <View style={styles.metricsRow}>
        <MetricCard
          value={overview.followersCount.toLocaleString('ru-RU')}
          label="Подписчики"
          delta={overview.followersDelta.toLocaleString('ru-RU')}
          positive={overview.followersDelta >= 0}
        />
        <MetricCard
          value={`${overview.engagementRate.toFixed(1)}%`}
          label="Вовлечённость"
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          value={overview.totalReach.toLocaleString('ru-RU')}
          label="Общий охват"
        />
        <MetricCard
          value={overview.totalPosts.toString()}
          label="Постов"
        />
      </View>

      {dynamics && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Динамика охватов</Text>
          <Text style={styles.chartSubtitle}>За последние 30 дней</Text>

          {/* Simple bar chart without external dependency */}
          <View style={styles.chart}>
            {dynamics.reach.slice(-14).map((value, index) => {
              const max = Math.max(...dynamics.reach.slice(-14));
              const height = max > 0 ? (value / max) * 150 : 0;
              const isLast = index === dynamics.reach.slice(-14).length - 1;
              return (
                <View key={index} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 2),
                        backgroundColor: isLast ? colors.coral : colors.mint,
                      },
                    ]}
                  />
                  {index % 3 === 0 && (
                    <Text style={styles.barLabel}>
                      {dynamics.labels.slice(-14)[index]?.slice(-2) || ''}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {dynamics && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Вовлечённость</Text>
          <View style={styles.chart}>
            {dynamics.engagement.slice(-14).map((value, index) => {
              const max = Math.max(...dynamics.engagement.slice(-14));
              const height = max > 0 ? (value / max) * 150 : 0;
              const isLast = index === dynamics.engagement.slice(-14).length - 1;
              return (
                <View key={index} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 2),
                        backgroundColor: isLast ? colors.coral : colors.ink,
                        opacity: 0.7,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chartSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    padding: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: fontSize.sm,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    paddingTop: spacing.md,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  bar: {
    width: '70%',
    borderRadius: 3,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 9,
    color: colors.slate,
    marginTop: 4,
  },
});
