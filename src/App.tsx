import { useEffect, useRef, useCallback } from "react";
import "./App.css";
import ColorChanger from "./components/color-changer";
import { ModeToggle } from "./components/mode-toggle";
import useZustand from "./store/store.tsx";
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
  const STEP = 20;
  const {
    start,
    move,
    direction,
    speed,
    score,
    lives,
    position,
    food,
    gamePadSize,
    sound,
    snakeColor,
    setStartTrue,
    setMoveTrue,
    setMoveFalse,
    setSoundTrue,
    setSoundFalse,
    setDirection,
    setSpeedIncrement,
    setDefaultSpeed,
    setScoreIncrement,
    setDefaultScore,
    setLivesDecrement,
    setDefaultLives,
    setChangePosition,
    setDefaultPosition,
    setChangeFood,
    setGamePadSize,
  } = useZustand();

  const snakeDanceSong: HTMLAudioElement = new Audio(SNAKE_DANCE_SONG);
  const eatingFoodSong: HTMLAudioElement = new Audio(EATING_FOOD_SONG);
  const lifeLostSong: HTMLAudioElement = new Audio(LIFE_LOST_SONG);
  const gameOverSong: HTMLAudioElement = new Audio(GAME_OVER_SONG);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gamePadRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef(position); // ✅ ذخیره موقعیت آخرین فریم

  const updateRecord = useCallback((record: string | number) => {
    const storedRecord = localStorage.getItem("record");
    const bestRecord = storedRecord ? Number(storedRecord) : 0;
    if (Number(record) > bestRecord) {
      localStorage.setItem("record", String(record));
    }
  }, []);

  const changeDirection = useCallback(
    (newDirection: string) => {
      if (move) {
        if (
          (newDirection === "up" && direction !== "down") ||
          (newDirection === "down" && direction !== "up") ||
          (newDirection === "left" && direction !== "right") ||
          (newDirection === "right" && direction !== "left")
        ) {
          setDirection(newDirection);
        }
      }
    },
    [move, direction]
  );

  /** بررسی یکنواخت بودن جهت حرکت مار */
  const isUniformDirection = useCallback(() => {
    const dx = position[1].x - position[0].x;
    const dy = position[1].y - position[0].y;
    return position.every((segment: any, index: any) => {
      if (index === 0) return true; // سر مار نیازی به بررسی ندارد
      const prevSegment = position[index - 1];
      return (
        segment.x - prevSegment.x === dx && segment.y - prevSegment.y === dy
      );
    });
  }, [position]);

  /** بررسی برخورد سر مار با بدن، با در نظر گرفتن یکنواختی حرکت */
  const isCollidingWithBody = useCallback(
    (head: { x: number; y: number }) => {
      if (isUniformDirection()) return false; // اگر مار کاملاً یکنواخت حرکت می‌کند، برخورد در نظر گرفته نمی‌شود
      return positionRef.current
        .slice(1)
        .some((segment: any) => segment.x === head.x && segment.y === head.y);
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
      // ✅ تراز کردن مختصات غذا
      x = Math.floor(x / STEP) * STEP;
      y = Math.floor(y / STEP) * STEP;
      isValidPosition =
        !position.some((pos: any) => pos.x === x && pos.y === y) &&
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
    if (!localStorage.getItem("snake-color"))
      localStorage.setItem("snake-color", snakeColor);
    window.addEventListener("resize", updateGamePadSize);
    return () => {
      window.removeEventListener("resize", updateGamePadSize);
    };
  }, []);

  useEffect(() => {
    positionRef.current = position; // ✅ آپدیت موقعیت مار در هر تغییر state
  }, [position]);

  useEffect(() => {
    if (move && sound) {
      snakeDanceSong.play();
      snakeDanceSong.loop = true;
    }
    return () => snakeDanceSong.pause();
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
        e.preventDefault(); // ✅ فقط برای کلیدهای مورد استفاده اعمال می‌شود
      }
      if (start && !move && e.code === "Enter") {
        setMoveTrue();
      } else {
        switch (e.code) {
          case "Space":
            if (move) setMoveFalse();
            break;
          case "ArrowUp":
            if (move && direction !== "down") setDirection("up");
            break;
          case "ArrowDown":
            if (move && direction !== "up") setDirection("down");
            break;
          case "ArrowRight":
            if (move && direction !== "left") setDirection("right");
            break;
          case "ArrowLeft":
            if (move && direction !== "right") setDirection("left");
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
        setChangePosition((prevPosition) => {
          let newHead = { ...prevPosition[0] };
          if (direction === "right") newHead.x += STEP;
          if (direction === "left") newHead.x -= STEP;
          if (direction === "down") newHead.y += STEP;
          if (direction === "up") newHead.y -= STEP;
          // ✅ جلوگیری از مشکلات ناهم‌ترازی
          newHead.x = Math.round(newHead.x / STEP) * STEP;
          newHead.y = Math.round(newHead.y / STEP) * STEP;
          if (isCollidingWithBody(newHead)) {
            if (lives > 1) {
              setLivesDecrement();
              setMoveFalse();
              if (sound) lifeLostSong.play();
              setTimeout(() => {
                setDefaultPosition();
                setDefaultSpeed();
                setDirection("right");
                setMoveTrue();
              }, 1000);
            } else {
              setDefaultLives();
              setMoveFalse();
              if (sound) gameOverSong.play();
              updateRecord(score);
              setTimeout(() => {
                setDefaultPosition();
                setDefaultSpeed();
                setDefaultScore();
                setDefaultLives();
                setDirection("right");
                setChangeFood({ x: 200, y: 200 });
                setMoveFalse();
              }, 1000);
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prevPosition;
          }
          // ✅ اصلاح ورود از مرز برای جلوگیری از برخورد اشتباه
          if (newHead.x >= gamePadSize.width) newHead.x = 0;
          if (newHead.x < 0) newHead.x = gamePadSize.width - STEP;
          if (newHead.y >= gamePadSize.height) newHead.y = 0;
          if (newHead.y < 0) newHead.y = gamePadSize.height - STEP;
          // ✅ تراز کردن مقادیر
          newHead.x = Math.floor(newHead.x / STEP) * STEP;
          newHead.y = Math.floor(newHead.y / STEP) * STEP;
          // بررسی خوردن غذا توسط مار
          if (newHead.x === food.x && newHead.y === food.y) {
            setChangeFood(generateRandomFood());
            setScoreIncrement();
            setSpeedIncrement();
            // پخش صدای خوردن غذا
            if (sound) eatingFoodSong.play();
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How to play the game :</AlertDialogTitle>
            <AlertDialogDescription>
              You can use the following keys to contorl the game: <br />- press{" "}
              <kbd className="bg-slate-200 rounded-[3px] border border-solid border-gray-500 shadow-inner inline-block font-bold leading-none py-[2px] px-1 whitespace-nowrap">
                Enter
              </kbd>{" "}
              to starts the game <br />- press{" "}
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
              <strong>Notes:</strong>
              <br />- screen touch users can use swapping to change the snake's
              direction <br />- there is a control panel provided on the bottom
              of the page to control the snake
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setStartTrue()}>
              Start game
            </AlertDialogAction>
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
            onClick={() => setSoundFalse()}
          ></i>
        ) : (
          <i
            className="fa-solid fa-volume-xmark cursor-pointer mr-20 sm:mr-0"
            onClick={() => setSoundTrue()}
          ></i>
        )}
        <ColorChanger className="cursor-pointer w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]" />
      </div>
      <div
        id="score_board"
        className="row-start-2 row-end-3 col-start-2 col-end-12 text-sm sm:text-base flex justify-between items-center font-black"
      >
        <div id="soul">
          {[...Array(lives)].map((_, index) => (
            <i key={index} className="fa-solid fa-heart text-red-600"></i>
          ))}
        </div>
        <div id="score" className="sm:ml-20">
          score : {String(score)}
        </div>
        <div id="record">
          highest score record :
          {localStorage.getItem("record") ? localStorage.getItem("record") : 0}
        </div>
      </div>
      <div
        id="gamePad"
        ref={gamePadRef}
        className=" bg-card row-start-3 row-end-11 col-start-2 col-end-12 relative z-0 overflow-hidden ring-8 ring-zinc-400 dark:ring-zinc-600"
      >
        {position.map((pos: any, index: any) => (
          <div
            id="snake"
            key={index}
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
          onClick={() => changeDirection("up")}
        >
          <i className="fa-solid fa-circle-up"></i>
        </div>
        <div
          id="arrow_left"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-1 col-end-2 row-start-2 row-end-3 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("left")}
        >
          <i className="fa-solid fa-circle-left"></i>
        </div>
        <div
          id="arrow_right"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-3 col-end-4 row-start-2 row-end-3 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("right")}
        >
          <i className="fa-solid fa-circle-right"></i>
        </div>
        <div
          id="arrow_down"
          className="bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-800 col-start-2 col-end-3 row-start-3 row-end-4 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("down")}
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
              onClick={() => setMoveFalse()}
            ></i>
          ) : (
            <i
              className="fa-solid fa-play cursor-pointer"
              onClick={() => setMoveTrue()}
            ></i>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// بررسی می کند که همیشه gamepadSize بر step بخشپذیر باشد
// const updateGamePadSize = () => {
//   if (gamePadRef.current) {
//     setGamePadSize({
//       width: Math.floor(gamePadRef.current.clientWidth / STEP) * STEP,
//       height: Math.floor(gamePadRef.current.clientHeight / STEP) * STEP,
//     });
//   }
// };

// const updateRecord = (record: string | number) => {
//   if (
//     localStorage.getItem("record") &&
//     Number(localStorage.getItem("record")) < Number(record)
//   ) {
//     localStorage.setItem("record", String(record));
//   } else {
//     localStorage.setItem("record", String(record));
//   }
// };

// useEffect(
//   () => setSnakeColor(localStorage.getItem("snak-color")),
//   [snakeColor]
// );
