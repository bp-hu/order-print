import { DEFAULT_CONTAINER_SIZE } from "@/consts";
import { imageCacheAtom } from "@/stores";
import type { ClipLayout, ClipType } from "@/typings";
import { getClipSize } from "@/utils";
import { cn } from "@auix/utils";
import { Image } from "@douyinfe/semi-ui";
import { useAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { ClipOverlay } from "./clip-overlay";

export const ClipPreview = ({
  paperRatio,
  clipType,
  layout = "horizontal",
  src,
  imageId,
  size = DEFAULT_CONTAINER_SIZE,
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
  imageId?: string;
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
        containerSize: [number, number];
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
  const [imageCache, setImageCache] = useAtom(imageCacheAtom);

  useEffect(() => {
    if (ready && layout) {
      setClipSize(
        getClipSize({
          layout,
          containerSize: size,
          imageSize,
          paperRatio,
          clipType,
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
          "relative bg-white flex border border-border-1 overflow-hidden w-(--width) h-(--height)",
          {
            "items-center justify-center bg-transparent border-none": [
              "auto",
              "around",
            ].includes(clipType),
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
          <img
            className="w-full h-full"
            src={src}
            alt=""
            onLoad={function (e) {
              if (imageCache.find((v) => v.key === imageId)) {
                return;
              }
              const img = e.target as HTMLImageElement;
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
              setImageCache((prev) => [
                ...prev,
                { key: imageId, url: dataUrl },
              ]);
            }}
          />
        </div>
        <div
          style={
            {
              "--width": `${clipSize.imageWidth}px`,
              "--height": `${clipSize.imageHeight}px`,
            } as any
          }
          className="absolute w-(--width) h-(--height)"
        >
          {(typeof children === "function"
            ? children({
                ...clipSize,
                frameWidth: clipSize.imageWidth,
                frameHeight: clipSize.imageHeight,
                paperRatio,
                layout,
                containerSize: size,
              })
            : children) ??
            (["auto", "around"].includes(clipType) ? (
              <ClipOverlay
                frameSize={[clipSize.imageWidth, clipSize.imageHeight]}
                layout={layout}
                paperRatio={paperRatio}
                imageSize={imageSize}
                clipPosPercent={clipPosPercent || [0, 0]}
                clipSizePercent={clipSizePercent || [0, 0]}
              />
            ) : null)}
        </div>
      </div>
    </div>
  );
};
