import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme';

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="返回" accessibilityHint="返回上一页">
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <ThemedText type="title">任务详情</ThemedText>
        <View style={styles.iconBtn} />
      </View>
      <ThemedText>任务 ID：{id}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: tokens.sizes.touch,
    height: tokens.sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
