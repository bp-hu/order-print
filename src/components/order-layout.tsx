import {
  orderAtom,
  orderIdAtom,
  orderLoadingAtom,
  refreshOrderAtom,
} from "@/stores";
import { Spin } from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ReactNode, useEffect } from "react";

export const OrderLayout = ({ children }: { children: ReactNode }) => {
  const orderIdQuery = new URLSearchParams(window.location.search).get("id");
  const navigate = useNavigate();
  const [orderId, setOrderId] = useAtom(orderIdAtom);
  const order = useAtomValue(orderAtom);
  const refreshOrder = useSetAtom(refreshOrderAtom);
  const loading = useAtomValue(orderLoadingAtom);
  const id = orderIdQuery || orderId;

  useEffect(() => {
    if (!id) {
      navigate("/");
    } else if (!order || order.order_number !== id) {
      setOrderId(id);
      refreshOrder().catch(() => {
        setOrderId("");
        navigate("/");
      });
    }
  }, [id]);

  if (!id) {
    return <></>;
  }

  return <Spin spinning={loading}>{children}</Spin>;
};
