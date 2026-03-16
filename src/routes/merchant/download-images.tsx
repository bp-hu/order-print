import { IconDownload } from "@douyinfe/semi-icons";
import { Button, ImagePreview } from "@douyinfe/semi-ui";
import { useState } from "react";

export function DownloadImages({ images }: { images: string[] }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        type="primary"
        theme="solid"
        size="small"
        icon={<IconDownload />}
        onClick={() => setVisible(true)}
      >
        下载
      </Button>
      <ImagePreview
        src={images}
        visible={visible}
        onVisibleChange={setVisible}
        renderPreviewMenu={({ onDownload }) => (
          <Button
            className="text-white"
            icon={<IconDownload size="large" />}
            type="tertiary"
            size="large"
            onClick={onDownload}
          >
            下载图片
          </Button>
        )}
      />
    </>
  );
}
