import { http } from "@/utils/http";
import { IconDelete } from "@douyinfe/semi-icons";
import { Button, Modal } from "@douyinfe/semi-ui";
import { useRequest } from "@safe-fe/hooks";
import { useSetAtom } from "jotai";
import { refreshOrderlistAtom } from "./store";

export function OrderRemove({ orderNumber }: { orderNumber: string }) {
  const { run: deleteOrder, loading } = useRequest(() =>
    http.delete(`/orders/${orderNumber}`),
  );
  const refresh = useSetAtom(refreshOrderlistAtom);

  return (
    <Button
      size="small"
      type="danger"
      icon={<IconDelete />}
      loading={loading}
      onClick={() => {
        Modal.confirm({
          title: "确认删除",
          content: "确认删除订单吗？",
          width: 400,
          onOk: () => {
            deleteOrder().then(() => {
              refresh();
            });
          },
        });
      }}
    >
      删除
    </Button>
  );
}
