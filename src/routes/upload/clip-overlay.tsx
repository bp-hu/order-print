import { cn } from "@auix/utils";
import { useEffect, useRef, useState } from "react";

export function ClipOverlay({
  className,
  clipTopPercent,
  clipHeightPercent,
}: {
  className?: string;
  clipTopPercent: number;
  clipHeightPercent: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    }, 500);
  }, []);

  const clipTop = clipTopPercent * containerHeight;
  const clipHeight = clipHeightPercent * containerHeight;

  return (
    <div
      ref={containerRef}
      className={cn("absolute top-0 left-0 w-full h-full", className)}
    >
      <div
        style={
          {
            "--mask-height": `${clipTop}px`,
          } as any
        }
        className="absolute top-0 left-0 w-full h-(--mask-height) bg-[#ffffff80]"
      />
      <div
        style={
          {
            "--clip-top": `${clipTop}px`,
          } as any
        }
        className="absolute top-(--clip-top) left-0 w-full"
      >
        <div
          style={
            {
              "--clip-height": `${clipHeight}px`,
            } as any
          }
          className="relative w-full h-(--clip-height)"
        >
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              style={{
                top: 0,
                left: `${(index + 1) * 33.33}%`,
              }}
              className="absolute border-l border-dashed border-[white] h-full"
            />
          ))}
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              style={{
                left: 0,
                top: `${(index + 1) * 33.33}%`,
              }}
              className="absolute border-t border-dashed border-[white] w-full"
            />
          ))}
        </div>
      </div>
      <div
        style={
          {
            "--mask-height": `${containerHeight - clipTop - clipHeight}px`,
          } as any
        }
        className="absolute bottom-0 left-0 w-full h-(--mask-height) bg-[#ffffff80]"
      />
    </div>
  );
}
