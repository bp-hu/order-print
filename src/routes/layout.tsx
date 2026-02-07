import { imageListAtom } from "@/stores";
import { Outlet } from "@edenx/runtime/router";
import { useSetAtom } from "jotai";
import localforage from "localforage";
import { useEffect, type JSX } from "react";
import "./index.css";

const Layout = (): JSX.Element => {
  const setImageList = useSetAtom(imageListAtom);

  useEffect(() => {
    localforage.getItem<string[]>("imageList").then((imageList) => {
      if (imageList) {
        setImageList(imageList);
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center p-lg">
      <div className="relative min-w-[600px] max-w-[800px]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
