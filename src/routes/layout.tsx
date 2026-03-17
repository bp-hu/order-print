import { orderIdAtom, refreshOrderAtom } from "@/stores";
import { Outlet, useNavigate } from "@edenx/runtime/router";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, type JSX } from "react";
import CannonBannerSVG from "./canon-banner.svg";
import "./index.css";

const Layout = (): JSX.Element => {
  const [orderId, setOrderId] = useAtom(orderIdAtom);
  const navigate = useNavigate();
  const refreshOrder = useSetAtom(refreshOrderAtom);

  useEffect(() => {
    if (orderId && location.pathname === "/") {
      refreshOrder()
        .then(() => {
          navigate("/order-detail");
        })
        .catch(() => {
          setOrderId("");
        });
    }
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
