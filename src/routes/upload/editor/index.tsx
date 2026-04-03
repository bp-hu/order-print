import { updateImageParams } from "@/servers";
import { orderAtom, paperRatioAtom } from "@/stores";
import { EditParams } from "@/typings";
import { getPrintParams } from "@/utils";
import { cn } from "@auix/utils";
import {
  IconColorPalette,
  IconEyeOpened,
  IconImage,
} from "@douyinfe/semi-icons";
import {
  Button,
  Radio,
  RadioGroup,
  SideSheet,
  Typography,
} from "@douyinfe/semi-ui";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { ClipPreview } from "../clip-preview";
import { PreviewPrint } from "../preview-print";
import { Clip } from "./clip";

const { Text } = Typography;

function Editor({
  visible,
  setVisible,
  index,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  index: number;
}) {
  const [order, setOrder] = useAtom(orderAtom);
  const paperRatio = useAtomValue(paperRatioAtom);
  const image = order?.images[index];
  const src = image?.url || "";
  const [editParams, setEditParams] = useState(
    () => image?.edited_params || ({} as EditParams),
  );
  const [previewVisible, setPreviewVisible] = useState(false);

  function computeEditParams(editParams: EditParams) {
    return {
      ...editParams,
      ...getPrintParams({
        paperSize: [editParams.paper_w || 0, editParams.paper_h || 0],
        layout: editParams.layout,
        clipType: editParams.clipType,
        imageSize: [
          editParams.naturalWidth || 0,
          editParams.naturalHeight || 0,
        ],
        clipPosPercent: [
          editParams.clipTopPercent || 0,
          editParams.clipLeftPercent || 0,
        ],
        clipSizePercent: [
          editParams.clipWidthPercent || 0,
          editParams.clipHeightPercent || 0,
        ],
      }),
    };
  }

  async function updateEditParams() {
    const orderId = order?.order_number;
    if (orderId && image) {
      const nextEditParams = computeEditParams(editParams);
      await updateImageParams({
        orderId,
        imageId: image.id,
        params: nextEditParams,
      });
      setOrder({
        ...order,
        images: order.images.map((item) =>
          item.id === image.id
            ? {
                ...item,
                edited_params: nextEditParams,
              }
            : item,
        ),
      });
    }
  }

  return (
    <SideSheet
      title={null}
      closable={false}
      visible={visible}
      onCancel={async () => {
        setVisible(false);
        setPreviewVisible(false);

        await updateEditParams();
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
      <div className="flex flex-col items-center gap-md">
        <ClipPreview
          paperRatio={paperRatio}
          clipType={editParams.clipType}
          layout={editParams.layout}
          src={image?.preview_url || src}
          imageId={image?.id || ""}
          ready={visible}
          rotate={editParams.rotate}
          clipPosPercent={[
            editParams.clipLeftPercent || 0,
            editParams.clipTopPercent || 0,
          ]}
          clipSizePercent={[
            editParams.clipWidthPercent || 0,
            editParams.clipHeightPercent || 0,
          ]}
          imageSize={[
            editParams.naturalWidth || 0,
            editParams.naturalHeight || 0,
          ]}
        >
          {editParams.clipType === "auto"
            ? ({ containerSize, paperRatio, layout }) => (
                <Clip
                  containerSize={containerSize}
                  layout={layout}
                  paperRatio={paperRatio}
                  defaultClipPosPercent={[
                    editParams.clipLeftPercent || 0,
                    editParams.clipTopPercent || 0,
                  ]}
                  imageSize={[
                    editParams.naturalWidth || 0,
                    editParams.naturalHeight || 0,
                  ]}
                  onMove={(pos) =>
                    setEditParams({
                      ...editParams,
                      ...pos,
                    })
                  }
                />
              )
            : null}
        </ClipPreview>
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-3">
            {/* <div className="flex items-center gap-xs">
              自动调色
              <Switch
                checked={editParams.autoToning}
                onChange={(v) => {
                  setEditParams({
                    ...editParams,
                    autoToning: v,
                  });
                }}
              />
            </div> */}
            <RadioGroup
              type="button"
              value={editParams.layout}
              onChange={(e) => {
                setEditParams({
                  ...editParams,
                  layout: e.target.value,
                });
              }}
            >
              <Radio value="horizontal">横版</Radio>
              <Radio value="vertical">竖版</Radio>
            </RadioGroup>
            <Button
              theme="borderless"
              icon={<IconEyeOpened />}
              onClick={() => {
                setPreviewVisible(true);
              }}
            >
              预览
            </Button>
          </div>
          {/* <Rotate
            rotate={editParams.rotate}
            setRotate={(rotate) => setEditParams({ ...editParams, rotate })}
          /> */}
          <div className="flex">
            {[
              {
                icon: <IconColorPalette />,
                label: "智能裁剪",
                active: editParams.clipType === "auto",
                onClick: () =>
                  setEditParams({ ...editParams, clipType: "auto" }),
              },
              ...(["1英寸", "2英寸"].includes(order?.photo_size || "")
                ? []
                : [
                    {
                      icon: <IconImage />,
                      label: "两边留白",
                      active: editParams.clipType === "margin",
                      onClick: () =>
                        setEditParams({ ...editParams, clipType: "margin" }),
                    },
                    {
                      icon: <IconImage />,
                      label: "单边留白",
                      active: editParams.clipType === "single",
                      onClick: () =>
                        setEditParams({ ...editParams, clipType: "single" }),
                    },
                  ]),
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
      {visible && previewVisible ? (
        <PreviewPrint
          showTrigger={false}
          defaultVisible={true}
          onVisibleChange={setPreviewVisible}
          images={[
            `${src}/preview?edit_params=${JSON.stringify(computeEditParams(editParams))}`,
          ]}
        />
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
