import { IOrder } from "@/typings";
import { download } from "@/utils";
import { http } from "@/utils/http";
import { IconDownload } from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";
import { useState } from "react";

export function Download({ order }: { order: IOrder }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative">
      <Button
        type="primary"
        theme="solid"
        size="small"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const res = await http.get(
              `/images/${order.order_number}/images_zip/download_zip`,
            );
            download(res.url);
          } finally {
            setLoading(false);
          }
        }}
        icon={<IconDownload />}
      >
        下载
      </Button>
    </div>
  );
}
