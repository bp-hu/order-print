import { imageListAtom } from "@/stores";
import { IconRedo, IconSave, IconUpload } from "@douyinfe/semi-icons";
import { IllustrationNoContent } from "@douyinfe/semi-illustrations";
import { Button, Empty, Modal, Toast, Upload } from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom } from "jotai";
import { useState } from "react";
import ImageHistory from "./image-history";
import ImageList from "./image-list";

function fileToDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      resolve(e.target.result); // data:image/png;base64,...
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default () => {
  const [type, setType] = useState<"custom" | "host" | undefined>(undefined);
  const [imageList, setImageList] = useAtom(imageListAtom);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-36px)]">
        <div className="flex flex-wrap gap-3xs">
          <Upload
            action="https://api.semi.design/upload"
            showUploadList={false}
            customRequest={async (file) => {
              const imageUrl = await fileToDataURL(file.fileInstance);
              setImageList([...imageList, imageUrl]);
            }}
          >
            <Button size="small" icon={<IconUpload />} theme="solid">
              上传图片
            </Button>
          </Upload>
          <ImageHistory />
          <Button
            className="ml-auto"
            size="small"
            onClick={() => setPreviewVisible(true)}
          >
            预览
          </Button>
          <Button
            size="small"
            theme="borderless"
            className="ml-3xs"
            icon={<IconRedo className="ml-auto text-primary" />}
            onClick={() => navigate("/order-detail")}
          >
            返回
          </Button>
        </div>
        <div className="flex-1 py-md">
          {imageList.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Empty
                image={<IllustrationNoContent />}
                description="还未添加任何图片，点击上方按钮添加图片"
              />
            </div>
          ) : null}
          <ImageList
            visible={previewVisible}
            onVisibleChange={setPreviewVisible}
            editable={type === "custom"}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full flex items-center shadow-md rounded-full border border-border-0">
          <div className="flex-1 text-danger p-md">
            总计：{imageList.length}/10
          </div>
          <Button
            icon={<IconSave />}
            disabled={imageList.length === 0}
            theme="solid"
            className="h-full flex-1 p-md border-l border-border-0 flex items-center justify-center gap-3xs rounded-full"
            onClick={() => {
              navigate("/order-detail");
              Toast.success("保存成功");
            }}
          >
            保存设计
          </Button>
        </div>
      </div>
      {!type ? (
        <Modal
          visible={true}
          title="请选择裁剪方式"
          footer={null}
          closable={false}
          width={360}
          bodyStyle={{
            paddingBottom: 24,
          }}
        >
          <div className="flex flex-col gap-lg">
            <div
              onClick={() => {
                setType("custom");
              }}
              className="border border-border-0 rounded-md flex flex-col gap-md items-center justify-center h-[80px] cursor-pointer hover:bg-primary-bg-hover hover:border-primary-hover"
            >
              <div className="font-semibold text-primary">自己处理</div>
              <div>
                所见所得，<span className="text-danger">发货速度更快</span>
              </div>
            </div>
            <div
              onClick={() => {
                setType("host");
              }}
              className="border border-border-0 rounded-md flex flex-col items-center justify-center h-[80px] cursor-pointer hover:bg-primary-bg-hover hover:border-primary-hover"
            >
              <div className="font-semibold text-primary">卖家处理</div>
              <div>交给我们，省时省力</div>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
};
