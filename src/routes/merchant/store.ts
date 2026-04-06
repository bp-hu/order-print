import { IOrder } from "@/typings/index";
import { http } from "@/utils/http";
import { atom } from "jotai";

export const orderListAtom = atom<IOrder[]>([]);
export const loadingAtom = atom<boolean>(false);
export const customerStatusAtom = atom<string[]>([]);
export const merchantStatusAtom = atom<string[]>([]);
export const orderTypeListAtom = atom<string[]>([]);
export const selectedKeysAtom = atom<string[]>([]);
export const batchModeAtom = atom<boolean>(false);
export const refreshOrderlistAtom = atom(null, async (_, set) => {
  set(loadingAtom, true);
  try {
    const [orderList, customerStatus, merchantStatus, orderTypeList] =
      await Promise.all([
        http.get(
          "/orders",
          {},
          {
            withCredentials: false,
          },
        ),
        http.get("/param/customer-statuses"),
        http.get("/param/merchant-statuses"),
        http.get("/param/order-type"),
      ]);
    set(orderListAtom, orderList || []);
    set(customerStatusAtom, customerStatus || []);
    set(merchantStatusAtom, merchantStatus || []);
    set(orderTypeListAtom, orderTypeList || []);
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
