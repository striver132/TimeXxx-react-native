import React from "react"
import { Pressable, StyleSheet, Animated } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function AddButton({ onPress }: { onPress: () => void }) {
  const rotate = new Animated.Value(0)

  const onPressIn = () => {
    Animated.timing(rotate, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()
  }

  const onPressOut = () => {
    Animated.timing(rotate, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start()
  }

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"]
  })

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.button}
    >
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Svg width={50} height={50} viewBox="0 0 24 24">
          <Path
            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
            stroke="#a1a1aa"
            strokeWidth="1.5"
            fill="none"
          />
          <Path d="M8 12H16" stroke="#a1a1aa" strokeWidth="1.5" />
          <Path d="M12 16V8" stroke="#a1a1aa" strokeWidth="1.5" />
        </Svg>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center"
  }
})