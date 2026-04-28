import { updateImageParams } from "@/servers";
import { imageCacheAtom } from "@/stores";
import { http } from "@/utils/http";
import { useUpdateEffect } from "@auix/utils";
import {
  IconAlertTriangle,
  IconDelete,
  IconMinus,
  IconPlus,
} from "@douyinfe/semi-icons";
import { Button, ImagePreview, Input, Modal, Tooltip } from "@douyinfe/semi-ui";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef, useState } from "react";
import { ClipPreview } from "./clip-preview";
import Editor from "./editor";
import {
  orderIsDoneAtom,
  paperSizeAtom,
  setSubOrderAtom,
  subOrderAtom,
  totalAtom,
} from "./store";

function ImageContainer({
  index,
  setCount,
}: {
  index: number;
  setCount: (count: number) => boolean;
}) {
  const order = useAtomValue(subOrderAtom);
  const setOrder = useSetAtom(setSubOrderAtom);
  const paperSize = useAtomValue(paperSizeAtom);
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
    clipLeftPercent,
    clipWidthPercent,
    clipHeightPercent,
    paper_h = 0,
    paper_w = 0,
  } = image?.edited_params ?? {};
  const countRef = useRef(count);
  countRef.current = count;
  const [tempCount, setTempCount] = useState<number | undefined>(() => count);
  const setImageCache = useSetAtom(imageCacheAtom);
  const isDone = useAtomValue(orderIsDoneAtom);
  const showTip = useMemo(() => {
    if (
      naturalWidth === 0 ||
      naturalHeight === 0 ||
      paper_h === 0 ||
      paper_w === 0
    ) {
      return false;
    }
    const minHeight = (paper_h / 25) * 200;
    const minWidth = (paper_w / 25) * 200;
    return naturalWidth < minWidth || naturalHeight < minHeight;
  }, [naturalWidth, naturalHeight]);

  useUpdateEffect(() => {
    if (tempCount !== count) {
      setTempCount(count);
    }
  }, [count]);

  return (
    <div className="relative w-fit flex flex-col gap-3xs justify-center items-center p-4xs rounded-md border border-border-0 shadow-md">
      <div className="relative">
        <ClipPreview
          src={image?.preview_url || url}
          imageId={image?.id || ""}
          layout={layout}
          clipType={clipType}
          size={[160, 160]}
          paperSize={paperSize}
          rotate={rotate}
          imageSize={[naturalWidth, naturalHeight]}
          clipPosPercent={[clipLeftPercent || 0, clipTopPercent || 0]}
          clipSizePercent={[clipWidthPercent || 0, clipHeightPercent || 0]}
          ready
          frameClassName="border border-border-0 border-dashed"
        />
        {showTip ? (
          <div className="absolute bottom-0 bg-black/30 justify-center w-full p-4xs flex items-center text-white typo-sm">
            <IconAlertTriangle className="text-danger" />
            清晰度低，可能模糊
          </div>
        ) : null}
      </div>
      {isDone ? (
        <div className="absolute top-[-8px] right-[-8px] bg-danger typo-sm text-white px-3xs rounded-full">
          {count}
        </div>
      ) : (
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
                        setImageCache((prev: any) =>
                          prev.filter((item) => item.key !== image?.id),
                        );
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
                  const nextCount =
                    countRef.current === 1 ? 1 : countRef.current - 1;
                  const success = setCount(nextCount);
                  if (success) {
                    setTempCount(nextCount);
                  }
                }}
              />
            )}
            <Input
              className="w-[24px] [&>input]:px-3xs"
              value={tempCount}
              onChange={(v) => {
                setTempCount(v ? Number(v) : undefined);
              }}
              onBlur={() => {
                if (tempCount !== undefined) {
                  const success = setCount(tempCount);
                  if (!success) {
                    setTempCount(countRef.current);
                  }
                } else {
                  setTempCount(countRef.current);
                }
              }}
            />
            <Button
              size="small"
              icon={<IconPlus />}
              className="rounded-full"
              onClick={() => {
                const nextCount = countRef.current + 1;
                const success = setCount(nextCount);
                if (success) {
                  setTempCount(nextCount);
                }
              }}
            />
          </div>
          <Editor index={index} />
        </div>
      )}
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
  const order = useAtomValue(subOrderAtom);
  const setOrder = useSetAtom(setSubOrderAtom);

  return (
    <>
      <ImagePreview
        src={order?.images.map((item) => item.url)}
        visible={visible}
        onVisibleChange={onVisibleChange}
        disableDownload
      />
      <div className="flex flex-wrap gap-x-4xs gap-y-lg">
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
                return true;
              }
              return false;
            }}
          />
        ))}
      </div>
    </>
  );
};
