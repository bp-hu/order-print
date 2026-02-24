import { imageListAtom } from "@/stores";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
} from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { ClipPreview } from "./clip-preview";

export function PreviewPrint() {
  const imageList = useAtomValue(imageListAtom);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const currentImage = imageList[currentIndex];

  return (
    <>
      <Button
        className="ml-auto"
        size="small"
        theme="solid"
        onClick={() => setPreviewVisible(true)}
      >
        预览冲印效果
      </Button>
      {previewVisible ? (
        <div className="fixed left-0 top-0 w-full h-full z-[999] bg-[#000000a0] flex items-center justify-center">
          <IconClose
            className="absolute top-4 right-4 text-white text-[24px] cursor-pointer"
            onClick={() => setPreviewVisible(false)}
          />
          <IconChevronLeft
            className="absolute top-[50%] left-4 text-white text-[24px] cursor-pointer"
            onClick={() =>
              setCurrentIndex(
                (currentIndex - 1 + imageList.length) % imageList.length,
              )
            }
          />
          <div>
            <ClipPreview
              layout={currentImage.layout}
              clipType={currentImage.clipType}
              src={currentImage.url}
              ready
              size={[300, 300]}
            />
          </div>
          <IconChevronRight
            className="absolute top-[50%] right-4 text-white text-[24px] cursor-pointer"
            onClick={() =>
              setCurrentIndex((currentIndex + 1) % imageList.length)
            }
          />
        </div>
      ) : null}
    </>
  );
}
