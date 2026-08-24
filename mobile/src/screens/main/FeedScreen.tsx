import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { api, Post, ApiError, AuthError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../../components/PostCard';
import { EmptyState, LoadingScreen, ErrorState } from '../../components/States';
import { colors, fontSize, spacing } from '../../theme';

export function FeedScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      setError(null);
      const res = await api.getPosts(pageNum);
      if (refresh || pageNum === 1) {
        setPosts(res.posts);
      } else {
        setPosts(prev => [...prev, ...res.posts]);
      }
      setHasMore(posts.length + res.posts.length < res.total);
      setPage(pageNum);
    } catch (err) {
      if (err instanceof AuthError) {
        await logout();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить посты');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, posts.length]);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchPosts(1, true);
  }

  function handleLoadMore() {
    if (hasMore && !loading) {
      fetchPosts(page + 1);
    }
  }

  function handlePostPress(post: Post) {
    navigation.navigate('CreatePost', { postId: post.id });
  }

  if (loading && posts.length === 0) return <LoadingScreen />;
  if (error && posts.length === 0) return <ErrorState message={error} onRetry={() => fetchPosts(1, true)} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои посты</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreatePost')}
          activeOpacity={0.7}
        >
          <Text style={styles.createBtnText}>+ Новый</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={handlePostPress} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.coral}
            colors={[colors.coral]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="✍️"
            title="Пока нет постов"
            description="Создайте первый пост с помощью AI"
          />
        }
        ListFooterComponent={
          hasMore && posts.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Загрузка…</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.ink,
  },
  createBtn: {
    backgroundColor: colors.coral,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  createBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    color: colors.slate,
    fontSize: fontSize.sm,
  },
});
