import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createTask, deleteTask, getTasks, type Task } from '@/database/taskRepo';
import { useRouter } from 'expo-router';
export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');

  const router = useRouter();

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

  const handleDelete = useCallback((task: Task) => {
    Alert.alert(
      '删除任务',
      `确认删除「${task.name}」？删除后该任务的计时记录也会一并清理。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(task.id);
            setError(null);
            try {
              await deleteTask(task.id);
              setTasks((prev) => prev.filter((t) => t.id !== task.id));
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Button title="返回" onPress={() => router.replace('/')} />
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
              return (
                <View style={styles.row}>
                  <ThemedText style={styles.taskName}>{item.name}</ThemedText>
                  <Pressable
                    onPress={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      pressed && styles.deleteBtnPressed,
                      deletingId === item.id && styles.deleteBtnDisabled,
                    ]}
                  >
                    <ThemedText style={styles.deleteBtnText}>
                      {deletingId === item.id ? '删除中' : '删除'}
                    </ThemedText>
                  </Pressable>
                </View>
              );
            }}
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
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#d33',
  },
  deleteBtnPressed: {
    opacity: 0.7,
  },
  deleteBtnDisabled: {
    opacity: 0.5,
  },
  deleteBtnText: {
    color: '#fff',
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
