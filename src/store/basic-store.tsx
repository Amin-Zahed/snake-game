import { create } from "zustand";

interface GamePadSize {
  width: number;
  height: number;
}

interface BasicStore {
  start: boolean;
  move: boolean;
  gamePadSize: GamePadSize;
  isStarted: () => void;
  setMove: (toggleMove: boolean) => void;
  setGamePadSize: (newGamePadSize: GamePadSize) => void;
}

const INITIAL_GAMEPAD_SIZE: GamePadSize = { width: 0, height: 0 };

const useBasic = create<BasicStore>((set) => ({
  start: false,
  move: false,
  gamePadSize: { ...INITIAL_GAMEPAD_SIZE },
  isStarted: () => set({ start: true }),
  setMove: (toggleMove) => set({ move: toggleMove }),
  setGamePadSize: (newGamePadSize: GamePadSize) =>
    set({ gamePadSize: { ...newGamePadSize } }),
}));

export default useBasic;
