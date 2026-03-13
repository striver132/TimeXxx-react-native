import { Image} from 'expo-image';
import { Platform, StyleSheet,View } from 'react-native';

import TimeCornTop from '@/components/time-corn-top';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
           <TimeCornTop />
    </View>
  );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#100D0A',
    }
})
