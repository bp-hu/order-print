import { orderAtom } from "@/stores";
import { IOrder } from "@/typings";
import { atom } from "jotai";

const subOrderId = new URLSearchParams(window.location.href.split("?")[1]).get(
  "subOrderId",
);

export const subOrderIdAtom = atom<string>(subOrderId || "");

export const subOrderAtom = atom<IOrder | undefined>((get) => {
  const order = get(orderAtom);
  const subOrderId = get(subOrderIdAtom);

  return order?.orders?.find((v) => v.order_number === subOrderId);
});

export const setSubOrderAtom = atom(null, (get, set, v: any) => {
  const order = get(orderAtom);
  if (order) {
    order.orders = order.orders.map((item) =>
      item.order_number === subOrderId ? v : item,
    );
    set(orderAtom, {
      ...order,
    });
  }
});

export const paperRatioAtom = atom<number>((get) => {
  const order = get(subOrderAtom);
  const photoSize = order
    ? {
        w: order.paper_w || 0,
        h: order.paper_h || 0,
      }
    : undefined;
  return photoSize ? photoSize.w / photoSize.h : 0.4;
});

export const orderIsDoneAtom = atom<boolean>((get) => {
  const order = get(subOrderAtom);
  return order?.customer_status === "照片已上传";
});

export const totalAtom = atom<number>((get) => {
  const order = get(subOrderAtom);
  return order?.max_photo_count || 0;
});

export const countAtom = atom<number>(
  (get) =>
    get(subOrderAtom)?.images?.reduce(
      (acc, cur) => acc + cur.edited_params?.count,
      0,
    ) || 0,
);
