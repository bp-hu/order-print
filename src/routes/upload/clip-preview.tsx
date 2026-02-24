import type { ClipLayout, ClipType } from "@/typings";
import { getClipSize } from "@/utils";
import { cn } from "@auix/utils";
import { Image } from "@douyinfe/semi-ui";
import {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

export const ClipPreview = forwardRef<
  HTMLImageElement,
  {
    ratio?: number;
    src: string;
    clipType?: ClipType;
    layout?: ClipLayout;
    size?: [number, number];
    ready: boolean;
    className?: string;
    frameClassName?: string;
    angle?: number;
    children?:
      | ReactNode
      | ((props: {
          frameWidth: number;
          frameHeight: number;
          imageWidth: number;
          imageHeight: number;
          imageRef: RefObject<HTMLImageElement>;
          ratio: number;
        }) => ReactNode);
  }
>(
  (
    {
      ratio = 0.7,
      clipType,
      layout = "horizontal",
      src,
      size = [400, 400],
      ready = false,
      className,
      frameClassName,
      angle = 0,
      children,
    },
    ref: any,
  ) => {
    const selfRef = useRef<HTMLImageElement>(null);
    const imageRef = ref ?? selfRef;
    const isHorizontal = layout === "horizontal";
    const isVertical = layout === "vertical";
    const [containerWidth, containerHeight] = size;
    const [clipSize, setClipSize] = useState({
      frameWidth: 0,
      frameHeight: 0,
      imageWidth: 0,
      imageHeight: 0,
    });

    useEffect(() => {
      const image = imageRef.current;
      if (ready && layout && image) {
        setClipSize(
          getClipSize({
            layout,
            containerSize: size,
            image,
            frameRatio: ratio,
            isAuto: clipType === "auto",
          }),
        );
      }
    }, [ready, layout, clipType]);

    if (!clipType) {
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
            "--height": `${ratio * containerHeight}px`,
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
          className={cn(
            "relative bg-white flex border border-border-1 overflow-hidden",
            {
              "w-full": clipType !== "auto" && isHorizontal,
              "h-full": clipType !== "auto" && isVertical,
              "items-center":
                (clipType !== "auto" && isHorizontal) ||
                (clipType === "margin" && isVertical),
              "justify-center":
                (clipType === "margin" && isHorizontal) ||
                (clipType !== "auto" && isVertical),
            },
            frameClassName,
          )}
        >
          <div
            style={
              {
                "--width": `${clipSize.imageWidth}px`,
                "--height": `${clipSize.imageHeight}px`,
                "--rotate-angle": `${angle}deg`,
              } as any
            }
            className="transform rotate-(--rotate-angle) w-(--width) h-(--height)"
          >
            <img className="w-full h-full" src={src} ref={imageRef} alt="" />
          </div>
          {typeof children === "function"
            ? children({
                ...clipSize,
                imageRef,
                ratio,
              })
            : children}
        </div>
      </div>
    );
  },
);
