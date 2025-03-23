import { useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";
import ColorChanger from "./components/color-changer";
import ModeToggle from "./components/mode-toggle";
import useBasic from "./store/basic-store.tsx";
import useOptions from "./store/gameOptions-store.tsx";
import useLogic, { Position, DIRECTION } from "./store/gameLogic-store.tsx";
import SNAKE_DANCE_SONG from "./assets/songs/snake-dance.mp3";
import EATING_FOOD_SONG from "./assets/songs/crunchy-eating.mp3";
import LIFE_LOST_SONG from "./assets/songs/life-lost.mp3";
import GAME_OVER_SONG from "./assets/songs/game-over.mp3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function App() {
  const { start, move, gamePadSize, started, setMove, setGamePadSize } =
    useBasic();
  const { sound, snakeColor, resetSnakeColor, setSound } = useOptions();
  const {
    STEP,
    INITIAL_SCORE,
    direction,
    speed,
    score,
    lives,
    position,
    food,
    setDirection,
    resetDirection,
    speedIncrement,
    resetSpeed,
    scoreIncrement,
    resetScore,
    livesDecrement,
    resetLives,
    setPosition,
    resetPosition,
    setFood,
    resetFood,
  } = useLogic();

  const sounds = useMemo(
    () => ({
      snakeDance: new Audio(SNAKE_DANCE_SONG),
      eatingFood: new Audio(EATING_FOOD_SONG),
      lifeLost: new Audio(LIFE_LOST_SONG),
      gameOver: new Audio(GAME_OVER_SONG),
    }),
    []
  );

  const intervalRef = useRef<NodeJS.Timeout>(undefined);
  const gamePadRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<Position[]>(position);

  const updateRecord = useCallback((record: string | number) => {
    const storedRecord = localStorage.getItem("record");
    const bestRecord = storedRecord ? Number(storedRecord) : INITIAL_SCORE;
    if (Number(record) > bestRecord) {
      localStorage.setItem("record", String(record));
    }
  }, []);

  const changeDirection = useCallback(
    (newDirection: DIRECTION) => {
      if (move) {
        if (
          (newDirection === DIRECTION.UP && direction !== DIRECTION.DOWN) ||
          (newDirection === DIRECTION.DOWN && direction !== DIRECTION.UP) ||
          (newDirection === DIRECTION.LEFT && direction !== DIRECTION.RIGHT) ||
          (newDirection === DIRECTION.RIGHT && direction !== DIRECTION.LEFT)
        ) {
          setDirection(newDirection);
        }
      }
    },
    [move, direction]
  );

  const isUniformDirection = useCallback(() => {
    const dx = position[1].x - position[0].x;
    const dy = position[1].y - position[0].y;
    return position.every((segment: Position, index: number) => {
      if (index === 0) return true;
      const prevSegment = position[index - 1];
      return (
        segment.x - prevSegment.x === dx && segment.y - prevSegment.y === dy
      );
    });
  }, [position]);

  const isCollidingWithBody = useCallback(
    (head: { x: number; y: number }) => {
      if (isUniformDirection()) return false;
      return positionRef.current
        .slice(1)
        .some((segment) => segment.x === head.x && segment.y === head.y);
    },
    [positionRef.current]
  );

  const generateRandomFood = useCallback(() => {
    if (gamePadSize.width === 0 || gamePadSize.height === 0)
      return { x: 0, y: 0 };
    const maxX = Math.floor(gamePadSize.width / STEP) * STEP;
    const maxY = Math.floor(gamePadSize.height / STEP) * STEP;
    let x: number = 0;
    let y: number = 0;
    let isValidPosition = false;
    while (!isValidPosition) {
      x = Math.floor(Math.random() * (maxX / STEP)) * STEP;
      y = Math.floor(Math.random() * (maxY / STEP)) * STEP;
      x = Math.floor(x / STEP) * STEP;
      y = Math.floor(y / STEP) * STEP;
      isValidPosition =
        !position.some((pos: Position) => pos.x === x && pos.y === y) &&
        !(x === food.x && y === food.y);
    }
    return { x, y };
  }, [gamePadSize, position]);

  useEffect(() => {
    const updateGamePadSize = () => {
      if (gamePadRef.current) {
        setGamePadSize({
          width: gamePadRef.current.clientWidth,
          height: gamePadRef.current.clientHeight,
        });
      }
    };
    updateGamePadSize();
    updateRecord(score);
    window.addEventListener("resize", updateGamePadSize);
    return () => {
      window.removeEventListener("resize", updateGamePadSize);
    };
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (move && sound) {
      sounds.snakeDance.play();
      sounds.snakeDance.loop = true;
    }
    return () => sounds.snakeDance.pause();
  }, [sound, move]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        [
          "Enter",
          "Space",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      if (start && !move && e.code === "Enter") {
        setMove(true);
      } else {
        switch (e.code) {
          case "Space":
            if (move) setMove(false);
            break;
          case "ArrowUp":
            if (move && direction !== DIRECTION.DOWN)
              setDirection(DIRECTION.UP);
            break;
          case "ArrowDown":
            if (move && direction !== DIRECTION.UP)
              setDirection(DIRECTION.DOWN);
            break;
          case "ArrowRight":
            if (move && direction !== DIRECTION.LEFT)
              setDirection(DIRECTION.RIGHT);
            break;
          case "ArrowLeft":
            if (move && direction !== DIRECTION.RIGHT)
              setDirection(DIRECTION.LEFT);
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [start, move, direction]);

  useEffect(() => {
    if (move) {
      intervalRef.current = setInterval(() => {
        setPosition((prevPosition) => {
          let newHead = { ...prevPosition[0] };
          if (direction === DIRECTION.RIGHT) newHead.x += STEP;
          if (direction === DIRECTION.LEFT) newHead.x -= STEP;
          if (direction === DIRECTION.DOWN) newHead.y += STEP;
          if (direction === DIRECTION.UP) newHead.y -= STEP;
          newHead.x = Math.round(newHead.x / STEP) * STEP;
          newHead.y = Math.round(newHead.y / STEP) * STEP;
          if (isCollidingWithBody(newHead)) {
            if (lives > 1) {
              livesDecrement();
              setMove(false);
              if (sound) {
                sounds.lifeLost.play();
              }
              setTimeout(() => {
                resetPosition();
                resetSpeed();
                resetDirection();
                setMove(true);
              }, 1000);
            } else {
              resetLives();
              setMove(false);
              updateRecord(score);
              if (sound) {
                sounds.gameOver.play();
              }
              setTimeout(() => {
                resetPosition();
                resetSpeed();
                resetScore();
                resetLives();
                resetDirection();
                resetFood();
                sounds.snakeDance.load();
              }, 1000);
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prevPosition;
          }
          if (newHead.x >= gamePadSize.width) newHead.x = 0;
          if (newHead.x < 0) newHead.x = gamePadSize.width - STEP;
          if (newHead.y >= gamePadSize.height) newHead.y = 0;
          if (newHead.y < 0) newHead.y = gamePadSize.height - STEP;
          newHead.x = Math.floor(newHead.x / STEP) * STEP;
          newHead.y = Math.floor(newHead.y / STEP) * STEP;
          if (newHead.x === food.x && newHead.y === food.y) {
            setFood(generateRandomFood());
            scoreIncrement();
            speedIncrement();
            if (sound) {
              sounds.eatingFood.play();
            }
            return [newHead, ...prevPosition];
          }
          return [newHead, ...prevPosition.slice(0, -1)];
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [move, direction, gamePadSize, food, speed, lives]);

  return (
    <div
      id="App"
      className="bg-background w-lvw h-dvh grid grid-cols-12 grid-rows-12 z-10"
    >
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent className="overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>How to play the game :</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>
                If you are using devices with a keyboard, you can use the
                following keys to control the game :{" "}
              </strong>
              <br />- press{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                Enter
              </kbd>{" "}
              to start the game <br />- press{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                Space
              </kbd>{" "}
              to stops the game <br />- press{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                <i className="fa-solid fa-arrow-left"></i>
              </kbd>{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                <i className="fa-solid fa-arrow-up"></i>
              </kbd>{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                <i className="fa-solid fa-arrow-right"></i>
              </kbd>{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                <i className="fa-solid fa-arrow-down"></i>
              </kbd>{" "}
              to change the snake's direction <br />
              <br />
              <strong>If you are using any type of device : </strong>
              <br />- there is a control panel at the bottom of the screen to
              control the game.
            </AlertDialogDescription>
            <AlertDialogTitle>Brief description of the game :</AlertDialogTitle>
            <AlertDialogDescription>
              - You can change the game theme to one of three modes: Dark,
              Light, and System by clicking on the theme icon in the top left
              corner of the screen.
              <br /> - By clicking on the snake icon at the top right of the
              screen and selecting the desired color, you can change the color
              of the snake to any color you like. You can easily change the
              color of the snake to its original color anytime you like by
              clicking on the <i className="fa-solid fa-arrows-rotate"></i>{" "}
              icon.
              <br /> - You can mute the music by clicking on the{" "}
              <i className="fa-solid fa-volume-high"></i> icon and reconnect the
              music by clicking on the{" "}
              <i className="fa-solid fa-volume-xmark"></i> icon.
              <br /> - You can pause the game during play and then resume it at
              any time. The game will start again from the same point where it
              was stopped.
              <br />
              - Each time the snake eats a frog, 10 points will be added to your
              score. You can see your score in the top center of the screen.
              <br />
              - You can also see your highest score ever earned in the top right
              of the screen.
              <br /> - In this game, you have 3 lives, which are displayed in
              the upper left corner by the{" "}
              <i className="fa-solid fa-heart text-red-600"></i> icons, and you
              lose one of them every time the snake's head collides with its
              body.
              <br /> - After you lose your last life, the game will end and the
              game will start over from the beginning without refreshing the web
              page.
              <br />- If you close this web page and return to it later, you
              will see that your snake color and page theme are the same as the
              snake color and page theme you last selected. <br />
              <br />
              <strong>Important note: </strong> <br />- Don't worry about the
              snake's head hitting the wall while playing the game, because it
              won't defeat you. Rather, the snake's head will enter from the
              opposite side of the wall from which it exits, and this can be
              repeated every time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={started}>I Realized</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        id="navbar"
        className=" row-start-1 row-end-2 col-start-2 col-end-12 flex items-center justify-between"
      >
        <ModeToggle />
        {sound ? (
          <i
            className="fa-solid fa-volume-high cursor-pointer mr-20 sm:mr-0"
            title="Click to mute"
            onClick={() => setSound(false)}
          ></i>
        ) : (
          <i
            className="fa-solid fa-volume-xmark cursor-pointer mr-20 sm:mr-0"
            title="Click to connect audio"
            onClick={() => setSound(true)}
          ></i>
        )}
        <i
          className="fa-solid fa-arrows-rotate cursor-pointer"
          title="Click to return the snake color to its default state"
          onClick={resetSnakeColor}
        ></i>
        <ColorChanger className="cursor-pointer w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]" />
      </div>
      <div
        id="score_board"
        className="row-start-2 row-end-3 col-start-2 col-end-12 text-sm sm:text-base flex justify-between items-center font-black"
      >
        <div id="soul">
          {[...Array(lives)].map(() => (
            <i className="fa-solid fa-heart text-red-600"></i>
          ))}
        </div>
        <div id="score" className="sm:ml-20">
          score : {String(score)}
        </div>
        <div id="record">
          highest score record :
          {localStorage.getItem("record")
            ? localStorage.getItem("record")
            : INITIAL_SCORE}
        </div>
      </div>
      <div
        id="gamePad"
        ref={gamePadRef}
        className=" bg-card row-start-3 row-end-11 col-start-2 col-end-12 relative z-0 overflow-hidden ring-8 ring-zinc-400 dark:ring-zinc-600"
      >
        {position.map((pos: Position) => (
          <div
            id="snake"
            className="w-[20px] h-[20px] z-20 absolute"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              backgroundColor: `${snakeColor}`,
            }}
          ></div>
        ))}

        <i
          id="food"
          className="fa-solid fa-frog absolute w-[20px] h-[20px] text-green-400 animate-pulse"
          style={{
            left: `${food.x}px`,
            top: `${food.y}px`,
          }}
        ></i>
      </div>
      <div
        id="control_panel"
        className="row-start-11 row-end-13 col-start-5 col-end-9 grid grid-cols-3 grid-rows-3"
      >
        <div
          id="arrow_up"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-2 col-end-3 row-start-1 row-end-2 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection(DIRECTION.UP)}
        >
          <i className="fa-solid fa-circle-up"></i>
        </div>
        <div
          id="arrow_left"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-1 col-end-2 row-start-2 row-end-3 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection(DIRECTION.LEFT)}
        >
          <i className="fa-solid fa-circle-left"></i>
        </div>
        <div
          id="arrow_right"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-3 col-end-4 row-start-2 row-end-3 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection(DIRECTION.RIGHT)}
        >
          <i className="fa-solid fa-circle-right"></i>
        </div>
        <div
          id="arrow_down"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-2 col-end-3 row-start-3 row-end-4 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection(DIRECTION.DOWN)}
        >
          <i className="fa-solid fa-circle-down"></i>
        </div>
        <div
          id="pauseBtn"
          className=" col-start-2 col-end-3 row-start-2 row-end-3 flex justify-center items-center"
        >
          {move ? (
            <i
              className="fa-solid fa-pause cursor-pointer"
              title="Click to stops the game"
              onClick={() => setMove(false)}
            ></i>
          ) : (
            <i
              className="fa-solid fa-play cursor-pointer"
              title="Click to start the game"
              onClick={() => setMove(true)}
            ></i>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
