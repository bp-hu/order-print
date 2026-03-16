import { updateImageParams } from "@/servers";
import { orderAtom, ratioAtom, totalAtom } from "@/stores";
import { http } from "@/utils/http";
import { IconDelete, IconMinus, IconPlus } from "@douyinfe/semi-icons";
import { Button, ImagePreview, Input, Modal, Tooltip } from "@douyinfe/semi-ui";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { ClipPreview } from "./clip-preview";
import Editor from "./editor";

function ImageContainer({
  index,
  setCount,
}: {
  index: number;
  setCount: (count: number) => void;
}) {
  const [order, setOrder] = useAtom(orderAtom);
  const ratio = useAtomValue(ratioAtom);
  const image = order?.images?.[index];
  const url = image?.url || "";
  const {
    count = 1,
    layout,
    clipType,
    rotate,
    naturalHeight = 0,
    naturalWidth = 0,
    clipTopPercent,
    clipHeightPercent,
  } = image?.edited_params ?? {};
  const [tempCount, setTempCount] = useState<number | undefined>(() => count);

  return (
    <div className="relative w-fit flex flex-col gap-3xs justify-center items-center p-2xs rounded-md border border-border-0 shadow-md">
      <ClipPreview
        src={url}
        layout={layout}
        clipType={clipType}
        size={[160, 160]}
        ratio={ratio}
        rotate={rotate}
        imageSize={[naturalWidth, naturalHeight]}
        clipTopPercent={clipTopPercent || 0}
        clipHeightPercent={clipHeightPercent || 0}
        ready
        frameClassName="border border-border-0 border-dashed"
      />
      <div className="flex items-center p-3xs rounded-full border border-border-0 shadow-md gap-xs">
        <div className="flex items-center gap-4xs">
          {count <= 1 ? (
            <Tooltip content="删除">
              <Button
                icon={<IconDelete />}
                type="danger"
                theme="light"
                size="small"
                className="rounded-full shadow-md"
                onClick={() => {
                  Modal.confirm({
                    title: "确认删除吗？",
                    content: "删除后可以从历史图片中恢复",
                    width: "100vw",
                    onOk: () => {
                      if (!order) {
                        return;
                      }
                      http
                        .delete(
                          `/images/${order?.order_number || ""}/${image?.id}`,
                        )
                        .then(() => {
                          setOrder({
                            ...order,
                            images: (order.images || []).filter(
                              (_, i) => i !== index,
                            ),
                            history_images: [
                              ...(order.history_images || []),
                              image?.id || "",
                            ],
                          });
                        });
                    },
                  });
                }}
              />
            </Tooltip>
          ) : (
            <Button
              size="small"
              icon={<IconMinus />}
              className="rounded-full"
              onClick={() => {
                const nextCount = count === 1 ? 1 : count - 1;
                setCount(nextCount);
                setTempCount(nextCount);
              }}
            />
          )}
          <Input
            className="w-[24px] [&>input]:px-3xs"
            value={tempCount}
            onChange={(v) => {
              setTempCount(v === "" ? undefined : Math.max(1, Number(v)));
            }}
            onBlur={() => {
              if (tempCount !== undefined) {
                setCount(tempCount);
              } else {
                setTempCount(count);
              }
            }}
          />
          <Button
            size="small"
            icon={<IconPlus />}
            className="rounded-full"
            onClick={() => {
              const nextCount = count + 1;
              setCount(nextCount);
              setTempCount(nextCount);
            }}
          />
        </div>
        <Editor index={index} />
      </div>
    </div>
  );
}

export default ({
  visible,
  onVisibleChange,
}: {
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
}) => {
  const total = useAtomValue(totalAtom);
  const [order, setOrder] = useAtom(orderAtom);

  return (
    <>
      <ImagePreview
        src={order?.images.map((item) => item.url)}
        visible={visible}
        onVisibleChange={onVisibleChange}
        disableDownload
      />
      <div className="flex flex-wrap gap-lg">
        {order?.images.map((_, index) => (
          <ImageContainer
            key={index}
            index={index}
            setCount={(count) => {
              const nextImages = order?.images.map((item, i) =>
                i === index
                  ? { ...item, edited_params: { ...item.edited_params, count } }
                  : item,
              );
              const nextTotal = nextImages.reduce(
                (acc, item) => acc + (item.edited_params?.count || 0),
                0,
              );
              if (nextTotal <= total) {
                setOrder({ ...order, images: nextImages });
                const nextImage = nextImages[index];
                updateImageParams({
                  orderId: order.order_number,
                  imageId: nextImage.id,
                  params: nextImage.edited_params,
                });
              }
            }}
          />
        ))}
      </div>
    </>
  );
};
