import { ClipLayout } from "@/typings";
import { cn, useDebounceFn, useUpdateEffect } from "@auix/utils";
import { CSSProperties, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

export function Clip({
  className,
  style,
  frameHeight,
  frameWidth,
  defaultClipPosPercent,
  onMove,
  layout,
  paperRatio,
  imageRatio,
  disabled,
}: {
  className?: string;
  style?: CSSProperties;
  frameHeight: number;
  frameWidth: number;
  layout: ClipLayout;
  paperRatio: number;
  imageRatio: number;
  disabled?: boolean;
  defaultClipPosPercent?: [number, number];
  onMove: (props: {
    clipTopPercent: number;
    clipLeftPercent: number;
    clipHeightPercent: number;
    clipWidthPercent: number;
  }) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: (defaultClipPosPercent?.[0] || 0) * frameWidth,
    y: (defaultClipPosPercent?.[1] || 0) * frameHeight,
  });

  const { x: clipLeft, y: clipTop } = position;
  // 相对于 paper，照片是纵向的还是横向的
  const isVertical = imageRatio <= paperRatio;
  let croppingWidth = 0;
  let croppingHeight = 0;

  // 纵向裁剪
  if (isVertical) {
    croppingWidth = frameWidth;
    croppingHeight =
      layout === "vertical"
        ? paperRatio < 1
          ? croppingWidth / paperRatio
          : croppingWidth * paperRatio
        : paperRatio < 1
          ? croppingWidth * paperRatio
          : croppingWidth / paperRatio;
  } else {
    // 横向裁剪
    croppingHeight = frameHeight;
    croppingWidth =
      layout === "vertical"
        ? paperRatio < 1
          ? croppingHeight * paperRatio
          : croppingHeight / paperRatio
        : paperRatio < 1
          ? croppingHeight / paperRatio
          : croppingHeight * paperRatio;
  }

  const { run: debounceOnMove } = useDebounceFn(onMove, 300);

  useEffect(() => {
    if (!frameHeight) {
      return;
    }
    debounceOnMove?.({
      clipTopPercent: clipTop / frameHeight,
      clipLeftPercent: clipLeft / frameWidth,
      clipHeightPercent: croppingHeight / frameHeight,
      clipWidthPercent: croppingWidth / frameWidth,
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
            "--mask-width": `${clipLeft}px`,
          } as any
        }
        className={cn("absolute top-0 left-0 bg-[#ffffff80]", {
          "w-full h-(--mask-height)": isVertical,
          "w-(--mask-width) h-full": !isVertical,
        })}
      />
      <Draggable
        axis={isVertical ? "y" : "x"}
        nodeRef={nodeRef}
        position={position}
        disabled={disabled}
        bounds={
          isVertical
            ? {
                top: 0,
                bottom: frameHeight - croppingHeight,
              }
            : {
                left: 0,
                right: frameWidth - croppingWidth,
              }
        }
        onDrag={(_, data) => {
          setPosition({
            x: isVertical ? position.x : data.x,
            y: isVertical ? data.y : position.y,
          });
        }}
      >
        <div
          ref={nodeRef}
          style={
            {
              "--clip-height": `${croppingHeight}px`,
              "--clip-width": `${croppingWidth}px`,
            } as any
          }
          className={cn("relative", {
            "w-full h-(--clip-height)": isVertical,
            "w-(--clip-width) h-full": !isVertical,
          })}
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
            "--mask-width": `${frameWidth - clipLeft - croppingWidth}px`,
          } as any
        }
        className={cn("absolute bg-[#ffffff80]", {
          "w-full h-(--mask-height) bottom-0 left-0": isVertical,
          "w-(--mask-width) h-full right-0 top-0": !isVertical,
        })}
      />
    </div>
  );
}
