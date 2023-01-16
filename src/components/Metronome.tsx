import React, { useState, useEffect } from "react";
import { ReactMic } from "react-mic";

const Metronome: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [isShow, setIsShow] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(
    undefined
  );

  const startRecording = () => {
    // setIsShow(true);
    clearInterval(intervalId);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playSound = () => {
    const tempo = 60 / bpm;

    const measureLength = 4 * tempo;

    const soundLength = 0.2;

    const numberOfClick = Math.floor(measureLength / soundLength);
  };

  useEffect(() => {
    if (isRecording) {
      setIntervalId(
        setInterval(() => {
          const src = "/click.wav";
          new Audio(src).play();
        }, (60 / bpm) * 1000)
      );
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [bpm, isRecording]);

  const increaseSpeed = () => {
    setBpm((prevState: number) => prevState + 1);
  };

  const decreaseSpeed = () => {
    setBpm((prevState: number) => prevState - 1);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(parseInt(event.target.value));
  };

  return (
    <div className="grid w-full grid-cols-2 grid-rows-2 items-center justify-center ">
      <div className="relative left-80 col-start-1 row-start-1 flex items-center justify-center">
        {/*    */}
      </div>

      <div className="relative top-24 left-80 col-start-1 row-start-2 flex flex-row items-center justify-center   gap-4">
        <input
          type="text"
          placeholder="90"
          onChange={onChange}
          required
          value={bpm}
          className="w-16 bg-transparent font-montserrat text-4xl text-white focus:outline-none"
        />
        <button
          onClick={increaseSpeed}
          className="h-16 w-14  rounded-xl bg-[#1E293B]  px-3 py-2 font-montserrat  text-5xl text-white hover:shadow-lg"
        >
          +
        </button>
        <button
          onClick={decreaseSpeed}
          className="flex h-16  w-14 items-center justify-center rounded-xl bg-[#1E293B] px-3 py-2.5 text-center text-white   hover:shadow-lg"
        >
          <span className="h-fit pb-2 font-montserrat text-7xl">-</span>
        </button>
      </div>
      <div
        className=" relative left-24 bottom-12 col-start-2 row-span-2 row-start-1 flex
      flex-col content-center items-center justify-center  gap-4"
      >
        {isRecording ? (
          <button
            className="  rounded-xl bg-[#1E293B] px-5 py-3 font-montserrat text-xl tracking-widest text-white hover:shadow-lg "
            onClick={stopRecording}
          >
            Stop
          </button>
        ) : (
          <button
            className=" rounded-xl bg-[#1E293B] px-[22px] py-3 font-montserrat text-xl tracking-widest text-white hover:shadow-lg"
            onClick={startRecording}
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
};

export default Metronome;
