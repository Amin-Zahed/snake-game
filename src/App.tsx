import { useEffect, useState, useRef } from "react";
import "./App.css";
import SnakeIcon from "./components/snake-icon";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const STEP = 20;
  const INITIAL_SPEED = 150;
  const SPEED_INCREMENT = 10;
  const INITIAL_LIVES = 3;
  const INITIAL_POSITION = [
    { x: 160, y: 160 },
    { x: 140, y: 160 },
    { x: 120, y: 160 },
    { x: 100, y: 160 },
    { x: 80, y: 160 },
  ];

  const [move, setMove] = useState(false);
  const [direction, setDirection] = useState("right");
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [food, setFood] = useState({ x: 200, y: 200 });
  const [gamePadSize, setGamePadSize] = useState({ width: 0, height: 0 });
  const [voice, setVoice] = useState(true);

  const counterRef = useRef<NodeJS.Timeout | null>(null);
  const gamePadRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef(position); // ✅ ذخیره موقعیت آخرین فریم

  useEffect(() => {
    positionRef.current = position; // ✅ آپدیت موقعیت مار در هر تغییر state
  }, [position]);

  const updateRecord = (record: string | number) => {
    const storedRecord = localStorage.getItem("record");
    const bestRecord = storedRecord ? Number(storedRecord) : 0;

    if (Number(record) > bestRecord) {
      localStorage.setItem("record", String(record));
    }
  };

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
    localStorage.setItem("snake-color", "#a21caf");
    window.addEventListener("resize", updateGamePadSize);
    return () => {
      window.removeEventListener("resize", updateGamePadSize);
    };
  }, []);

  const generateRandomFood = () => {
    if (gamePadSize.width === 0 || gamePadSize.height === 0)
      return { x: 0, y: 0 };
    const maxX = Math.floor(gamePadSize.width / STEP) * STEP;
    const maxY = Math.floor(gamePadSize.height / STEP) * STEP;
    let x: any,
      y: any,
      isValidPosition = false;
    while (!isValidPosition) {
      x = Math.floor(Math.random() * (maxX / STEP)) * STEP;
      y = Math.floor(Math.random() * (maxY / STEP)) * STEP;
      // ✅ تراز کردن مختصات غذا
      x = Math.floor(x / STEP) * STEP;
      y = Math.floor(y / STEP) * STEP;
      isValidPosition =
        !position.some((pos) => pos.x === x && pos.y === y) &&
        !(x === food.x && y === food.y);
    }
    return { x, y };
  };

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
      if (!move && e.code === "Enter") {
        setMove(true);
      } else {
        switch (e.code) {
          case "Space":
            if (move) setMove(false);
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
  }, [move, direction]);

  const changeDirection = (newDirection: string) => {
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
  };

  /** بررسی یکنواخت بودن جهت حرکت مار */
  const isUniformDirection = () => {
    const dx = position[1].x - position[0].x;
    const dy = position[1].y - position[0].y;
    return position.every((segment, index) => {
      if (index === 0) return true; // سر مار نیازی به بررسی ندارد
      const prevSegment = position[index - 1];
      return (
        segment.x - prevSegment.x === dx && segment.y - prevSegment.y === dy
      );
    });
  };

  /** بررسی برخورد سر مار با بدن، با در نظر گرفتن یکنواختی حرکت */
  const isCollidingWithBody = (head: { x: number; y: number }) => {
    if (isUniformDirection()) return false; // اگر مار کاملاً یکنواخت حرکت می‌کند، برخورد در نظر گرفته نمی‌شود
    return positionRef.current
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y);
  };

  useEffect(() => {
    if (move) {
      counterRef.current = setInterval(() => {
        setPosition((prevPosition) => {
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
              setLives((prevLives) => prevLives - 1);
              setMove(false);
              setTimeout(() => {
                setPosition(INITIAL_POSITION);
                setSpeed(INITIAL_SPEED);
                setDirection("right");
                setMove(true);
              }, 1000);
            } else {
              setLives(0);
              setMove(false);
              updateRecord(score);
              setTimeout(() => {
                setPosition(INITIAL_POSITION);
                setSpeed(INITIAL_SPEED);
                setScore(0);
                setLives(INITIAL_LIVES);
                setDirection("right");
                setFood({ x: 200, y: 200 });
                setMove(false);
              }, 1000);
            }
            if (counterRef.current) clearInterval(counterRef.current);
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

          if (newHead.x === food.x && newHead.y === food.y) {
            setFood(generateRandomFood());
            setScore((prevScore) => prevScore + 10);
            setSpeed((prevSpeed) => Math.max(50, prevSpeed - SPEED_INCREMENT));
            return [newHead, ...prevPosition];
          }
          return [newHead, ...prevPosition.slice(0, -1)];
        });
      }, speed);
    }
    return () => {
      if (counterRef.current) clearInterval(counterRef.current);
    };
  }, [move, direction, gamePadSize, food, speed, lives]);

  return (
    <div
      id="App"
      className="bg-zinc-300 w-lvw h-dvh grid grid-cols-12 grid-rows-12 z-10"
    >
      <div
        id="navbar"
        className=" row-start-1 row-end-2 col-start-2 col-end-12 flex items-center justify-between"
      >
        <ModeToggle />
        {voice ? (
          <i
            className="fa-solid fa-volume-high cursor-pointer mr-20 sm:mr-0"
            onClick={() => setVoice(false)}
          ></i>
        ) : (
          <i
            className="fa-solid fa-volume-xmark cursor-pointer mr-20 sm:mr-0"
            onClick={() => setVoice(true)}
          ></i>
        )}
        <SnakeIcon className="cursor-pointer" />
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
        className="bg-slate-700 row-start-3 row-end-11 col-start-2 col-end-12 relative z-0 overflow-hidden ring-8 ring-black"
      >
        {position.map((pos, index) => (
          <div
            id="snake"
            key={index}
            className="bg-fuchsia-700 w-[20px] h-[20px] z-20 absolute"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
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
        id="control_keys"
        className="row-start-11 row-end-13 col-start-5 col-end-9 grid grid-cols-3 grid-rows-3"
      >
        <div
          id="arrow_up"
          className="bg-zinc-200 hover:bg-zinc-400 col-start-2 col-end-3 row-start-1 row-end-2 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("up")}
        >
          <i className="fa-solid fa-circle-up"></i>
        </div>
        <div
          id="arrow_left"
          className="bg-zinc-200 hover:bg-zinc-400 col-start-1 col-end-2 row-start-2 row-end-3 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("left")}
        >
          <i className="fa-solid fa-circle-left"></i>
        </div>
        <div
          id="arrow_right"
          className="bg-zinc-200 hover:bg-zinc-400 col-start-3 col-end-4 row-start-2 row-end-3 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("right")}
        >
          <i className="fa-solid fa-circle-right"></i>
        </div>
        <div
          id="arrow_down"
          className="bg-zinc-200 hover:bg-zinc-400 col-start-2 col-end-3 row-start-3 row-end-4 flex justify-center items-center cursor-pointer"
          onClick={() => changeDirection("down")}
        >
          <i className="fa-solid fa-circle-down"></i>
        </div>
        <div
          id="pauseBtn"
          className=" col-start-2 col-end-3 row-start-2 row-end-3 flex justify-center items-center"
          onClick={() => changeDirection("down")}
        >
          {move ? (
            <i
              className="fa-solid fa-pause cursor-pointer"
              onClick={() => setMove(false)}
            ></i>
          ) : (
            <i
              className="fa-solid fa-play cursor-pointer"
              onClick={() => setMove(true)}
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
