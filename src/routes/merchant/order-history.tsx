import { CUSTOMER_STATUS_COLOR, MERCHANT_STATUS_COLOR } from "@/consts";
import { IOrder } from "@/typings";
import { http } from "@/utils/http";
import { useUpdateEffect } from "@auix/utils";
import { IconHistory } from "@douyinfe/semi-icons";
import { Button, Modal, SideSheet, Table, Toast } from "@douyinfe/semi-ui";
import { useRequest } from "@safe-fe/hooks";
import dayjs from "dayjs";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { refreshOrderListAtom } from "./store";

export function OrderHistory() {
  const [visible, setVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([] as string[]);
  const [orders, setOrders] = useState([] as IOrder[]);
  const refreshOrderList = useSetAtom(refreshOrderListAtom);
  const { run: getHistoryOrders, loading } = useRequest(() =>
    http.get("/orders/history/getList").then((res) => {
      setOrders(res || []);
    }),
  );
  const { run: clearHistoryOrders, loading: clearLoading } = useRequest(() =>
    http.delete("/orders/history/clean_all"),
  );
  const { run: deleteHistoryOrders, loading: deleteLoading } = useRequest(() =>
    http.delete(
      "/orders/history/batch",
      {},
      {
        data: selectedKeys,
      },
    ),
  );
  const { run: recoverHistoryOrders, loading: recoverLoading } = useRequest(
    () => http.post("/orders/history/recover/batch", selectedKeys),
  );

  useEffect(() => {
    if (visible) {
      getHistoryOrders();
    }
  }, [visible]);

  useUpdateEffect(() => {
    if (!visible) {
      refreshOrderList();
    }
  }, [visible]);

  return (
    <>
      <Button icon={<IconHistory />} onClick={() => setVisible(true)}>
        回收站
      </Button>
      <SideSheet
        title="历史订单"
        width="100vw"
        height="100vh"
        placement="bottom"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <div className="flex justify-end gap-md">
            <Button onClick={() => setVisible(false)}>取消</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-md">
            <Button
              className="ml-auto"
              type="danger"
              theme="solid"
              disabled={!selectedKeys.length}
              loading={deleteLoading}
              onClick={() => {
                Modal.confirm({
                  title: "确认删除吗？",
                  content: "删除后将无法恢复",
                  width: "100vw",
                  onOk: async () => {
                    await deleteHistoryOrders();
                    setSelectedKeys([]);
                    getHistoryOrders();
                    Toast.success("删除成功");
                  },
                });
              }}
            >
              删除
            </Button>
            <Button
              type="primary"
              theme="solid"
              loading={recoverLoading}
              disabled={!selectedKeys.length}
              onClick={async () => {
                await recoverHistoryOrders();
                setSelectedKeys([]);
                getHistoryOrders();
                Toast.success("恢复成功");
              }}
            >
              恢复
            </Button>
            <Button
              type="danger"
              theme="solid"
              loading={clearLoading}
              onClick={async () => {
                Modal.confirm({
                  title: "确认清空所有订单吗？",
                  content: "清空订单后将无法恢复",
                  width: "100vw",
                  onOk: async () => {
                    await clearHistoryOrders();
                    getHistoryOrders();
                    Toast.success("清空成功");
                  },
                });
              }}
            >
              一键清空
            </Button>
          </div>
          <Table
            dataSource={orders}
            loading={loading}
            rowKey="order_number"
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange(keys: any) {
                setSelectedKeys(keys);
              },
            }}
            columns={[
              {
                title: "订单 ID",
                dataIndex: "id",
                render(_, record) {
                  return record.order_number;
                },
              },
              {
                title: "订单名称",
                dataIndex: "order_name",
              },
              {
                title: "订单类型",
                dataIndex: "order_type",
              },
              {
                title: "照片尺寸",
                dataIndex: "photo_size",
              },
              {
                title: "最大照片数量",
                dataIndex: "max_photo_count",
              },
              {
                title: "客户状态",
                dataIndex: "customer_status",
                render(status) {
                  return (
                    <div className={CUSTOMER_STATUS_COLOR[status]}>
                      {status || "-"}
                    </div>
                  );
                },
              },
              {
                title: "商家状态",
                dataIndex: "merchant_status",
                render(status) {
                  return (
                    <div className={MERCHANT_STATUS_COLOR[status]}>
                      {status}
                    </div>
                  );
                },
              },
              {
                title: "创建时间",
                dataIndex: "created_at",
                render(dateStr) {
                  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
                },
              },
              {
                title: "更新时间",
                dataIndex: "updated_at",
                render(dateStr) {
                  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
                },
              },
              {
                title: "快递单号",
                dataIndex: "express",
                width: 120,
                render(express) {
                  return express?.order_number || "-";
                },
              },
              {
                title: "备注",
                dataIndex: "remark",
                width: 120,
                render(remark) {
                  return remark?.text || "-";
                },
              },
            ]}
          />
        </div>
      </SideSheet>
    </>
  );
}
