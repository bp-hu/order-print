import { CUSTOMER_STATUS_COLOR, MERCHANT_STATUS_COLOR } from "@/consts";
import { Table } from "@douyinfe/semi-ui";
import dayjs from "dayjs";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Download } from "./download";
import { FilterValue } from "./filter";
import { OrderEdit } from "./order-edit";
import { OrderRemove } from "./order-remove";
import { PreviewImages } from "./preview-images";
import {
  batchModeAtom,
  orderListAtom,
  refreshOrderListAtom,
  selectedKeysAtom,
} from "./store";

export function OrderList({ filterValue }: { filterValue: FilterValue }) {
  const orderList = useAtomValue(orderListAtom);
  const batchMode = useAtomValue(batchModeAtom);
  const refresh = useSetAtom(refreshOrderListAtom);
  const [selectedKeys, setSelectedKeys] = useAtom(selectedKeysAtom);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    currentPage: 1,
  });

  const filteredData = useMemo(
    () =>
      orderList.filter((v) => {
        let flag = true;
        if (filterValue.searchKey) {
          flag =
            flag &&
            (v.order_number.includes(filterValue.searchKey) ||
              v.order_name.includes(filterValue.searchKey));
        }
        if (filterValue.customerStatus) {
          flag = flag && v.customer_status === filterValue.customerStatus;
        }
        if (filterValue.merchantStatus) {
          flag = flag && v.merchant_status === filterValue.merchantStatus;
        }
        return flag;
      }),
    [orderList, filterValue],
  );
  const dataSource = useMemo(
    () =>
      filteredData.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize,
      ),
    [filteredData, pagination],
  );

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    setPagination({
      ...pagination,
      currentPage: 1,
    });
  }, [filterValue]);

  return (
    <div>
      <Table
        dataSource={dataSource}
        rowKey="order_number"
        rowSelection={
          batchMode
            ? {
                selectedRowKeys: selectedKeys,
                onChange(keys: any) {
                  setSelectedKeys(keys);
                },
              }
            : undefined
        }
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
                <div className={MERCHANT_STATUS_COLOR[status]}>{status}</div>
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
          {
            title: "操作",
            dataIndex: "order_number",
            render(orderNumber, order) {
              const isDone = order?.customer_status === "照片已上传";

              return (
                <div className="flex flex-col gap-xs items-center">
                  {isDone ? <Download order={order} /> : null}
                  <OrderEdit order={order} />
                  <OrderRemove orderNumber={orderNumber} />
                  <PreviewImages
                    images={order.images.map(
                      (v) => `/api/v1/images/${orderNumber}/${v}/edited`,
                    )}
                  />
                </div>
              );
            },
          },
        ]}
        pagination={{
          total: filteredData?.length || 0,
          ...pagination,
          onChange(currentPage, pageSize) {
            setPagination({
              ...pagination,
              currentPage,
              pageSize,
            });
          },
        }}
      />
    </div>
  );
}
