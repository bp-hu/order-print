import { IOrder } from "@/typings";
import { http } from "@/utils/http";
import { IconEdit } from "@douyinfe/semi-icons";
import { Button, Form, Modal, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useRequest } from "@safe-fe/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import {
  customerStatusAtom,
  merchantStatusAtom,
  refreshOrderlistAtom,
} from "./store";

export function OrderEdit({ order }: { order: IOrder }) {
  const [visible, setVisible] = useState(false);
  const { run: updateOrder, loading } = useRequest((params) =>
    http
      .put(`/orders/${order.order_number}`, params, {
        withCredentials: false,
      })
      .then(() => {
        setVisible(false);
        Toast.success("订单编辑成功");
        refresh();
      }),
  );
  const refresh = useSetAtom(refreshOrderlistAtom);
  const formRef = useRef<FormApi>(undefined);
  const customerStatus = useAtomValue(customerStatusAtom);
  const merchantStatus = useAtomValue(merchantStatusAtom);

  return (
    <>
      <Button
        type="secondary"
        theme="light"
        size="small"
        icon={<IconEdit />}
        onClick={() => setVisible(true)}
      >
        编辑
      </Button>
      <Modal
        title={`编辑订单-${order.order_number}`}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const form = formRef.current;
          await form?.validate();
          const values = form?.getValues();
          await updateOrder({
            customer_status: values.customer_status,
            merchant_status: values.merchant_status,
            remark: {
              text: values.remark,
            },
          });
        }}
        okButtonProps={{
          loading,
        }}
      >
        <Form
          getFormApi={(formApi) => (formRef.current = formApi)}
          initValues={{
            customer_status: order.customer_status,
            merchant_status: order.merchant_status,
            express: order.express,
          }}
        >
          <Form.Select
            label="客户状态"
            field="customer_status"
            optionList={customerStatus.map((v) => ({
              label: v,
              value: v,
            }))}
          />
          <Form.Select
            label="商家状态"
            field="merchant_status"
            optionList={merchantStatus.map((v) => ({
              label: v,
              value: v,
            }))}
          />
          <Form.TextArea label="备注" field="remark" placeholder="请输入备注" />
        </Form>
      </Modal>
    </>
  );
}
