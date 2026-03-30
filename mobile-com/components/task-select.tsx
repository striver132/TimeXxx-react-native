import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Link } from 'expo-router';
import { Canvas, Circle, Path, Rect } from '@shopify/react-native-skia';
import { getTasks, getTasksLastNDaysDurations, type Task } from '@/database/taskRepo';
type Props = {
    visible: boolean;
    onSelect(task: Task): void;
    onClose: () => void;
}
export default function TaskSelect({ visible, onSelect, onClose }: Props) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [last3DaysByTaskId, setLast3DaysByTaskId] = useState<Record<number, [number, number, number]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDay = useCallback((date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }, []);

    const buildLastNDays = useCallback((days: number) => {
        const now = new Date();
        const list: string[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const dt = new Date(now);
            dt.setDate(now.getDate() - i);
            list.push(formatDay(dt));
        }
        return list;
    }, [formatDay]);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const lastDays = buildLastNDays(3);
            const [taskRows, last3Rows] = await Promise.all([
                getTasks(),
                getTasksLastNDaysDurations(3),
            ]);
            setTasks(taskRows);

            const byTask: Record<number, [number, number, number]> = {};
            for (const row of last3Rows) {
                const idx = lastDays.indexOf(row.day);
                if (idx === -1) continue;
                const prev = byTask[row.task_id] ?? [0, 0, 0];
                prev[idx] = row.total_duration;
                byTask[row.task_id] = prev;
            }
            setLast3DaysByTaskId(byTask);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, [buildLastNDays]);

    useEffect(() => {
        if (!visible) return;
        refresh();
    }, [refresh, visible]);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.mask}>
                <View style={styles.modal}>
                    <ThemedText type="defaultSemiBold" style={styles.title}>选择任务</ThemedText>

                    {loading ? (
                        <ActivityIndicator />
                    ) : error ? (
                        <ThemedText>{error}</ThemedText>
                    ) : (
                        <FlatList
                            data={tasks}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => onSelect(item)}>
                                    <View style={styles.cardRow}>
                                        <View style={styles.cardLeft}>
                                            <ThemedText style={styles.taskName}>{item.name}</ThemedText>
                                            <ThemedText ></ThemedText>
                                        </View>
                                        <View style={styles.chartWrap}>
                                            <Canvas style={styles.chart}>
                                                <Rect x={0} y={0} width={120} height={48} color="#171717" />
                                                {(() => {
                                                    const values = last3DaysByTaskId[item.id] ?? [0, 0, 0];
                                                    const w = 120;
                                                    const h = 48;
                                                    const p = 6;
                                                    const max = Math.max(1, values[0], values[1], values[2]);
                                                    const xs = [p, w / 2, w - p];
                                                    const ys = values.map((v) => {
                                                        const n = Math.max(0, v) / max;
                                                        return h - p - n * (h - p * 2);
                                                    });
                                                    const d = `M ${xs[0]} ${ys[0]} L ${xs[1]} ${ys[1]} L ${xs[2]} ${ys[2]}`;
                                                    return (
                                                        <>
                                                            <Path path={d} color="#fff" style="stroke" strokeWidth={2} />
                                                            <Circle cx={xs[0]} cy={ys[0]} r={2} color="#ffffff" />
                                                            <Circle cx={xs[1]} cy={ys[1]} r={2} color="#ffffff" />
                                                            <Circle cx={xs[2]} cy={ys[2]} r={2} color="#ffffff" />
                                                        </>
                                                    );
                                                })()}
                                            </Canvas>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                            ListEmptyComponent={() => (
                                <ThemedText style={styles.empty}>暂无任务</ThemedText>
                            )}
                        />
                    )}

                    <View style={styles.footer}>
                        <Button title="刷新" onPress={refresh} disabled={loading} />
                        <Link href="/taskList" dismissTo style={styles.link}>
                            <ThemedText type="link">Go to task list</ThemedText>
                        </Link>
                    </View>

                    <Button title="Cancel" onPress={onClose} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: '92%',
    backgroundColor: "#0f0f0f",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  title: {
    fontSize: 18,
    marginBottom: 16,
    color:'#fff'
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  taskName: {
    fontSize: 16,
    flex: 1,
    color:'#fff'
  },
  
  chartWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chart: {
    width: 120,
    height: 48,
  },
  empty: {
    opacity: 0.7,
    paddingVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  link: {
    paddingVertical: 10,
  },
});
