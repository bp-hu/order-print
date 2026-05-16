import { Modal, TextArea } from "@douyinfe/semi-ui";
import { ComponentProps, useEffect, useState } from "react";

export function BatchSearchModal({
  visible,
  setVisible,
  onOk,
  ...props
}: Omit<ComponentProps<typeof TextArea>, "value" | "onChange"> & {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: (value: string) => void;
}) {
  const [value, setValue] = useState(() => props.defaultValue || "");

  useEffect(() => {
    setValue(props.defaultValue || "");
  }, [visible]);

  return (
    <Modal
      title="批量查询"
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => {
        onOk(value.replaceAll(/\s+/g, ","));
        setVisible(false);
      }}
    >
      <TextArea {...props} value={value} onChange={setValue} rows={14} />
    </Modal>
  );
}
