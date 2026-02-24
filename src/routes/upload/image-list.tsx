import { imageListAtom, totalAtom } from "@/stores";
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
  const [imageList, setImageList] = useAtom(imageListAtom);
  const { url, count, layout, clipType, angle } = imageList[index];
  const [tempCount, setTempCount] = useState<number | undefined>(() => count);

  return (
    <div className="relative w-fit flex flex-col gap-3xs justify-center items-center p-2xs rounded-md border border-border-0 shadow-md">
      <ClipPreview
        src={url}
        layout={layout}
        clipType={clipType}
        size={[160, 160]}
        angle={angle}
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
                    content: "删除后将无法恢复",
                    width: "100vw",
                    onOk: () => {
                      setImageList(imageList.filter((_, i) => i !== index));
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
  editable,
}: {
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
  editable?: boolean;
}) => {
  const [imageList, setImageList] = useAtom(imageListAtom);
  const total = useAtomValue(totalAtom);

  return (
    <>
      <ImagePreview
        src={imageList.map((item) => item.url)}
        visible={visible}
        onVisibleChange={onVisibleChange}
        disableDownload
      />
      <div className="flex flex-wrap gap-lg">
        {imageList.map((_, index) => (
          <ImageContainer
            key={index}
            index={index}
            setCount={(count) => {
              const nextImageList = imageList.map((item, i) =>
                i === index ? { ...item, count } : item,
              );
              const nextTotal = nextImageList.reduce(
                (acc, item) => acc + item.count,
                0,
              );
              if (nextTotal <= total) {
                setImageList(
                  imageList.map((item, i) =>
                    i === index ? { ...item, count } : item,
                  ),
                );
              }
            }}
          />
        ))}
      </div>
    </>
  );
};
