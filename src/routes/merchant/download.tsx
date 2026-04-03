import { IOrder } from "@/typings";
import { IconDownload } from "@douyinfe/semi-icons";
import { Button, Progress } from "@douyinfe/semi-ui";
import { useRequest } from "@safe-fe/hooks";
import { useState } from "react";

async function downloadImage(
  imageUrl: string,
  {
    filename,
    onProgress,
  }: {
    filename?: string;
    onProgress?: (options: { loaded: number; total: number }) => void;
  },
) {
  const response = await fetch(imageUrl);
  const contentLength =
    response.headers.get("content-length") ||
    response.headers.get("x-anyproxy-origin-content-length") ||
    "0";
  const total = parseInt(contentLength, 10);
  const values: any[] = [];
  let loaded = 0;

  const reader = response.body?.getReader();
  while (reader) {
    try {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      values.push(value);
      loaded += value.byteLength;
      onProgress?.({ loaded, total });
    } catch (error) {
      console.log(error);
      break;
    }
  }

  const imageBlog = new Blob(values);
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement("a");
  link.href = imageURL;
  link.download = filename || imageUrl.split("/").pop() || "image.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function Download({ order }: { order: IOrder }) {
  const [progress, setProgress] = useState(0);
  const { run, loading } = useRequest(() =>
    downloadImage(
      `/api/v1/images/${order.order_number}/images_zip/download_zip`,
      {
        filename: `${order.order_number}_${order.photo_size}_${order.max_photo_count}_${order.order_name}.zip`,
        onProgress({ loaded, total }) {
          setProgress(loaded / total);
        },
      },
    ),
  );

  return (
    <div className="relative">
      <Button
        type="primary"
        theme="solid"
        size="small"
        onClick={run}
        icon={<IconDownload />}
        loading={loading}
      >
        下载
      </Button>
      {loading ? (
        <Progress
          className="absolute bottom-[-6px] left-0 w-full"
          stroke="var(--semi-color-danger-light-active)"
          percent={progress}
        />
      ) : null}
    </div>
  );
}
