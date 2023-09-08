import { useEffect, useRef, useState } from "react";

type Size = {
  width: number;
  height: number;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const NUM_PARTICLES = 50; // 파티클 개수

  // 캔버스 크기 조절 및 초기화
  useEffect(() => {
    //context 처리
    handleResize();
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    setCtx(context);
    // while ( > NUM_PARTICLES) {

    // }
  }, [NUM_PARTICLES]);

  // 화면 리사이즈 이벤트 핸들러
  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    // 화면 resize 처리
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return <canvas ref={canvasRef} width={size.width} height={size.height}></canvas>;
}

export default App;
