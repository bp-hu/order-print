import { Table } from "@douyinfe/semi-ui";
import dayjs from "dayjs";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { DownloadImages } from "./download-images";
import { OrderRemove } from "./order-remove";
import { orderListAtom, refreshOrderlistAtom } from "./store";

export function OrderList() {
  const orderList = useAtomValue(orderListAtom);
  const refresh = useSetAtom(refreshOrderlistAtom);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <Table
        dataSource={orderList}
        columns={[
          {
            title: "订单 ID",
            dataIndex: "order_number",
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
          // {
          //   title: "客户状态",
          //   dataIndex: "customer_status",
          // },
          // {
          //   title: "商家状态",
          //   dataIndex: "merchant_status",
          // },
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
            title: "操作",
            dataIndex: "order_number",
            render(orderNumber, order) {
              return (
                <div className="flex flex-col gap-xs items-center">
                  <OrderRemove orderNumber={orderNumber} />
                  <DownloadImages
                    images={order.images.map(
                      (v) => `/api/v1/images/${orderNumber}/${v}/edited`,
                    )}
                  />
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
}
