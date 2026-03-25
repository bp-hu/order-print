import { IS_MERCHANT } from "@/consts";
import { imageCacheAtom, orderIdAtom, refreshOrderAtom } from "@/stores";
import { cn } from "@auix/utils";
import { Outlet, useNavigate } from "@edenx/runtime/router";
import { useAtom, useSetAtom } from "jotai";
import localforage from "localforage";
import { useEffect, type JSX } from "react";
import CannonBannerSVG from "./canon-banner.svg";
import "./index.css";

const Layout = (): JSX.Element => {
  const [orderId, setOrderId] = useAtom(orderIdAtom);
  const navigate = useNavigate();
  const refreshOrder = useSetAtom(refreshOrderAtom);
  const setImageCache = useSetAtom(imageCacheAtom);

  useEffect(() => {
    (async () => {
      const imageCache = await localforage.getItem("imageCache");
      setImageCache(imageCache || []);
      if (orderId && location.pathname === "/") {
        refreshOrder()
          .then(() => {
            navigate("/order-detail");
          })
          .catch(() => {
            setOrderId("");
          });
      }
    })();
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
      <div className="flex items-center justify-center">
        <div
          className={cn("relative min-w-[360px]", {
            "max-w-[800px] p-xs": !IS_MERCHANT,
            "px-xl": IS_MERCHANT,
          })}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
