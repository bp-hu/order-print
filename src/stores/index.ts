import { getImageInfoList } from "@/servers";
import { IOrder } from "@/typings/index";
import { http } from "@/utils/http";
import { atom } from "jotai";
import localforage from "localforage";

export const orderIdAtom = atom(
  localStorage.getItem("orderId") || "",
  (_, set, id: string) => {
    set(orderIdAtom, id);
    if (id) {
      localStorage.setItem("orderId", id);
    } else {
      localStorage.removeItem("orderId");
    }
  },
);

export const showPrintTipAtom = atom(
  localStorage.getItem("showPrintTip") || "",
  (_, set, visible: boolean = true) => {
    set(showPrintTipAtom, visible);
    if (visible) {
      localStorage.setItem("showPrintTip", "");
    } else {
      localStorage.removeItem("showPrintTip");
    }
  },
);

export const orderAtom = atom<
  | {
      orders: IOrder[];
      order_number: string;
    }
  | undefined
>(undefined);

export const orderLoadingAtom = atom<boolean>(false);

export const refreshOrderAtom = atom(null, async (get, set) => {
  set(orderLoadingAtom, true);
  try {
    const orderId = get(orderIdAtom);
    const res = await http.get(
      `/orders/${orderId}`,
      {},
      {
        withCredentials: false,
      },
    );
    let nextOrders = (Array.isArray(res) ? res : [res]).filter(Boolean);
    nextOrders = nextOrders.map((order) => ({
      ...order,
      images: (order.images || []).map((id: string) => ({
        id,
        url: `/api/v1/images/${order.order_number}/${id}`,
      })),
    }));

    await Promise.all(
      nextOrders.map(async (order) => {
        const imageIds = (order.images || []).map((item) => item.id);
        if (imageIds.length) {
          const imageInfoList = await getImageInfoList(
            order.order_number,
            imageIds,
          );
          const imageInfos = (imageInfoList?.images || []).reduce(
            (acc: any, cur: any) => {
              acc[cur.id] = cur;
              return acc;
            },
            {} as Record<string, any>,
          );
          const imageCache = get(imageCacheAtom);
          order.images = (order.images || []).map((image: any) => ({
            ...image,
            ...imageInfos[image.id],
            preview_url:
              imageCache.find((v) => v.key === image.id)?.url || image.url,
            edited_params: {
              count: 1,
              clipType: "auto",
              layout: "horizontal",
              autoToning: false,
              rotate: undefined,
              ...(imageInfos[image.id]?.edited_params || {}),
            },
          }));
        }
      }),
    );

    set(orderAtom, {
      orders: nextOrders,
      order_number: orderId,
    });
  } finally {
    set(orderLoadingAtom, false);
  }
});

export const imageCacheAtom = atom(
  [] as {
    url: string;
    key: string;
  }[],
  (get, set, v) => {
    const finalV = typeof v === "function" ? v(get(imageCacheAtom)) : v;
    set(imageCacheAtom, finalV);
    localforage.setItem("imageCache", finalV);
  },
);

export const isEditedAtom = atom(false, (get, set, v) => {
  const finalV = typeof v === "function" ? v(get(isEditedAtom)) : v;
  set(isEditedAtom, finalV);
  localforage.setItem("isEdited", finalV);
});
