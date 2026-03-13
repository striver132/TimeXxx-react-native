import { View, StyleSheet,Image } from "react-native"
import {Video} from 'expo-av'
export default function TimeVideoCenter({isPlaying = false}: {isPlaying: boolean}) {
  return (
    <View style={styles.container}>
        {isPlaying ? (
            <Video
                source={{uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'}}
                style={styles.media}
                shouldPlay
            />
        ) : (
            <Image
                source={require('@/assets/images/home/timer.png')}
                style={styles.media}
            />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#100D0A",
    justifyContent: "center",
    alignItems: "center"
  },
  media: {
    width: 213,
    height: 334
  }
})
