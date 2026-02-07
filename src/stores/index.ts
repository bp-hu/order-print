import { atom } from "jotai";
import localforage from "localforage";

export const orderIdAtom = atom<string>("");

const _imageListAtom = atom<string[]>([]);
export const imageListAtom = atom([] as string[], (get, set, v) => {
  set(imageListAtom, v);
  localforage.setItem("imageList", v);
});
