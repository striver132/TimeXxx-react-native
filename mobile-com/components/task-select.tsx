import { Modal, View, Text, Pressable, StyleSheet, Button } from "react-native";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
type Props = {
    visible: boolean;
    onSelect(task: string): void;
    onClose: () => void;
}
export default function TaskSelect({ visible, onSelect, onClose }: Props) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.mask}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Select Task</Text>

                    <Pressable onPress={() => onSelect("Study")}>
                        <Text style={styles.task}>Study</Text>
                    </Pressable>

                    <Link href="/taskList" dismissTo style={styles.link}>
                            <ThemedText type="link">Go to task list</ThemedText>
                          </Link>

                    <Button title="Cancel" onPress={onClose} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },

  title: {
    fontSize: 18,
    marginBottom: 15,
  },

  task: {
    fontSize: 16,
    paddingVertical: 10,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});