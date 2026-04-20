import { IconMinus, IconPlus } from "@douyinfe/semi-icons";
import { Button, Input, Modal, SideSheet } from "@douyinfe/semi-ui";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { subOrderAtom, totalAtom } from "./store";

export function CountEditor({
  visible,
  setVisible,
  onOk,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk?: (count: number) => void;
}) {
  const [count, setCount] = useState<number | undefined>(1);
  const total = useAtomValue(totalAtom);
  const order = useAtomValue(subOrderAtom);

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
            disabled={!count}
            onClick={() => setCount(count === 1 ? 1 : (count || 0) - 1)}
          />
          <Input
            className="flex-1 [&>input]:px-3xs"
            value={count}
            onChange={(v) =>
              v ? setCount(Math.max(0, Number(v))) : setCount(undefined)
            }
          />
          <Button
            size="large"
            icon={<IconPlus />}
            className="rounded-full"
            onClick={() => setCount((count || 0) + 1)}
          />
        </div>
        <Button
          theme="solid"
          className="w-full"
          disabled={!count || count <= 0}
          onClick={() => {
            if (!count) {
              return;
            }
            if ((order?.images?.length || 0) * count > total) {
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
