import { View, Button } from "react-native"
import { useTimerStore } from "@/store/timerStore"

export default function TaskSelect() {
    const startTask = useTimerStore((state) => state.startTask)
}