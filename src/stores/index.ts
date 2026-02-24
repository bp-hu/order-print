import { ClipLayout, ClipType } from "@/typings";
import { atom } from "jotai";
import localforage from "localforage";

export const totalAtom = atom<number>(10);
export const orderIdAtom = atom<string>("");
export const imageListAtom = atom(
  [] as {
    url: string;
    count: number;
    clipType: ClipType;
    layout: ClipLayout;
    autoToning: boolean;
    angle: number;
  }[],
  (get, set, v) => {
    const finalV = typeof v === "function" ? v(get(imageListAtom)) : v;
    set(imageListAtom, finalV);
    localforage.setItem("imageList", finalV);
  },
);
export const countAtom = atom<number>((get) =>
  get(imageListAtom).reduce((acc, cur) => acc + cur.count, 0),
);
