import { imageListAtom } from "@/stores";
import { Outlet } from "@edenx/runtime/router";
import { useSetAtom } from "jotai";
import localforage from "localforage";
import { useEffect, type JSX } from "react";
import CannonBannerSVG from "./canon-banner.svg";
import "./index.css";

const Layout = (): JSX.Element => {
  const setImageList = useSetAtom(imageListAtom);

  useEffect(() => {
    localforage.getItem<string[]>("imageList").then((imageList) => {
      if (imageList) {
        setImageList(
          imageList.map((v) =>
            typeof v === "string"
              ? {
                  url: v,
                  count: 1,
                }
              : v,
          ),
        );
      }
    });
  }, []);

  return (
    <div>
      <div className="p-md">
        <img
          className="w-full max-h-[80px]"
          src={CannonBannerSVG}
          alt="cannon-banner"
        />
      </div>
      <div className="flex items-center justify-center p-xs">
        <div className="relative min-w-[360px] max-w-[800px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
