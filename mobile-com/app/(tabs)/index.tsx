import { Image} from 'expo-image';
import { Platform, StyleSheet,View } from 'react-native';

import TimeCornTop from '@/components/time-corn-top';
import TimeVideoCenter from '@/components/time-video-center';



export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <TimeCornTop />
      </View>
      <View style={{flex: 8,borderColor: 'red',borderWidth: 1}}>
        <TimeVideoCenter isPlaying={false} />
      </View>
      <View style={{flex: 1}}>
        <TimeCornTop />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#100D0A',
    }
})
