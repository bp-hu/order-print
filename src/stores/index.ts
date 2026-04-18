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

export const orderAtom = atom<IOrder | undefined>(undefined);
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
    const nextOrder = res
      ? {
          ...res,
          images: (res.images || []).map((id: string) => ({
            id,
            url: `/api/v1/images/${orderId}/${id}`,
          })),
        }
      : undefined;

    const imageIds = (res.images || []).map((id: string) => id);
    if (nextOrder && imageIds.length) {
      const imageInfoList = await getImageInfoList(orderId, imageIds);
      const imageInfos = (imageInfoList?.images || []).reduce(
        (acc: any, cur: any) => {
          acc[cur.id] = cur;
          return acc;
        },
        {} as Record<string, any>,
      );
      const imageCache = get(imageCacheAtom);
      nextOrder.images = (nextOrder.images || []).map((image: any) => ({
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

    set(orderAtom, nextOrder);
  } finally {
    set(orderLoadingAtom, false);
  }
});
export const paperRatioAtom = atom<number>((get) => {
  const order = get(orderAtom);
  const photoSize = order
    ? {
        w: order.paper_w || 0,
        h: order.paper_h || 0,
      }
    : undefined;
  return photoSize ? photoSize.w / photoSize.h : 0.4;
});
export const orderIsDoneAtom = atom<boolean>((get) => {
  const order = get(orderAtom);
  return order?.customer_status === "照片已上传";
});
export const totalAtom = atom<number>((get) => {
  const order = get(orderAtom);
  return order?.max_photo_count || 0;
});
export const countAtom = atom<number>(
  (get) =>
    get(orderAtom)?.images?.reduce(
      (acc, cur) => acc + cur.edited_params?.count,
      0,
    ) || 0,
);

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
