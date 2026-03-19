import { PHOTO_SIZES } from "@/consts";
import { getImageInfoList } from "@/servers";
import { IOrder } from "@/typings/index";
import { http } from "@/utils/http";
import { atom } from "jotai";

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
      nextOrder.images = (nextOrder.images || []).map((image: any) => ({
        ...image,
        ...imageInfos[image.id],
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
  const photoSize = PHOTO_SIZES[order?.photo_size as keyof typeof PHOTO_SIZES];
  return photoSize ? photoSize.w / photoSize.h : 0.4;
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
