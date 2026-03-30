import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getWallet, redeemTimeToCoins } from '@/database/taskRepo';
import { useRouter } from 'expo-router';

export default function ExchangeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [availableTime, setAvailableTime] = useState(0);
  const [redeemCount, setRedeemCount] = useState('1');
  const [rateSec, setRateSec] = useState('60');

  const needSeconds = useMemo(() => {
    const c = Math.max(0, Math.floor(Number(redeemCount) || 0));
    const r = Math.max(1, Math.floor(Number(rateSec) || 60));
    return c * r;
  }, [redeemCount, rateSec]);

  const canRedeem = useMemo(() => availableTime >= needSeconds && needSeconds > 0, [availableTime, needSeconds]);

  const formatDuration = useCallback((totalSeconds: number) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const w = await getWallet();
      setCoins(w.coins);
      setAvailableTime(w.available_time);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onRedeem = useCallback(async () => {
    const c = Math.max(0, Math.floor(Number(redeemCount) || 0));
    const r = Math.max(1, Math.floor(Number(rateSec) || 60));
    if (c <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const w = await redeemTimeToCoins(c, r);
      setCoins(w.coins);
      setAvailableTime(w.available_time);
      Alert.alert('兑换成功', `已兑换 ${c} 金币`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [redeemCount, rateSec]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Button title="返回" onPress={() => router.back()} />
        <ThemedText type="title">时间兑换</ThemedText>
      </View>

      <ThemedView style={styles.card}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <ThemedText type="defaultSemiBold">钱包</ThemedText>
            <View style={styles.row}>
              <ThemedText>金币</ThemedText>
              <ThemedText>{coins}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText>可用时间</ThemedText>
              <ThemedText>{formatDuration(availableTime)}</ThemedText>
            </View>
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">兑换设置</ThemedText>
        <View style={styles.formRow}>
          <ThemedText>兑换金币</ThemedText>
          <TextInput
            value={redeemCount}
            onChangeText={setRedeemCount}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="数量"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.formRow}>
          <ThemedText>每币秒数</ThemedText>
          <TextInput
            value={rateSec}
            onChangeText={setRateSec}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="秒/币"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.row}>
          <ThemedText>所需时间</ThemedText>
          <ThemedText>{formatDuration(needSeconds)}</ThemedText>
        </View>
        <Button title="兑换" onPress={onRedeem} disabled={!canRedeem || loading} />
        <View style={{ height: 8 }} />
        <Button title="刷新" onPress={refresh} disabled={loading} />
        {error ? <ThemedText>{error}</ThemedText> : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111',
  },
})
