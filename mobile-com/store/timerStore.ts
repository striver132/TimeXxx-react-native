import { create } from "zustand"

interface TimerState {
  isRunning: boolean//time is running
  taskName: string | null//current task name

  startTask: (task: string) => void //start task
  stopTask: () => void//stop task    
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  taskName: null,

  startTask: (task) =>
    set({
      isRunning: true,
      taskName: task
    }),

  stopTask: () =>
    set({
      isRunning: false,
      taskName: null
    })
}))