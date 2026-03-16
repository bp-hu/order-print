import { PHOTO_SIZES } from "@/consts";
import { http } from "@/utils/http";
import { IconPlus } from "@douyinfe/semi-icons";
import { Button, Form, Modal, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useRequest } from "@safe-fe/hooks";
import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { refreshOrderlistAtom } from "./store";

export function OrderCreator() {
  const { run: createOrder, loading } = useRequest((params) =>
    http
      .post("/orders", params, {
        withCredentials: false,
      })
      .then(() => {
        setVisible(false);
        Toast.success("订单创建成功");
        refresh();
      }),
  );
  const refresh = useSetAtom(refreshOrderlistAtom);
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
          await createOrder({
            ...values,
            order_type: 1,
          });
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
            rules={[{ required: true, message: "请输入订单名称" }]}
            label="订单名称"
            field="order_name"
            placeholder="请输入订单名称"
          />
          {/* <Form.Input
            rules={[{ required: true, message: "请输入订单类型" }]}
            label="订单类型"
            field="order_type"
            placeholder="请输入订单类型"
          /> */}
          <Form.Select
            rules={[{ required: true, message: "请输入照片尺寸" }]}
            label="照片尺寸"
            field="photo_size"
            placeholder="请输入照片尺寸"
            optionList={Object.keys(PHOTO_SIZES).map((k) => ({
              label: k,
              value: k,
            }))}
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
