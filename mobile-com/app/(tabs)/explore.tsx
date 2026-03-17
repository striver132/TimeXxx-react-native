import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';



export default function TabTwoScreen() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);


  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">API 测试</ThemedText>

      <ThemedView style={styles.card}>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <>
            <ThemedText type="defaultSemiBold">请求失败</ThemedText>
            <ThemedText>{error}</ThemedText>
            <ThemedText style={styles.hint}>
              真机/Expo Go 不能用 localhost，请确保手机和电脑同一局域网。
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="defaultSemiBold">返回</ThemedText>
            <ThemedText>{message ?? '(empty)'}</ThemedText>
          </>
        )}
      </ThemedView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  hint: {
    opacity: 0.8,
  },
});
