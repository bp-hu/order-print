import { imageListAtom, totalAtom } from "@/stores";
import { IconMinus, IconPlus } from "@douyinfe/semi-icons";
import { Button, Input, Modal, SideSheet } from "@douyinfe/semi-ui";
import { useAtomValue } from "jotai";
import { useState } from "react";

export function CountEditor({
  visible,
  setVisible,
  onOk,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk?: (count: number) => void;
}) {
  const [count, setCount] = useState(1);
  const total = useAtomValue(totalAtom);
  const imageList = useAtomValue(imageListAtom);

  return (
    <SideSheet
      title={null}
      closable={false}
      visible={visible}
      onCancel={() => setVisible(false)}
      headerStyle={{
        display: "none",
      }}
      bodyStyle={{
        padding: 0,
        paddingTop: 24,
      }}
      placement="bottom"
    >
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-xs">
          <Button
            size="large"
            icon={<IconMinus />}
            className="rounded-full"
            disabled={count === 1}
            onClick={() => setCount(count === 1 ? 1 : count - 1)}
          />
          <Input
            className="flex-1 [&>input]:px-3xs"
            value={count}
            onChange={(v) => setCount(Math.max(1, Number(v)))}
          />
          <Button
            size="large"
            icon={<IconPlus />}
            className="rounded-full"
            onClick={() => setCount(count + 1)}
          />
        </div>
        <Button
          theme="solid"
          className="w-full"
          onClick={() => {
            if (imageList.length * count > total) {
              Modal.error({
                title: "重要提示",
                content: "超过最大照片数量",
                width: "100vw",
              });
              return;
            }
            onOk?.(count);
            setVisible(false);
          }}
        >
          确定
        </Button>
      </div>
    </SideSheet>
  );
}
