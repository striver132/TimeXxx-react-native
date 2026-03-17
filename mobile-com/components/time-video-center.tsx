import { View, StyleSheet } from "react-native";
import { Video,ResizeMode } from "expo-av";

export default function TimeVideoCenter({ isPlaying = true }: { isPlaying: boolean }) {
  return (
    <View style={styles.container}>
      <Video
        source={require('@/assets/images/home/timer-video.mp4')}
        style={styles.media}
        shouldPlay={isPlaying}
        isLooping
        resizeMode={ResizeMode.COVER}

        // 未播放时显示封面
        usePoster={!isPlaying}
        posterSource={require('@/assets/images/home/timer.png')}

        onLoad={() => console.log('Video loaded')}
        onError={(error) => console.log('Video error:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#100D0A",
  },
  media: {
    width: 213,
    height: 334,
  }
});
