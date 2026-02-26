import { http } from "@/utils/http";
import { IconPlus } from "@douyinfe/semi-icons";
import { Button, Form, Modal, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useRequest } from "@safe-fe/hooks";
import { useRef, useState } from "react";

export function OrderCreator() {
  const { run: createOrder, loading } = useRequest((params) =>
    http.post("/v1/orders", params, {
      withCredentials: false,
    }),
  );
  const [visible, setVisible] = useState(false);
  const formRef = useRef<FormApi>(undefined);

  return (
    <>
      <Button
        theme="solid"
        icon={<IconPlus />}
        onClick={() => setVisible(true)}
      >
        新建订单
      </Button>
      <Modal
        title="新建订单"
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const form = formRef.current;
          await form?.validate();
          const values = form?.getValues();
          await createOrder(values);
          setVisible(false);
          Toast.success("订单创建成功");
        }}
        okButtonProps={{
          loading,
        }}
      >
        <Form getFormApi={(formApi) => (formRef.current = formApi)}>
          <Form.Input
            rules={[{ required: true, message: "请输入订单 ID" }]}
            label="订单 ID"
            field="order_number"
            placeholder="请输入订单 ID"
          />
          <Form.Input
            rules={[{ required: true, message: "请输入订单类型" }]}
            label="订单类型"
            field="order_type"
            placeholder="请输入订单类型"
          />
          <Form.Input
            rules={[{ required: true, message: "请输入照片尺寸" }]}
            label="照片尺寸"
            field="photo_size"
            placeholder="请输入照片尺寸"
          />
          <Form.InputNumber
            rules={[{ required: true, message: "请输入最大照片数量" }]}
            label="最大照片数量"
            field="max_photo_count"
          />
        </Form>
      </Modal>
    </>
  );
}
