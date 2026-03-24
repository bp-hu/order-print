import { IconDownload } from "@douyinfe/semi-icons";
import { Button } from "@douyinfe/semi-ui";
import { useRequest } from "@safe-fe/hooks";

async function downloadImage(imageUrl: string, filename?: string) {
  const image = await fetch(imageUrl);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement("a");
  link.href = imageURL;
  link.download = filename || imageUrl.split("/").pop() || "image.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function Download({ orderNumber }: { orderNumber: string }) {
  const { run, loading } = useRequest(() =>
    downloadImage(
      `/api/v1/images/${orderNumber}/images_zip/download_zip`,
      `images_${orderNumber}.zip`,
    ),
  );

  return (
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
  );
}
