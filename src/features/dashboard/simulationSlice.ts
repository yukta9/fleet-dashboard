import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SimulationState {
  speed: 1 | 5 | 10;
  isPlaying: boolean;
  currentTime: number;
  playbackStartTime: number;
  playbackSpeed: number;
}

const initialState: SimulationState = {
  speed: 1,
  isPlaying: false,
  currentTime: Date.now(),
  playbackStartTime: Date.now(),
  playbackSpeed: 1,
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    play: (state) => {
      state.isPlaying = true;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    setSpeed: (state, action: PayloadAction<1 | 5 | 10>) => {
      state.speed = action.payload;
    },
    tick: (state) => {
      if (state.isPlaying) {
        state.currentTime += 1000 * state.speed;
      }
    },
    resetPlayback: (state) => {
      state.currentTime = state.playbackStartTime;
      state.isPlaying = false;
    },
    setPlaybackTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
  },
});

export const { play, pause, setSpeed, tick, resetPlayback, setPlaybackTime } =
  simulationSlice.actions;

export default simulationSlice.reducer;
