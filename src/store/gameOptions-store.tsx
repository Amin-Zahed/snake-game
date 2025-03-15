import { create } from "zustand";

interface GameOptionsStore {
  INITIAL_SNAKE_COLOR: string;
  snakeColor: string | unknown;
  sound: boolean;
  setSnakeColor: (newSnakeColor: string) => void;
  setSound: (toggleSound: boolean) => void;
  resetSnakeColor: () => void;
}

const INITIAL_SNAKE_COLOR = "#16A34A";

const useOptions = create<GameOptionsStore>((set) => ({
  INITIAL_SNAKE_COLOR,

  snakeColor: localStorage.getItem("snake-color")
    ? localStorage.getItem("snake-color")
    : INITIAL_SNAKE_COLOR,
  sound: true,

  setSnakeColor: (newSnakeColor) => set({ snakeColor: newSnakeColor }),
  resetSnakeColor: () => set({ snakeColor: INITIAL_SNAKE_COLOR }),

  setSound: (toggleSound) => set({ sound: toggleSound }),
}));

export default useOptions;
