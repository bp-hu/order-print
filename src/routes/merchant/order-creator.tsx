import { PHOTO_SIZES } from "@/consts";
import { http } from "@/utils/http";
import { IconMinusCircle, IconPlus } from "@douyinfe/semi-icons";
import {
  ArrayField,
  Button,
  Divider,
  Form,
  Modal,
  Toast,
} from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useRequest } from "@safe-fe/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { omit } from "lodash-es";
import { useRef, useState } from "react";
import { orderTypeListAtom, refreshOrderListAtom } from "./store";

export function OrderCreator() {
  const { run: createOrder, loading } = useRequest((params) =>
    http.post("/orders/create_orders", params).then(() => {
      setVisible(false);
      Toast.success("订单创建成功");
      refresh();
    }),
  );
  const refresh = useSetAtom(refreshOrderListAtom);
  const [visible, setVisible] = useState(false);
  const formRef = useRef<FormApi>(undefined);
  const orderTypeList = useAtomValue(orderTypeListAtom);

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
          const orders = (values?.orders || []).map((item, index) => ({
            ...omit(values, "orders"),
            order_sub_number: index + 1,
            ...item,
          }));
          await createOrder(orders);
        }}
        okButtonProps={{
          loading,
        }}
      >
        <Form getFormApi={(formApi) => (formRef.current = formApi)}>
          {({ values }) => (
            <>
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
              <Form.Select
                rules={[{ required: true, message: "请输入订单类型" }]}
                label="订单类型"
                field="order_type"
                placeholder="请输入订单类型"
                optionList={orderTypeList.map((v) => ({
                  label: v,
                  value: v,
                }))}
              />

              <ArrayField field="orders" initValue={[{}]}>
                {({ arrayFields, add }) => (
                  <div className="flex flex-col gap-md">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-text-2">子订单列表</div>
                      <Button onClick={() => add()}>新增子订单</Button>
                    </div>

                    <Divider className="mb-md" />
                    <div className="flex flex-col gap-md">
                      {arrayFields.map(({ field, key, remove }, index) => (
                        <div
                          key={key}
                          className="border border-border-0 rounded-md"
                        >
                          <div className="border-b border-border-0 p-md flex items-center justify-between">
                            <div>子订单 {index + 1}</div>
                            <Button
                              type="danger"
                              onClick={() => remove()}
                              icon={<IconMinusCircle />}
                            >
                              删除子订单
                            </Button>
                          </div>
                          <div className="p-md">
                            <Form.Select
                              rules={[
                                { required: true, message: "请输入照片尺寸" },
                              ]}
                              label="照片尺寸"
                              field={`${field}[photo_size]`}
                              placeholder="请输入照片尺寸"
                              optionList={[
                                {
                                  label: "自定义尺寸",
                                  value: "自定义",
                                },
                                ...Object.keys(PHOTO_SIZES).map((k) => ({
                                  label: k,
                                  value: k,
                                })),
                              ]}
                            />
                            {values.orders?.[index]?.photo_size ===
                              "自定义" && (
                              <>
                                <Form.InputNumber
                                  rules={[
                                    {
                                      required: true,
                                      message: "请输入照片宽度",
                                    },
                                  ]}
                                  label="照片宽度(mm)"
                                  field={`${field}[paper_w]`}
                                />
                                <Form.InputNumber
                                  rules={[
                                    {
                                      required: true,
                                      message: "请输入照片高度",
                                    },
                                  ]}
                                  label="照片高度(mm)"
                                  field={`${field}[paper_h]`}
                                />
                              </>
                            )}
                            <Form.InputNumber
                              rules={[
                                {
                                  required: true,
                                  message: "请输入最大照片数量",
                                },
                              ]}
                              label="最大照片数量"
                              field={`${field}[max_photo_count]`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ArrayField>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}
