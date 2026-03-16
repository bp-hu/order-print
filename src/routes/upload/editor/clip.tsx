import { ClipLayout } from "@/typings";
import { cn, useUpdateEffect } from "@auix/utils";
import { CSSProperties, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

export function Clip({
  className,
  style,
  frameHeight,
  frameWidth,
  defaultClipTopPercent,
  onMove,
  layout,
  ratio,
  disabled,
}: {
  className?: string;
  style?: CSSProperties;
  frameHeight: number;
  frameWidth: number;
  layout: ClipLayout;
  ratio: number;
  disabled?: boolean;
  defaultClipTopPercent?: number;
  onMove?: (props: {
    clipTopPercent: number;
    clipHeightPercent: number;
  }) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: 0,
    y: (defaultClipTopPercent || 0) * frameHeight,
  });
  const { y: clipTop } = position;
  // const croppingWidth =  frameWidth;
  const croppingHeight =
    (layout === "horizontal" && ratio < 1) ||
    (layout === "vertical" && ratio >= 1)
      ? frameWidth * ratio
      : frameWidth / ratio;

  useEffect(() => {
    if (!frameHeight) {
      return;
    }
    onMove?.({
      clipTopPercent: clipTop / frameHeight,
      clipHeightPercent: croppingHeight / frameHeight,
    });
  }, [position, frameHeight]);

  // 切换布局时，重置位置
  useUpdateEffect(() => {
    setPosition({
      x: 0,
      y: 0,
    });
  }, [layout]);

  return (
    <div
      style={style}
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
      <Draggable
        axis="y"
        nodeRef={nodeRef}
        position={position}
        disabled={disabled}
        bounds={{
          top: 0,
          bottom: frameHeight - croppingHeight,
        }}
        onDrag={(_, data) => {
          setPosition({
            x: position.x,
            y: data.y,
          });
        }}
      >
        <div
          ref={nodeRef}
          style={
            {
              "--clip-height": `${croppingHeight}px`,
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
      </Draggable>
      <div
        style={
          {
            "--mask-height": `${frameHeight - clipTop - croppingHeight}px`,
          } as any
        }
        className="absolute bottom-0 left-0 w-full h-(--mask-height) bg-[#ffffff80]"
      />
    </div>
  );
}
