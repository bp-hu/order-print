import { OrderLayout } from "@/components/order-layout";
import { Outlet } from "@edenx/runtime/router";
import { type JSX } from "react";

const Layout = (): JSX.Element => {
  return (
    <OrderLayout>
      <Outlet />
    </OrderLayout>
  );
};

export default Layout;
