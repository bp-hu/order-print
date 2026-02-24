import { imageListAtom } from "@/stores";
import { cn } from "@auix/utils";
import {
  IconClose,
  IconColorPalette,
  IconEyeOpened,
  IconImage,
} from "@douyinfe/semi-icons";
import {
  Button,
  Radio,
  RadioGroup,
  SideSheet,
  Switch,
  Typography,
} from "@douyinfe/semi-ui";
import { useAtom } from "jotai";
import { useState } from "react";
import { ClipPreview } from "../clip-preview";
import { Angle } from "./angle";
import { Clip } from "./clip";

const { Text } = Typography;

function Editor({
  visible,
  setVisible,
  ratio = 0.7,
  index,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  ratio?: number;
  index: number;
}) {
  const [imageList, setImageList] = useAtom(imageListAtom);
  const {
    url: src,
    clipType: defaultClipType,
    layout: defaultLayout,
    autoToning: defaultAutoToning,
    angle,
  } = imageList[index];
  const [clipType, setClipType] = useState<"auto" | "margin" | "single">(
    () => defaultClipType || "auto",
  );
  const [layout, setLayout] = useState<"horizontal" | "vertical">(
    () => defaultLayout || "horizontal",
  );
  const [autoToning, setAutoToning] = useState<boolean>(
    () => defaultAutoToning || false,
  );
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <SideSheet
      title={null}
      closable={false}
      visible={visible}
      onCancel={() => {
        setVisible(false);
        setImageList(
          imageList.map((v, i) =>
            i === index
              ? {
                  ...v,
                  clipType,
                  layout,
                  autoToning,
                }
              : v,
          ),
        );
      }}
      headerStyle={{
        display: "none",
      }}
      bodyStyle={{
        padding: 0,
      }}
      placement="bottom"
      height="80%"
    >
      <div className="flex flex-col gap-md">
        <ClipPreview
          ratio={ratio}
          clipType={clipType}
          layout={layout}
          src={src}
          ready={visible}
          angle={angle}
        >
          {clipType === "auto"
            ? ({ frameHeight, frameWidth, imageRef, ratio }) => (
                <Clip
                  frameHeight={frameHeight}
                  frameWidth={frameWidth}
                  imageRef={imageRef}
                  ratio={ratio}
                  layout={layout}
                />
              )
            : null}
        </ClipPreview>
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-3">
            <div className="flex items-center gap-xs">
              自动调色
              <Switch checked={autoToning} onChange={setAutoToning} />
            </div>
            <RadioGroup
              type="button"
              value={layout}
              onChange={(e) => {
                setLayout(e.target.value);
              }}
            >
              <Radio value="horizontal">横版</Radio>
              <Radio value="vertical">竖版</Radio>
            </RadioGroup>
            <Button
              theme="borderless"
              icon={<IconEyeOpened />}
              onClick={() => setPreviewVisible(true)}
            >
              预览
            </Button>
          </div>
          <Angle index={index} />
          <div className="flex">
            {[
              {
                icon: <IconColorPalette />,
                label: "智能裁剪",
                active: clipType === "auto",
                onClick: () => setClipType("auto"),
              },
              {
                icon: <IconImage />,
                label: "两边留白",
                active: clipType === "margin",
                onClick: () => setClipType("margin"),
              },
              {
                icon: <IconImage />,
                label: "单边留白",
                active: clipType === "single",
                onClick: () => setClipType("single"),
              },
            ].map((v) => (
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-4xs flex-1 h-[54px] hover:bg-fill-1 px-4xs",
                  {
                    "bg-fill-2": v.active,
                  },
                )}
                onClick={v.onClick}
              >
                {v.icon}
                {v.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {previewVisible ? (
        <div className="fixed left-0 right-0 top-0 bottom-0 flex items-center justify-center bg-black/50">
          <IconClose
            className="absolute top-[24px] right-[24px] text-[24px] text-white"
            onClick={() => setPreviewVisible(false)}
          />
          <ClipPreview
            ratio={ratio}
            clipType={clipType}
            layout={layout}
            src={src}
            ready={visible}
            angle={angle}
          />
        </div>
      ) : null}
    </SideSheet>
  );
}

export default ({ index }: { index: number }) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <Text
        className="text-blue-500 typo-sm ml-lg"
        onClick={() => setVisible(true)}
      >
        编辑/预览
      </Text>
      <Editor index={index} visible={visible} setVisible={setVisible} />
    </>
  );
};
