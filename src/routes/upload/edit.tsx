import { cn, useUpdateEffect } from "@auix/utils";
import { IconEdit } from "@douyinfe/semi-icons";
import { Button, Modal, Radio, RadioGroup, Tooltip } from "@douyinfe/semi-ui";
import Cropper from "cropperjs";
import { useEffect, useRef, useState } from "react";

function Editor({
  src,
  visible,
  setVisible,
}: {
  src: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const timer = useRef<any>(undefined);
  const copperRef = useRef<Cropper>(undefined);
  const [clipType, setClipType] = useState<"auto" | "margin" | "single">(
    "auto",
  );
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");

  function setSelectionLayout(layout: "horizontal" | "vertical") {
    const { width, height } = imageRef.current as HTMLImageElement;
    const selection = copperRef.current?.getCropperSelection();
    if (selection && layout === "horizontal") {
      selection.$change(
        0,
        0,
        360,
        width > height ? (360 * height) / width : 180,
      );
    } else if (selection && layout === "vertical") {
      selection.$change(
        90,
        0,
        width > height ? 180 : (360 * width) / height,
        360,
      );
    }
  }

  useEffect(() => {
    if (visible && imageRef.current) {
      timer.current = setTimeout(() => {
        const cropper = new Cropper(imageRef.current as any);
        copperRef.current = cropper;
        setTimeout(() => {
          const selection = copperRef.current?.getCropperSelection();
          setSelectionLayout("horizontal");
          if (selection) {
            selection.movable = false;
          }
        }, 0);
      }, 300);
    }

    return () => {
      clearTimeout(timer.current);
      if (copperRef.current) {
        copperRef.current.destroy();
      }
      timer.current = undefined;
      copperRef.current = undefined;
    };
  }, [visible]);

  useUpdateEffect(() => {
    if (clipType === "auto") {
      setSelectionLayout(layout);
    } else {
      copperRef.current?.getCropperSelection()?.$clear();
    }
  }, [layout, clipType]);

  return (
    <Modal
      title="编辑图片"
      visible={visible}
      onCancel={() => setVisible(false)}
      width={400}
    >
      <div className="flex flex-col gap-md">
        <div className="flex flex-wrap gap-md">
          <RadioGroup
            buttonSize="small"
            type="button"
            value={clipType}
            onChange={(e) => setClipType(e.target.value)}
          >
            <Radio value="auto">智能裁剪</Radio>
            <Radio value="margin">两边留白</Radio>
            <Radio value="single">单边留白</Radio>
          </RadioGroup>
          <RadioGroup
            buttonSize="small"
            type="button"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <Radio value="horizontal">横版</Radio>
            <Radio value="vertical">竖版</Radio>
          </RadioGroup>
        </div>
        <div
          className={cn(
            "bg-white flex border border-border-1 w-[362px] h-[362px] [&_cropper-canvas]:h-[360px]",
            {
              "[&_cropper-canvas]:w-[360px]": clipType === "auto",
              "[&_cropper-canvas]:w-[340px]": clipType !== "auto",
              "items-center justify-center": clipType === "margin",
            },
          )}
        >
          <img className="invisible" ref={imageRef} src={src} alt="" />
        </div>
      </div>
    </Modal>
  );
}

export default ({ src }: { src: string; index: number }) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <Tooltip content="编辑">
        <Button
          icon={<IconEdit />}
          theme="light"
          className="rounded-full shadow-md"
          onClick={() => setVisible(true)}
        />
      </Tooltip>
      <Editor src={src} visible={visible} setVisible={setVisible} />
    </>
  );
};
