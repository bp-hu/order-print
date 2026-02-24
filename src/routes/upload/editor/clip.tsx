import { cn } from "@auix/utils";
import { CSSProperties, RefObject, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

export function Clip({
  className,
  style,
  frameHeight,
  frameWidth,
  layout = "horizontal",
  imageRef,
  ratio,
}: {
  className?: string;
  style?: CSSProperties;
  frameHeight: number;
  frameWidth: number;
  layout?: "horizontal" | "vertical";
  imageRef: RefObject<HTMLImageElement>;
  ratio: number;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [clipSize, setClipSize] = useState({
    width: 0,
    height: 0,
  });
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const { y: clipTop } = position;

  useEffect(() => {
    if (!imageRef.current) {
      return;
    }
    const { naturalWidth: width, naturalHeight: height } = imageRef.current;
    if (layout === "horizontal") {
      const clipHeight = frameWidth * ratio;
      setClipSize({
        width: (clipHeight / height) * width,
        height: clipHeight,
      });
    } else {
      const clipWidth = frameHeight * ratio;
      setClipSize({
        width: clipWidth,
        height: (clipWidth / width) * height,
      });
    }
  }, [imageRef, layout, frameHeight, frameWidth, ratio]);

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
        bounds={{
          top: 0,
          bottom: frameHeight - clipSize.height,
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
              "--clip-height": `${clipSize.height}px`,
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
            "--mask-height": `${frameHeight - clipTop - clipSize.height}px`,
          } as any
        }
        className="absolute bottom-0 left-0 w-full h-(--mask-height) bg-[#ffffff80]"
      />
    </div>
  );
}
