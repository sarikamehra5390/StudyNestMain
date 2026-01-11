import { useEffect, useRef, useState } from "react";

export default function Pomodoro() {
  const [mode, setMode] = useState("pomodoro");
  const [time, setTime] = useState("25:00");
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef(null);
  const totalSecondsRef = useRef(0);

  /* 🔊 AUDIO REFS */
  const ambientSound = useRef(new Audio("/ambient.mp3"));
  const endSound = useRef(new Audio("/bell.mp3"));
  const clickSound = useRef(new Audio("/click.mp3"));

  const DURATIONS = {
    pomodoro: 25,
    short: 5,
    long: 10,
  };

  useEffect(() => {
    ambientSound.current.loop = true;
    ambientSound.current.volume = 0.25;
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(intervalRef.current);
  }, [mode]);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    ambientSound.current.pause();
    ambientSound.current.currentTime = 0;

    const mins = DURATIONS[mode];
    totalSecondsRef.current = mins * 60;
    setTime(`${mins}:00`);
    setProgress(0);
  };

  const startTimer = () => {
    clearInterval(intervalRef.current);
    clickSound.current.play();

    let remaining = DURATIONS[mode] * 60;
    totalSecondsRef.current = remaining;

    ambientSound.current.play();

    intervalRef.current = setInterval(() => {
      remaining--;

      setProgress(
        (1 - remaining / totalSecondsRef.current) * 100
      );

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        ambientSound.current.pause();
        endSound.current.play();
        setTime("00:00");
        setProgress(100);
        return;
      }

      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setTime(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
  };

  const stopTimer = () => {
    clickSound.current.play();
    clearInterval(intervalRef.current);
    ambientSound.current.pause();
    ambientSound.current.currentTime = 0;
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (progress / 100) * circumference;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Caprasimo", serif; 
        }

        body {
          margin: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          color: antiquewhite;
        }

        .bg-video {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -2;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: -1;
        }

        .wrapper {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 10;

          transform: translateY(16px); /* 👈 adjust 10–20px */
        }


        .timer-box {
          width: 600px;
        }

        h1 {
          font-size: 2.2rem;
          margin-bottom: 1.5rem;
        }

        .button-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 2rem;
        }

        .button {
          background: rgba(28, 34, 68, 0.7);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }

        .button.active {
          background: #1c2244;
        }

        .circle-wrapper {
          position: relative;
          width: 320px;
          height: 320px;
          margin: 0 auto 2rem;
        }

        .circle-bg {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(30, 33, 63, 0.65);
          box-shadow: 20px 20px 47px #0e2021,
                      -20px -20px 47px #1c2244;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          z-index: 2;
        }

        svg {
          position: absolute;
          inset: 0;
          transform: rotate(-90deg);
          z-index: 3;
        }

        circle {
          fill: none;
          stroke-width: 10;
        }

        .circle-track {
          stroke: rgba(255, 255, 255, 0.15);
        }

        .circle-progress {
          stroke: antiquewhite;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s linear;
        }

        .controls button {
          margin: 0 10px;
          padding: 10px 22px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background: rgba(28, 34, 68, 0.7);
          color: white;
        }

        .controls button:hover:first-child {
          background: rgba(16, 119, 31, 0.8);
        }

        .controls button:hover:last-child {
          background: rgba(146, 18, 18, 0.8);
        }

        @media (max-width: 640px) {
          .timer-box {
            width: 100%;
          }
        }
      `}</style>

      {/* BACKGROUND VIDEO */}
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div className="overlay"></div>

      {/* UI */}
      <div className="wrapper">
        <div className="timer-box">
          <h1>Pomodoro Timer</h1>

          <div className="button-container">
            {["pomodoro", "short", "long"].map((item) => (
              <button
                key={item}
                className={`button ${mode === item ? "active" : ""}`}
                onClick={() => {
                  clickSound.current.play();
                  setMode(item);
                }}
              >
                {item === "pomodoro"
                  ? "Pomodoro"
                  : item === "short"
                  ? "Short Break"
                  : "Long Break"}
              </button>
            ))}
          </div>

          <div className="circle-wrapper">
            <svg width="320" height="320">
              <circle
                className="circle-track"
                cx="160"
                cy="160"
                r={radius}
              />
              <circle
                className="circle-progress"
                cx="160"
                cy="160"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>

            <div className="circle-bg">{time}</div>
          </div>

          <div className="controls">
            <button onClick={startTimer}>START</button>
            <button onClick={stopTimer}>STOP</button>
          </div>
        </div>
      </div>
    </>
  );
}
