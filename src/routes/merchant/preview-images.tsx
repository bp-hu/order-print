import { IconEyeOpened } from "@douyinfe/semi-icons";
import { Button, ImagePreview } from "@douyinfe/semi-ui";
import { useState } from "react";

export function PreviewImages({ images }: { images: string[] }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        type="tertiary"
        theme="light"
        size="small"
        icon={<IconEyeOpened />}
        onClick={() => setVisible(true)}
      >
        查看
      </Button>
      <ImagePreview
        src={images}
        visible={visible}
        onVisibleChange={setVisible}
        renderPreviewMenu={() => null}
      />
    </>
  );
}
