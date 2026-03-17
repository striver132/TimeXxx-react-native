import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createTask, getTasks, type Task } from '@/database/taskRepo';
import { useTimerStore } from '@/store/timerStore';

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');

  const isPlaying = useTimerStore((s) => s.isPlaying);
  const playingTaskId = useTimerStore((s) => s.taskId);
  const start = useTimerStore((s) => s.start);
  const stop = useTimerStore((s) => s.stop);

  const playingTaskName = useMemo(() => {
    if (!isPlaying || playingTaskId == null) return null;
    return tasks.find((t) => t.id === playingTaskId)?.name ?? null;
  }, [isPlaying, playingTaskId, tasks]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getTasks();
      setTasks(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    setError(null);
    try {
      const created = await createTask(trimmed);
      setTasks((prev) => [created, ...prev]);
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [creating, name]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">任务</ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="defaultSemiBold">创建任务</ThemedText>
        <View style={styles.createRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="任务名称"
            placeholderTextColor="#999"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <Button title={creating ? '创建中' : '创建'} onPress={handleCreate} disabled={creating} />
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <ThemedText type="defaultSemiBold">任务列表</ThemedText>
          <Button title="刷新" onPress={refresh} disabled={loading} />
        </View>

        {isPlaying ? (
          <ThemedText style={styles.playingText}>
            正在计时：{playingTaskName ?? `#${playingTaskId ?? ''}`}
          </ThemedText>
        ) : null}

        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <ThemedText>{error}</ThemedText>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const active = isPlaying && playingTaskId === item.id;
              return (
                <View style={styles.row}>
                  <ThemedText style={styles.taskName}>{item.name}</ThemedText>
                  <Pressable
                    onPress={() => {
                      if (active) stop();
                      else start(item.id);
                    }}
                    style={({ pressed }) => [styles.playBtn, pressed && styles.playBtnPressed]}
                  >
                    <ThemedText style={styles.playBtnText}>{active ? '停止' : '开始'}</ThemedText>
                  </Pressable>
                </View>
              );
            }}
            ListEmptyComponent={() => <ThemedText style={styles.empty}>暂无任务</ThemedText>}
          />
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
    gap: 10,
  },
  createRow: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playingText: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  taskName: {
    flex: 1,
  },
  playBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0a7ea4',
  },
  playBtnPressed: {
    opacity: 0.7,
  },
  playBtnText: {
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  empty: {
    opacity: 0.7,
    paddingVertical: 12,
  },
});
