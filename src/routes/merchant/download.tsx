import { IOrder } from "@/typings";
import { download } from "@/utils";
import { IconDownload } from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";

export function Download({ order }: { order: IOrder }) {
  return (
    <div className="relative">
      <Button
        type="primary"
        theme="solid"
        size="small"
        onClick={() => {
          download(
            `/api/v1/images/${order.order_number}/images_zip/download_zip`,
          );
        }}
        icon={<IconDownload />}
      >
        下载
      </Button>
    </div>
  );
}
