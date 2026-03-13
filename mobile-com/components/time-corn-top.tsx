import { View, Text, StyleSheet, Image } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
export default function TimeCornTop() {
    const [loaded, error] = useFonts({
    'HoltwoodOneSC-Regular': require('@/assets/fonts/HoltwoodOneSC-Regular.ttf'),
  });
    useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
    <View style={styles.container}>
        <View style={styles.containerLeft}>
            <Text style={styles.title}>3/13</Text>
        </View>
        <View style={styles.containerRight}>
            <Image source={require('@/assets/images/home/corn-thumetail.png')} style={{ width: 50, height: 50 }} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    title:{
        fontSize: 24,
        fontFamily: 'HoltwoodOneSC-Regular',
        color: '#FFFFFF',
    },
    container:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    containerLeft:{
        flex: 1,
        marginLeft: 20,
    },
    containerRight:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: 20,
    }
    
})