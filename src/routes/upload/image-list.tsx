import { imageListAtom } from "@/stores";
import {
  IconDelete,
  IconImage,
  IconMinus,
  IconPlus,
  IconScissors,
} from "@douyinfe/semi-icons";
import {
  Button,
  Image,
  ImagePreview,
  Input,
  Modal,
  Tooltip,
} from "@douyinfe/semi-ui";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import Edit from "./edit";

function ImageContainer({
  src,
  index,
  editable,
}: {
  src: string;
  index: number;
  editable?: boolean;
}) {
  const [imageList, setImageList] = useAtom(imageListAtom);
  const [count, setCount] = useState<number>(1);

  return (
    <div className="relative w-fit flex flex-col gap-xs justify-center items-center p-md rounded-md border border-border-0 shadow-md">
      <Image
        src={src}
        width={200}
        alt={`lamp${index + 1}`}
        style={{ marginRight: 5 }}
        preview={false}
      />
      <div className="flex p-3xs rounded-full border border-border-0 shadow-md gap-xs">
        <div className="flex items-center gap-4xs">
          <Button
            size="small"
            icon={<IconMinus />}
            className="rounded-full"
            disabled={count === 1}
            onClick={() => setCount(count === 1 ? 1 : count - 1)}
          />
          <Input
            className="w-[36px] [&>input]:px-3xs"
            value={count}
            onChange={(v) => setCount(Number(v))}
          />
          <Button
            size="small"
            icon={<IconPlus />}
            className="rounded-full"
            onClick={() => setCount(count + 1)}
          />
        </div>
        {editable ? (
          <>
            <Tooltip content="裁剪">
              <Button
                icon={<IconScissors />}
                theme="light"
                className="rounded-full shadow-md"
              />
            </Tooltip>
            <Tooltip content="留白">
              <Button
                icon={<IconImage />}
                theme="light"
                className="rounded-full shadow-md"
              />
            </Tooltip>
            <Edit src={src} index={index} />
            <Tooltip content="删除">
              <Button
                icon={<IconDelete />}
                type="danger"
                theme="light"
                className="rounded-full shadow-md"
                onClick={() => {
                  Modal.confirm({
                    title: "确认删除吗？",
                    content: "删除后将无法恢复",
                    onOk: () => {
                      setImageList(imageList.filter((_, i) => i !== index));
                    },
                  });
                }}
              />
            </Tooltip>
          </>
        ) : null}
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
  const imageList = useAtomValue(imageListAtom);

  return (
    <>
      <ImagePreview
        src={imageList}
        visible={visible}
        onVisibleChange={onVisibleChange}
      />
      <div className="flex flex-wrap gap-lg">
        {imageList.map((src, index) => (
          <ImageContainer
            key={index}
            src={src}
            index={index}
            editable={editable}
          />
        ))}
      </div>
    </>
  );
};
