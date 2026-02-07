import { Button, Input, SideSheet } from "@douyinfe/semi-ui";
import { useState } from "react";

export default () => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <Button
        size="small"
        type="tertiary"
        theme="borderless"
        onClick={() => setVisible(true)}
      >
        历史设计
      </Button>
      <SideSheet
        title="查询历史设计"
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <Input placeholder="请输入订单号" />
      </SideSheet>
    </>
  );
};
