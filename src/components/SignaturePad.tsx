"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type SignaturePadProps = {
  value: string;
  onChange: (dataUrl: string) => void;
  height?: number;
};

export default function SignaturePad({
  value,
  onChange,
  height = 96,
}: SignaturePadProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value, mounted]);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    hasDrawnRef.current = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function end() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasDrawnRef.current) {
      onChange(canvas.toDataURL("image/png"));
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    onChange("");
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-orange-300 bg-white">
      <canvas
        ref={canvasRef}
        width={520}
        height={height * 2}
        style={{ height, width: "100%" }}
        className="touch-none cursor-crosshair rounded-t-lg"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="flex items-center justify-between rounded-b-lg border-t border-slate-200 bg-slate-50 px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {t("heightWork.signHere")}
        </span>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-orange-600"
        >
          <Eraser className="h-3 w-3" />
          {t("heightWork.clear")}
        </button>
      </div>
    </div>
  );
}