import { create } from "zustand"

type TimerState = {
  isPlaying: boolean
  taskId: number | null
  start: (taskId:number)=>void
  stop: ()=>void

}

export const useTimerStore = create<TimerState>((set)=>({

  isPlaying:false,
  taskId:null,

  start:(taskId)=>{

    set({
      isPlaying:true,
      taskId
    })

  },

  stop:()=>{

    set({
      isPlaying:false,
      taskId:null
    })

  }

}))