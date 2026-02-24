import { countAtom, imageListAtom, totalAtom } from "@/stores";
import { single } from "@/utils";
import { IconSave, IconUpload } from "@douyinfe/semi-icons";
import { IllustrationNoContent } from "@douyinfe/semi-illustrations";
import { Badge, Button, Empty, Modal, Toast, Upload } from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom, useAtomValue } from "jotai";
import { useRef, useState } from "react";
import { Batch } from "./batch";
import ImageHistory from "./image-history";
import ImageList from "./image-list";
import { PreviewPrint } from "./preview-print";

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
  // const [type, setType] = useState<"custom" | "host" | undefined>(undefined);
  const [imageList, setImageList] = useAtom(imageListAtom);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const total = useAtomValue(totalAtom);
  const count = useAtomValue(countAtom);
  const uploadRef = useRef<Upload>(null);

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-36px)]">
        <div className="flex flex-wrap gap-xs">
          <PreviewPrint />
          <div className="flex items-center gap-xs ml-auto">
            <ImageHistory />
            <Upload
              ref={uploadRef}
              action="https://api.semi.design/upload"
              showUploadList={false}
              multiple
              beforeUpload={({ fileList }) => {
                if (count + fileList.length > total) {
                  single(
                    "upload-error",
                    () =>
                      new Promise((resolve, reject) => {
                        Modal.error({
                          width: "100vw",
                          content: `照片数量不能超过 ${total} 张`,
                          onOk: resolve,
                          onCancel: reject,
                        });
                      }),
                  );
                  return {
                    shouldUpload: false,
                  };
                }

                return {
                  shouldUpload: true,
                };
              }}
              customRequest={async (file) => {
                const imageUrl = await fileToDataURL(file.fileInstance);
                setImageList((prev: any) => [
                  ...prev,
                  {
                    url: imageUrl,
                    count: 1,
                  },
                ]);
              }}
            >
              <Button size="small" icon={<IconUpload />} theme="solid">
                上传图片
              </Button>
            </Upload>
            <Badge type="danger" count={total} countClassName="right-[6px]">
              <Button size="small" theme="borderless">
                3.5*5寸
              </Button>
            </Badge>
            {/* <Button
            size="small"
            theme="borderless"
            className="ml-3xs"
            type="tertiary"
            icon={<IconRedo className="ml-auto text-text-2" />}
            onClick={() => navigate("/order-detail")}
          >
            返回
          </Button> */}
          </div>
        </div>
        <Batch />
        <div className="mt-xs text-danger typo-sm">
          虚线框为照片打印区域，不满意可点击“编辑”调整
        </div>
        <div className="flex-1 py-md pb-[72px]">
          {imageList.length === 0 ? (
            <div
              className="h-full flex items-center justify-center"
              onClick={() => {
                uploadRef.current?.openFileDialog();
              }}
            >
              <Empty
                image={<IllustrationNoContent />}
                description="还未添加任何图片，点击添加图片"
              />
            </div>
          ) : null}
          <ImageList
            visible={previewVisible}
            onVisibleChange={setPreviewVisible}
            editable
          />
        </div>
        <div className="fixed bottom-[8px] left-0 w-full bg-white flex items-center shadow-md rounded-full border border-border-0">
          <div className="flex-1 text-danger p-md">
            总计：{count}/{total}
          </div>
          <Button
            icon={<IconSave />}
            disabled={imageList.length === 0}
            theme="solid"
            className="h-full flex-1 p-md border-l border-border-0 flex items-center justify-center gap-3xs rounded-full"
            onClick={() => {
              if (count < total) {
                Modal.error({
                  width: "100vw",
                  closable: false,
                  content: `照片总数不足 ${total} 张！确认保存吗？`,
                  onOk: () => {
                    navigate("/order-detail");
                    Toast.success("保存成功");
                  },
                });
              } else {
                Modal.confirm({
                  width: "100vw",
                  closable: false,
                  content: "确认保存设计吗？",
                  onOk: () => {
                    navigate("/order-detail");
                    Toast.success("保存成功");
                  },
                });
              }
            }}
          >
            保存设计
          </Button>
        </div>
      </div>
      {/* {!type ? (
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
      ) : null} */}
    </>
  );
};
