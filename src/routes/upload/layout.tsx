import { OrderLayout } from "@/components/order-layout";
import { Outlet, useNavigate } from "@edenx/runtime/router";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, type JSX } from "react";
import { getSubOrderId, subOrderIdAtom } from "./store";

const Layout = (): JSX.Element => {
  const [orderId, setOrderId] = useAtom(subOrderIdAtom);
  const navigate = useNavigate();
  const setSubOrderId = useSetAtom(subOrderIdAtom);
  const subOrderId = getSubOrderId();

  useEffect(() => {
    setOrderId(subOrderId || "");
    setSubOrderId(subOrderId || "");
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
