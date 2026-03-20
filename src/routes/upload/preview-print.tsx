import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
} from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";
import { useUpdateEffect } from "@safe-fe/hooks";
import { useState } from "react";

export function PreviewPrint({
  images = [],
  defaultVisible = false,
  onVisibleChange,
  showTrigger = true,
}: {
  images: string[];
  defaultVisible?: boolean;
  showTrigger?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState<boolean>(defaultVisible);
  const currentImage = images[currentIndex];

  useUpdateEffect(() => {
    onVisibleChange?.(previewVisible);
  }, [previewVisible]);

  return (
    <>
      {showTrigger ? (
        <Button
          className="ml-auto"
          size="small"
          theme="solid"
          onClick={() => setPreviewVisible(true)}
        >
          预览冲印效果
        </Button>
      ) : null}
      {previewVisible ? (
        <div className="fixed left-0 top-0 w-full h-full z-[999] bg-[#000000a0] flex items-center justify-center">
          <IconClose
            className="absolute top-4 right-4 text-white text-[24px] cursor-pointer"
            onClick={() => setPreviewVisible(false)}
          />
          {images.length > 1 ? (
            <IconChevronLeft
              className="absolute top-[50%] left-4 text-white text-[24px] cursor-pointer"
              onClick={() =>
                setCurrentIndex(
                  (currentIndex - 1 + images.length) % images.length,
                )
              }
            />
          ) : null}
          <div className="w-[300px] h-[300px]">
            <img className="object-contain w-full h-full" src={currentImage} />
          </div>
          {images.length > 1 ? (
            <IconChevronRight
              className="absolute top-[50%] right-4 text-white text-[24px] cursor-pointer"
              onClick={() =>
                setCurrentIndex((currentIndex + 1) % images.length)
              }
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
