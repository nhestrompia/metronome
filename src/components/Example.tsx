import React, { useEffect, useRef, useState } from "react";

interface IProps {}

const Example: React.FC<IProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream>();
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(0));
  const [currentAudioContext, setCurrentAudioContext] =
    useState<AudioContext>();
  const [drawingContext, setDrawingContext] =
    useState<CanvasRenderingContext2D>();

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current?.getContext("2d")!;

    if (canvasRef.current && analyser) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      setDrawingContext(context!);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      canvas.width = width;
      canvas.height = height;

      const updateCanvas = () => {
        if (!analyser) {
          return;
        }

        analyser.getByteTimeDomainData(dataArray);
        drawWaveform(
          drawingContext!,
          dataArray,
          canvasRef.current!.width,
          canvasRef.current!.height,
          currentAudioContext!.currentTime
        );
        animationFrameId = requestAnimationFrame(updateCanvas);
      };

      updateCanvas();

      // updateCanvas();
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, analyser, dataArray]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        setCurrentAudioContext(audioContext);
        const mediaStreamSource =
          audioContext.createMediaStreamSource(mediaStream);
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048; // increase FFT size for better resolution
        mediaStreamSource.connect(analyserNode);
        const bufferLength = analyserNode.frequencyBinCount;
        const newDataArray = new Uint8Array(bufferLength);
        setDataArray(newDataArray);
        setAnalyser(analyserNode);

        const recordingInterval = setInterval(() => {
          analyserNode.getByteTimeDomainData(newDataArray);
          setDataArray(newDataArray.slice(-44100 / 4)); // keep last 4 seconds of data
        }, 250);

        // setRecordingInterval(recordingInterval);
      })
      .catch((error) => {
        console.error("Failed to get user media:", error);
      });
  };

  const stopRecording = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(undefined);
      setAnalyser(undefined);
    }
  };

  // const drawWaveform = (
  //   context: CanvasRenderingContext2D,
  //   dataArray: Uint8Array,
  //   width: number,
  //   height: number
  // ) => {
  //   context.beginPath();
  //   context.strokeStyle = "black";
  //   context.lineWidth = 2;

  //   const sliceWidth = width / dataArray.length;
  //   let x = 0;

  //   // for (let i = 0; i < dataArray.length; i++) {
  //   //   const v = dataArray[i]! / 128.0;
  //   //   const y = (v * height) / 2;

  //   //   if (i === 0) {
  //   //     context.moveTo(x, y);
  //   //   } else {
  //   //     context.lineTo(x, y);
  //   //   }

  //   //   x += sliceWidth;
  //   // }
  //   for (let i = 0; i < width; i += sliceWidth) {
  //     const dataIndex = dataArray.length - (4 * audioContext.sampleRate) + Math.round(i * (dataArray.length / width));
  //     const v = dataArray[dataIndex]! / 128.0;
  //     const y = (v * height) / 2;

  //     if (i === 0) {
  //       context.moveTo(i, y);
  //     } else {
  //       context.lineTo(i, y);
  //     }
  //   }

  //   context.stroke();
  // };
  const drawWaveform = (
    context: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    currentTime: number
  ) => {
    if (context) {
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 2;

      const sliceWidth = width / dataArray.length;
      let x = 0;

      const startIndex = Math.max(
        0,
        dataArray.length - Math.ceil(currentTime * 100)
      );
      for (let i = startIndex; i < dataArray.length; i++) {
        const v = dataArray[i]! / 128.0;
        const y = (v * height) / 2;

        if (i === startIndex) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }

        x += sliceWidth;
      }

      context.stroke();
    }
  };

  return (
    <div>
      <canvas
        className="w-44 border border-black"
        width={250}
        height={480}
        ref={canvasRef}
      />
      <div className="flex justify-center">
        <button
          className="m-2 rounded border border-black p-2"
          onClick={startRecording}
        >
          Start Recording
        </button>
        <button
          className="m-2 rounded border border-black p-2"
          onClick={stopRecording}
        >
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default Example;
