import { ClipLayout } from "@/typings";
import { getPaperRatioByLayout } from "@/utils";
import { cn } from "@auix/utils";

export function ClipOverlay({
  className,
  layout,
  paperRatio,
  imageRatio,
  clipPosPercent,
  clipSizePercent,
  containerSize,
}: {
  className?: string;
  paperRatio: number;
  imageRatio: number;
  layout: ClipLayout;
  clipPosPercent: [number, number];
  clipSizePercent: [number, number];
  containerSize: [number, number];
}) {
  const [containerHeight, containerWidth] = containerSize;
  const clipRatio = getPaperRatioByLayout({
    layout,
    paperRatio,
  });
  const isVertical = imageRatio <= clipRatio;

  const clipTop = clipPosPercent[1] * containerHeight;
  const clipHeight = clipSizePercent[1] * containerHeight;
  const clipLeft = clipPosPercent[0] * containerWidth;
  const clipWidth = clipSizePercent[0] * containerWidth;

  return (
    <div
      data-slot="clip-overlay"
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
      <div
        style={
          {
            "--clip-top": `${clipTop}px`,
            "--clip-left": `${clipLeft}px`,
          } as any
        }
        className={cn("absolute", {
          "top-(--clip-top) w-full": isVertical,
          "left-(--clip-left) h-full": !isVertical,
        })}
      >
        <div
          style={
            {
              "--clip-height": `${clipHeight}px`,
              "--clip-width": `${clipWidth}px`,
            } as any
          }
          className={cn("relative", {
            "w-full h-(--clip-height)": isVertical,
            "h-full w-(--clip-width)": !isVertical,
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
      </div>
      <div
        style={
          {
            "--mask-height": `${containerHeight - clipTop - clipHeight}px`,
            "--mask-width": `${containerWidth - clipLeft - clipWidth}px`,
          } as any
        }
        className={cn("absolute bg-[#ffffff80]", {
          "bottom-0 left-0 w-full h-(--mask-height)": isVertical,
          "right-0 top-0 h-full w-(--mask-width)": !isVertical,
        })}
      />
    </div>
  );
}
