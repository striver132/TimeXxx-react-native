import { create } from "zustand"
import { addAvailableTime, createTimerRecord } from "@/database/taskRepo"

type TimerState = {
  isPlaying: boolean
  taskId: number | null
  startedAt: number | null
  start: (taskId:number)=>void
  stop: ()=>void

}

export const useTimerStore = create<TimerState>((set, get)=>({

  isPlaying:false,
  taskId:null,
  startedAt:null,

  start:(taskId)=>{

    set({
      isPlaying:true,
      taskId,
      startedAt: Date.now(),
    })

  },

  stop:()=>{
    const state = get();
    if (state.isPlaying && state.taskId != null && state.startedAt != null) {
      const durationSeconds = Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
      createTimerRecord(state.taskId, durationSeconds).catch((err) => {
        console.error("createTimerRecord failed", err);
      });
      addAvailableTime(durationSeconds).catch((err) => {
        console.error("addAvailableTime failed", err);
      });
    }

    set({
      isPlaying:false,
      taskId:null,
      startedAt: null,
    })

  }

}))
