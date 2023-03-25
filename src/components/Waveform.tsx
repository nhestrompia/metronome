import React, { useEffect, useRef, useState } from "react";

interface IProps {
  // ... any props you need
}

const Waveform: React.FC<IProps> = (
  {
    /* ...props */
  }
) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] =
    useState<MediaStreamAudioSourceNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const handleSuccess = (stream: MediaStream) => {
      setStream(stream);
      setAudioCtx(new AudioContext());
    };

    const handleError = (error: Error) => {
      console.log("navigator.getUserMedia error: ", error);
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(handleSuccess)
      .catch(handleError);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (audioCtx && stream) {
      setSourceNode(audioCtx.createMediaStreamSource(stream));
    }
  }, [audioCtx, stream]);

  useEffect(() => {
    if (sourceNode && !analyserNode) {
      const graphNode = audioCtx!.createAnalyser();
      graphNode.fftSize = 2048;
      graphNode.smoothingTimeConstant = 0;
      setAnalyserNode(graphNode);
      sourceNode.connect(graphNode);
    }

    return () => {
      if (sourceNode && analyserNode) {
        sourceNode.disconnect(analyserNode);
      }
    };
  }, [audioCtx, sourceNode, analyserNode]);

  useEffect(() => {
    if (audioCtx && sourceNode && analyserNode) {
      // Set up the canvas
      console.log("adsad");
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;
          const signalCount = 1;
          const barCount = 100;
          const barWidth = 1;
          const barSpacing = 0;
          const data = new Float32Array(analyserNode.fftSize);
          analyserNode.fftSize = 2048;
          analyserNode.smoothingTimeConstant = 0;

          let signals: any[] = [];
          for (let i = 0; i < signalCount; i++) {
            signals[i] = {
              values: new Uint8Array(barCount),
              color: `hsl(${(i * 360) / signalCount}, 100%, 50%)`,
            };
          }

          function draw() {
            requestAnimationFrame(draw);
            analyserNode!.getFloatTimeDomainData(data);
            const sliceWidth = WIDTH / barCount;
            const xStart = WIDTH - barCount * sliceWidth;
            ctx!.clearRect(0, 0, WIDTH, HEIGHT);
            ctx!.beginPath();

            for (let i = 0; i < signals.length; i++) {
              const signal = signals[i];
              signal.values.set(
                new Uint8Array(data.subarray(i * barCount, (i + 1) * barCount))
              );

              // shift the previous values to the left
              signal.values.copyWithin(0, 1);

              // add the latest value
              signal.values[signal.values.length - 1] =
                (signal.values[signal.values.length - 2] +
                  signal.values[signal.values.length - 1]) /
                2;

              // draw the bars
              ctx!.strokeStyle = signal.color;
              ctx!.lineWidth = barWidth;
              ctx!.beginPath();
              ctx!.strokeStyle = "black";
              let x = xStart;
              for (let j = 0; j < barCount; j++) {
                const y =
                  HEIGHT - (signal.values[j] / 255) * HEIGHT - barWidth / 2;
                if (j === 0) {
                  ctx!.moveTo(x, y);
                } else {
                  ctx!.lineTo(x, y);
                }
                x += sliceWidth + barSpacing;
              }
              ctx!.stroke();
            }
          }

          draw();
          analyserNode.connect(audioCtx.destination);
        }
      }
    }
  }, [audioCtx, sourceNode, analyserNode]);

  // ...
  console.log("recorded", recordedChunks);
  const startRecording = () => {
    setRecordedChunks([]);
    setRecorder(new MediaRecorder(stream!));
    analyserNode?.connect(audioCtx?.destination!);
    if (recorder) {
      recorder!.start();
      recorder!.addEventListener("dataavailable", (e: any) => {
        setRecordedChunks((prevChunks) => [...prevChunks, e.data]);
      });
      recorder!.addEventListener("stop", () => {
        setRecording(false);
      });
      setRecording(true);
    }
  };

  const stopRecording = () => {
    recorder!.stop();
    setRecording(false);
  };

  const playRecording = () => {
    const audioBlob = new Blob(recordedChunks, {
      type: "audio/ogg; codecs=opus",
    });
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
  };

  const downloadRecording = () => {
    const url = URL.createObjectURL(new Blob(recordedChunks));
    const link = document.createElement("a");
    link.href = url;
    link.download = "recording.webm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <canvas className="bg-blue-50" ref={canvasRef} width={800} height={200} />
      <div>
        <button onClick={downloadRecording}>Download Recording</button>
        {recording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
        <button onClick={playRecording}>Play Recording</button>
      </div>
    </div>
  );
};

export default Waveform;
