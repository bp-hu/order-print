import { OrderLayout } from "@/components/order-layout";
import { Outlet, useNavigate } from "@edenx/runtime/router";
import { useAtom } from "jotai";
import { useEffect, type JSX } from "react";
import { subOrderIdAtom } from "./store";

const Layout = (): JSX.Element => {
  const [orderId, setOrderId] = useAtom(subOrderIdAtom);
  const navigate = useNavigate();
  const subOrderId = new URLSearchParams(
    window.location.href.split("?")[1],
  ).get("subOrderId");

  useEffect(() => {
    setOrderId(subOrderId || "");
  }, [subOrderId]);

  if (!orderId) {
    navigate("/");

    return <></>;
  }

  return (
    <OrderLayout>
      <Outlet />
    </OrderLayout>
  );
};

export default Layout;
