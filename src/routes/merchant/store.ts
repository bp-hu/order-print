import { IOrder } from "@/typings/index";
import { http } from "@/utils/http";
import { atom } from "jotai";

export const orderListAtom = atom<IOrder[]>([]);
export const loadingAtom = atom<boolean>(false);
export const refreshOrderlistAtom = atom(null, async (_, set) => {
  set(loadingAtom, true);
  try {
    const res = await http.get(
      "/orders",
      {},
      {
        withCredentials: false,
      },
    );
    set(orderListAtom, res || []);
  } finally {
    set(loadingAtom, false);
  }
});

export const merchantIdAtom = atom(
  localStorage.getItem("merchantId") || "",
  (_, set, id: string) => {
    set(merchantIdAtom, id);
    if (id) {
      localStorage.setItem("merchantId", id);
    } else {
      localStorage.removeItem("merchantId");
    }
  },
);
