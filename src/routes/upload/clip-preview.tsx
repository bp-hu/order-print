import type { ClipLayout, ClipType } from "@/typings";
import { getClipSize } from "@/utils";
import { cn } from "@auix/utils";
import { Image } from "@douyinfe/semi-ui";
import { ReactNode, useEffect, useState } from "react";
import { ClipOverlay } from "./clip-overlay";

export const ClipPreview = ({
  paperRatio,
  clipType,
  layout = "horizontal",
  src,
  size = [400, 400],
  ready = false,
  className,
  frameClassName,
  rotate = 0,
  children,
  imageSize,
  clipPosPercent,
  clipSizePercent,
}: {
  paperRatio: number;
  src: string;
  clipType?: ClipType;
  clipPosPercent?: [number, number];
  clipSizePercent?: [number, number];
  layout?: ClipLayout;
  size?: [number, number];
  imageSize: [number, number];
  ready: boolean;
  className?: string;
  frameClassName?: string;
  rotate?: number;
  children?:
    | ReactNode
    | ((props: {
        frameWidth: number;
        frameHeight: number;
        imageWidth: number;
        imageHeight: number;
        paperRatio: number;
        layout: ClipLayout;
      }) => ReactNode);
}) => {
  const isHorizontal = layout === "horizontal";
  const isVertical = layout === "vertical";
  const [containerWidth, containerHeight] = size;
  const [clipSize, setClipSize] = useState({
    frameWidth: 0,
    frameHeight: 0,
    imageWidth: 0,
    imageHeight: 0,
  });
  const [inited, setInited] = useState(false);

  useEffect(() => {
    if (ready && layout) {
      setClipSize(
        getClipSize({
          layout,
          containerSize: size,
          imageSize,
          paperRatio,
          isAuto: clipType === "auto",
        }),
      );
      setInited(true);
    }
  }, [ready, layout, clipType]);

  if (!clipType || !inited) {
    return (
      <Image
        className="flex items-center justify-center"
        src={src}
        width={`${size[0]}px`}
        height={`${size[1]}px`}
        preview={false}
      />
    );
  }

  const imageRatio = imageSize[0] / imageSize[1];

  return (
    <div
      style={
        {
          "--height": `${paperRatio * containerHeight}px`,
          "--container-width": `${containerWidth}px`,
          "--container-height": `${containerHeight}px`,
        } as any
      }
      className={cn(
        "flex items-center justify-center w-(--container-width) h-(--container-height) bg-fill-1",
        {
          "flex-row": isHorizontal,
          "flex-col": isVertical,
        },
        className,
      )}
    >
      <div
        style={
          {
            "--width": `${clipSize.frameWidth}px`,
            "--height": `${clipSize.frameHeight}px`,
          } as any
        }
        data-slot="frame"
        className={cn(
          "relative bg-white flex border border-border-1 overflow-hidden",
          {
            "w-(--width) h-(--height)": clipType !== "auto",
            "items-center": clipType === "margin",
            "justify-center": clipType === "margin",
          },
          frameClassName,
        )}
      >
        <div
          style={
            {
              "--width": `${clipSize.imageWidth}px`,
              "--height": `${clipSize.imageHeight}px`,
              "--rotate-rotate": `${rotate}deg`,
            } as any
          }
          className="transform rotate-(--rotate-rotate) w-(--width) h-(--height)"
        >
          <img className="w-full h-full" src={src} alt="" />
        </div>
        {(typeof children === "function"
          ? children({
              ...clipSize,
              paperRatio,
              layout,
            })
          : children) ??
          (clipType === "auto" ? (
            <ClipOverlay
              isVertical={imageRatio <= paperRatio}
              clipPosPercent={clipPosPercent || [0, 0]}
              clipSizePercent={clipSizePercent || [0, 0]}
            />
          ) : null)}
      </div>
    </div>
  );
};
