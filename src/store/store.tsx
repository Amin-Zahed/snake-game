import { create } from "zustand";

interface Position {
  x: number;
  y: number;
}

interface GamePadSize {
  width: number;
  height: number;
}

interface GameState {
  STEP: number;
  INITIAL_SPEED: number;
  SPEED_INCREMENT: number;
  INITIAL_LIVES: number;
  INITIAL_SNAKE_COLOR: string;
  INITIAL_POSITION: Position[];
  INITIAL_FOOD: Position;
  MAX_SPEED: number;
  INITIAL_SCORE: number;
  SCORE_INCREMENT: number;
  start: boolean;
  move: boolean;
  sound: boolean;
  snakeColor: string;
  direction: "up" | "down" | "left" | "right";
  score: number;
  speed: number;
  lives: number;
  position: Position[];
  food: Position;
  gamePadSize: GamePadSize;
  isStarted: () => void;
  setMove: (toggleMove: boolean) => void;
  setSound: (toggleSound: boolean) => void;
  setDirection: (newDirection: "up" | "down" | "left" | "right") => void;
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
  setGamePadSize: (newGamePadSize: GamePadSize) => void;
  setSnakeColor: (newSnakeColor: string) => void;
  // setDefaultSnakeColor: () => void;
}

const STEP = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 10;
const INITIAL_LIVES = 3;
const INITIAL_SNAKE_COLOR = "#16A34A";
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
const INITIAL_GAMEPAD_SIZE: GamePadSize = { width: 0, height: 0 };

const useZustand = create<GameState>((set) => ({
  INITIAL_SPEED,
  SPEED_INCREMENT,
  INITIAL_LIVES,
  INITIAL_SNAKE_COLOR,
  INITIAL_POSITION,
  INITIAL_FOOD,
  MAX_SPEED,
  INITIAL_SCORE,
  SCORE_INCREMENT,
  STEP,

  start: false,
  move: false,
  sound: true,
  direction: "right",
  score: INITIAL_SCORE,
  snakeColor: INITIAL_SNAKE_COLOR,
  speed: INITIAL_SPEED,
  lives: INITIAL_LIVES,
  position: [...INITIAL_POSITION],
  food: { ...INITIAL_FOOD },
  gamePadSize: { ...INITIAL_GAMEPAD_SIZE },

  isStarted: () => set({ start: true }),
  setMove: (toggleMove) => set({ move: toggleMove }),
  setSound: (toggleSound) => set({ sound: toggleSound }),

  setDirection: (newDirection: "up" | "down" | "left" | "right") =>
    set({ direction: newDirection }),

  speedIncrement: () =>
    set((state: GameState) => ({
      speed: Math.max(MAX_SPEED, state.speed - SPEED_INCREMENT),
    })),
  resetSpeed: () => set({ speed: INITIAL_SPEED }),

  scoreIncrement: () =>
    set((state: GameState) => ({ score: state.score + SCORE_INCREMENT })),
  resetScore: () => set({ score: INITIAL_SCORE }),

  livesDecrement: () =>
    set((state: GameState) => ({ lives: Math.max(0, state.lives - 1) })),
  resetLives: () => set({ lives: INITIAL_LIVES }),

  setPosition: (update) => {
    set((state) => ({
      position: typeof update === "function" ? update(state.position) : update,
    }));
  },
  resetPosition: () => set({ position: [...INITIAL_POSITION] }),

  setFood: (newFood: Position) => set({ food: { ...newFood } }),

  setGamePadSize: (newGamePadSize: GamePadSize) =>
    set({ gamePadSize: { ...newGamePadSize } }),

  setSnakeColor: (newSnakeColor) => set({ snakeColor: newSnakeColor }),
  // setDefaultSnakeColor: () => set({ snakeColor: INITIAL_SNAKE_COLOR }),
}));

export default useZustand;
