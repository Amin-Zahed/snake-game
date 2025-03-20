import { create } from "zustand";

export interface Position {
  x: number;
  y: number;
}

export enum DIRECTION {
  RIGHT = "right",
  LEFT = "left",
  UP = "up",
  DOWN = "down",
}

interface GameLogicStore {
  STEP: number;
  INITIAL_SPEED: number;
  SPEED_INCREMENT: number;
  INITIAL_LIVES: number;
  INITIAL_POSITION: Position[];
  INITIAL_FOOD: Position;
  MAX_SPEED: number;
  INITIAL_SCORE: number;
  SCORE_INCREMENT: number;
  INITIAL_DIRECTION: string;
  direction: DIRECTION;
  score: number;
  speed: number;
  lives: number;
  position: Position[];
  food: Position;
  setDirection: (newDirection: DIRECTION) => void;
  resetDirection: () => void;
  speedIncrement: () => void;
  resetSpeed: () => void;
  scoreIncrement: () => void;
  resetScore: () => void;
  livesDecrement: () => void;
  resetLives: () => void;
  setPosition: (
    update: ((prev: Position[]) => Position[]) | Position[]
  ) => void;
  resetPosition: () => void;
  setFood: (newFood: Position) => void;
  resetFood: () => void;
}

const STEP = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 10;
const INITIAL_LIVES = 3;
const INITIAL_POSITION: Position[] = [
  { x: 160, y: 160 },
  { x: 140, y: 160 },
  { x: 120, y: 160 },
  { x: 100, y: 160 },
  { x: 80, y: 160 },
];
const INITIAL_FOOD: Position = { x: 200, y: 200 };
const MAX_SPEED = 50;
const INITIAL_SCORE = 0;
const SCORE_INCREMENT = 10;
const INITIAL_DIRECTION = DIRECTION.RIGHT;

const useLogic = create<GameLogicStore>((set) => ({
  INITIAL_SPEED,
  SPEED_INCREMENT,
  INITIAL_LIVES,
  INITIAL_POSITION,
  INITIAL_FOOD,
  MAX_SPEED,
  INITIAL_SCORE,
  SCORE_INCREMENT,
  STEP,
  INITIAL_DIRECTION,

  direction: INITIAL_DIRECTION,
  score: INITIAL_SCORE,
  speed: INITIAL_SPEED,
  lives: INITIAL_LIVES,
  position: [...INITIAL_POSITION],
  food: { ...INITIAL_FOOD },

  setDirection: (newDirection) => set({ direction: newDirection }),
  resetDirection: () => set({ direction: INITIAL_DIRECTION }),

  speedIncrement: () =>
    set((state: GameLogicStore) => ({
      speed: Math.max(MAX_SPEED, state.speed - SPEED_INCREMENT),
    })),
  resetSpeed: () => set({ speed: INITIAL_SPEED }),

  scoreIncrement: () =>
    set((state: GameLogicStore) => ({ score: state.score + SCORE_INCREMENT })),
  resetScore: () => set({ score: INITIAL_SCORE }),

  livesDecrement: () =>
    set((state: GameLogicStore) => ({ lives: Math.max(0, state.lives - 1) })),
  resetLives: () => set({ lives: INITIAL_LIVES }),

  setPosition: (update) => {
    set((state) => ({
      position: typeof update === "function" ? update(state.position) : update,
    }));
  },
  resetPosition: () => set({ position: [...INITIAL_POSITION] }),

  setFood: (newFood: Position) => set({ food: { ...newFood } }),
  resetFood: () => set({ food: INITIAL_FOOD }),
}));

export default useLogic;
