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
    // Set up microphone input
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setStream(stream);
        setAudioCtx(new AudioContext());
      })
      .catch((err) => {
        console.log("Error setting up audio input: ", err);
      });
  }, []);

  useEffect(() => {
    if (audioCtx && stream) {
      try {
        setSourceNode(audioCtx.createMediaStreamSource(stream));
      } catch (err) {
        console.log("Error setting up source node: ", err);
      }
    }
  }, [audioCtx, stream]);

  useEffect(() => {
    if (sourceNode && analyserNode) {
      try {
        const graphNode = audioCtx!.createAnalyser();
        setAnalyserNode(graphNode);
        sourceNode.connect(graphNode);
      } catch (err) {
        console.log("Error setting up analyser node: ", err);
      }
    }
  }, [sourceNode, analyserNode]);

  // useEffect(() => {
  //   if (audioCtx && sourceNode && analyserNode) {
  //     // Set up the canvas
  //     const canvas = canvasRef.current;
  //     if (canvas) {
  //       const ctx = canvas.getContext("2d");
  //       if (ctx) {
  //         const barCount = 100;
  //         const barWidth = canvas.width / barCount;
  //         const barSpacing = 1;
  //         const data = new Float32Array(analyserNode.fftSize);
  //         analyserNode.fftSize = 2048;
  //         analyserNode.smoothingTimeConstant = 0;

  //         function draw() {
  //           requestAnimationFrame(draw);
  //           // analyserNode!.getByteFrequencyData(data);
  //           analyserNode?.getFloatTimeDomainData(data);
  //           ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
  //           ctx!.beginPath();
  //           ctx!.strokeStyle = "black";
  //           ctx!.lineWidth = 1;
  //           for (let i = 0; i < barCount; i++) {
  //             const x = i * (barWidth + barSpacing);
  //             const y =
  //               canvas!.height / 2 - ((data[i]! / 256) * canvas!.height) / 2;
  //             ctx!.lineTo(x, y);
  //           }
  //           ctx!.stroke();
  //         }
  //         // function draw() {
  //         //   requestAnimationFrame(draw);
  //         //   analyserNode?.getFloatTimeDomainData(data);
  //         //   ctx?.clearRect(0, 0, canvas!.width, canvas!.height);
  //         //   ctx?.beginPath();
  //         //   ctx!.lineWidth = 1;
  //         //   ctx!.strokeStyle = "black";
  //         //   let x = 0;
  //         //   const sliceWidth = canvas!.width / data.length;
  //         //   for (let i = 0; i < data.length; i++) {
  //         //     const y = canvas!.height / 2 - ((data[i]! / 256) * canvas!.height) / 2;
  //         //     if (i === 0) {
  //         //       ctx?.moveTo(x, y);
  //         //     } else {
  //         //       ctx?.lineTo(x, y);
  //         //     }
  //         //     x += sliceWidth;
  //         //   }
  //         //   ctx?.stroke();
  //         // }
  //         draw();
  //       }
  //     }
  //   }
  // }, [audioCtx, sourceNode, analyserNode]);

  useEffect(() => {
    if (audioCtx && sourceNode && analyserNode) {
      // Set up the canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;
          const barCount = 100;
          const barWidth = 1;
          const barSpacing = 0;
          const data = new Float32Array(analyserNode.fftSize);
          analyserNode.fftSize = 2048;
          analyserNode.smoothingTimeConstant = 0;

          let xPos = 0;

          function draw() {
            requestAnimationFrame(draw);
            analyserNode!.getFloatTimeDomainData(data);
            ctx!.clearRect(0, 0, WIDTH, HEIGHT);
            ctx!.beginPath();
            ctx!.moveTo(xPos, HEIGHT / 2);

            for (let i = 0; i < barCount; i++) {
              const y = HEIGHT / 2 - ((data[i]! / 256) * HEIGHT) / 2;
              ctx!.lineTo(xPos + i * (barWidth + barSpacing), y);
            }

            ctx!.lineWidth = 1;
            ctx!.strokeStyle = "#000000";
            ctx!.stroke();

            xPos += barCount * (barWidth + barSpacing);
            if (xPos > WIDTH) {
              xPos = 0;
            }
          }
          draw();
        }
      }
    }
  }, [audioCtx, sourceNode, analyserNode]);

  // ...

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
        {recording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
        <button onClick={downloadRecording}>Download Recording</button>
      </div>
    </div>
  );
};

export default Waveform;
