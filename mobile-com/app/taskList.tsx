import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createTask, deleteTask, getTasks, updateTaskCompleted, type Task } from '@/database/taskRepo';
import { useRouter } from 'expo-router';
import { tokens } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';

const ROW_H = tokens.sizes.rowHeight;

export default function TaskListScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const lottieRef = useRef<LottieView>(null);

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

  useEffect(() => {
    if (creating) lottieRef.current?.play();
  }, [creating]);

  const openSheet = useCallback(() => {
    setSheetVisible(true);
  }, []);
  const closeSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleCreate = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createTask(trimmed);
      setTasks((prev) => [created, ...prev]);
      setName('');
      closeSheet();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [creating, name, closeSheet]);

  const handleDelete = useCallback((task: Task) => {
    Alert.alert('删除任务', `确认删除「${task.name}」？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(task.id);
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
          }
        },
      },
    ]);
  }, []);

  const handleComplete = useCallback(async (task: Task) => {
    try {
      await updateTaskCompleted(task.id, !(task.completed === 1));
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: t.completed === 1 ? 0 : 1 } : t))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => {
      const right = () => (
        <View style={styles.actionDelete} accessibilityLabel="删除任务" accessibilityHint="向右滑动后释放即可删除">
          <Ionicons name="trash" size={24} color="#fff" />
        </View>
      );
      const left = () => (
        <View style={styles.actionDone} accessibilityLabel="标记完成" accessibilityHint="向左滑动后释放即可标记完成">
          <Ionicons name="checkmark" size={24} color="#fff" />
        </View>
      );
      return (
        <Swipeable
          renderLeftActions={left}
          renderRightActions={right}
          leftThreshold={60}
          rightThreshold={60}
          onSwipeableOpen={(dir) => {
            if (dir === 'left') handleComplete(item);
            if (dir === 'right') handleDelete(item);
          }}
        >
          <Pressable
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: String(item.id) } })}
            accessibilityLabel={`任务 ${item.name}`}
            accessibilityHint="进入任务详情"
            style={({ pressed }) => [
              styles.cardRow,
              pressed && { opacity: 0.8 },
              item.completed === 1 && styles.completed,
            ]}
          >
            <View style={styles.leadingIcon}>
              <Ionicons
                name={item.completed === 1 ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.completed === 1 ? tokens.colors.dark.tint : tokens.colors.dark.textMuted}
              />
            </View>
            <ThemedText style={styles.taskName} allowFontScaling>
              {item.name}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={tokens.colors.dark.textMuted} />
          </Pressable>
        </Swipeable>
      );
    },
    [handleDelete, handleComplete, router]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: ROW_H, offset: ROW_H * index, index }),
    []
  );

  const translateY = useSharedValue(tokens.sizes.sheetHeight);
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  useEffect(() => {
    translateY.value = withTiming(sheetVisible ? 0 : tokens.sizes.sheetHeight, {
      duration: tokens.motion.duration.sheet,
    });
  }, [sheetVisible, translateY]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">任务</ThemedText>
        <Pressable
          onPress={refresh}
          accessibilityLabel="刷新"
          accessibilityHint="刷新任务列表"
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
          hitSlop={tokens.sizes.hitSlop}
        >
          <Ionicons name="refresh" size={22} color={tokens.colors.dark.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <LottieView
            ref={lottieRef}
            style={{ width: tokens.sizes.lottie, height: tokens.sizes.lottie }}
            source={require('@/assets/loader.json')}
            autoPlay
            loop
          />
        </View>
      ) : error ? (
        <ThemedText>{error}</ThemedText>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          getItemLayout={getItemLayout}
          initialNumToRender={12}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={{ paddingBottom: 96 }}
          accessibilityRole="list"
        />
      )}

      <Pressable
        onPress={openSheet}
        accessibilityLabel="新增任务"
        accessibilityHint="打开创建任务面板"
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        hitSlop={tokens.sizes.hitSlop}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={sheetVisible} transparent animationType="fade" onRequestClose={closeSheet}>
        <View style={styles.sheetMask}>
          <PanGestureHandler
            onGestureEvent={({ nativeEvent }) => {
              if (nativeEvent.translationY > 60) closeSheet();
            }}
          >
            <Animated.View style={[styles.sheet, sheetStyle]}>
              <View style={styles.sheetHandle} />
              <ThemedText type="defaultSemiBold">创建任务</ThemedText>
              <View style={styles.formRow}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="任务名称"
                  placeholderTextColor={tokens.colors.dark.textMuted}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                  allowFontScaling
                  accessibilityLabel="任务名称输入框"
                />
                <Pressable
                  onPress={handleCreate}
                  disabled={creating || !name.trim()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { opacity: 0.9 },
                    (creating || !name.trim()) && styles.disabled,
                  ]}
                  accessibilityLabel="创建任务"
                  accessibilityHint="提交并创建任务"
                >
                  {creating ? (
                    <LottieView
                      ref={lottieRef}
                      style={{ width: tokens.sizes.lottie, height: tokens.sizes.lottie }}
                      source={require('@/assets/loader.json')}
                      autoPlay
                      loop
                    />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </Pressable>
              </View>
              <Pressable
                onPress={closeSheet}
                style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
                accessibilityLabel="关闭面板"
                accessibilityHint="下滑或点击按钮关闭"
              >
                <ThemedText style={{ color: '#fff' }}>关闭</ThemedText>
              </Pressable>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </Modal>
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
  iconBtn: {
    width: tokens.sizes.touch,
    height: tokens.sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.full,
  },
  cardRow: {
    height: ROW_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.dark.card,
    borderWidth: 1,
    borderColor: tokens.colors.dark.outline,
  },
  completed: {
    opacity: 0.6,
  },
  leadingIcon: {
    width: 32,
    alignItems: 'center',
  },
  taskName: {
    flex: 1,
    fontSize: 16,
  },
  actionDelete: {
    height: ROW_H,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    backgroundColor: tokens.colors.dark.danger,
    borderRadius: tokens.radius.lg,
  },
  actionDone: {
    height: ROW_H,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    backgroundColor: tokens.colors.dark.tint,
    borderRadius: tokens.radius.lg,
  },
  separator: {
    height: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: tokens.shadow.card.elevation,
  },
  sheetMask: {
    flex: 1,
    backgroundColor: tokens.colors.dark.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: tokens.sizes.sheetHeight,
    backgroundColor: tokens.colors.dark.bg,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderColor: tokens.colors.dark.outline,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.dark.outline,
    marginBottom: 6,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.colors.dark.divider,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: tokens.colors.dark.cardElevated,
  },
  primaryBtn: {
    width: tokens.sizes.touch,
    height: tokens.sizes.touch,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    height: tokens.sizes.touch,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.38,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
