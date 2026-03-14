import { StyleSheet, View, Button } from 'react-native';
import { useState } from 'react';

import TimeCornTop from '@/components/time-corn-top';
import TimeVideoCenter from '@/components/time-video-center';
import TaskSelect from '@/components/task-select';

export default function HomeScreen() {

  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
   const handleStartPress = () => {
    if (!isPlaying) {
      setModalVisible(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSelectTask = (task: string) => {
    console.log("Selected:", task);
    setModalVisible(false);
    setIsPlaying(true);
  };

  return (
    <View style={styles.container}>
      
      <View style={{ flex: 1 }}>
        <TimeCornTop />
      </View>

      <View style={{ flex: 8 }}>
        <TimeVideoCenter isPlaying={isPlaying} />
      </View>

      <View style={{ flex: 2 }}>
        <Button
          title={isPlaying ? "Stop" : "Start"}
          onPress={handleStartPress}
        />
      </View>
      <TaskSelect
        visible={modalVisible}
        onSelect={handleSelectTask}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100D0A',
  }
});