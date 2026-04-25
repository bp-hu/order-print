import { isEditedAtom, showPrintTipAtom } from "@/stores";
import { IconAlertTriangle, IconSave } from "@douyinfe/semi-icons";
import { IllustrationNoContent } from "@douyinfe/semi-illustrations";
import {
  Badge,
  Button,
  Checkbox,
  Empty,
  Modal,
  Toast,
  Upload,
} from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { Batch } from "./batch";
import ImageHistory from "./image-history";
import ImageList from "./image-list";
import { PreviewPrint } from "./preview-print";
import { countAtom, orderIsDoneAtom, subOrderAtom, totalAtom } from "./store";
import { Uploader } from "./uploader";

export default () => {
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const total = useAtomValue(totalAtom);
  const count = useAtomValue(countAtom);
  const uploadRef = useRef<Upload>(null);
  const order = useAtomValue(subOrderAtom);
  const isDone = useAtomValue(orderIsDoneAtom);
  const [isEdited, setIsEdited] = useAtom(isEditedAtom);
  const setShowPrintTip = useSetAtom(showPrintTipAtom);

  function onSave() {
    navigate("/order-detail");
    setShowPrintTip(true);
    Toast.success("保存成功");
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-72px)]">
        <div className="flex flex-wrap gap-xs">
          <PreviewPrint
            images={order?.images?.map((item) => `${item.url}/edited`) || []}
          />
          <div className="flex items-center gap-xs ml-auto">
            {isDone ? null : (
              <>
                <ImageHistory />
                <Uploader ref={uploadRef} />
              </>
            )}
            <Badge type="danger" count={total} countClassName="right-[6px]">
              <Button size="small" theme="borderless">
                {order?.photo_size}
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
        {isDone ? null : (
          <>
            <Batch />
            <div className="mt-xs text-danger typo-sm">
              上传照片时，按住 Ctrl 或 Command 选择多张照片。
              虚线框为照片打印区域，不满意可点击“编辑”调整
            </div>
          </>
        )}

        <div className="flex-1 py-md pb-[72px]">
          {order?.images.length === 0 ? (
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
          />
        </div>
        <div className="fixed bottom-[8px] left-0 w-full bg-white flex items-center shadow-md rounded-full border border-border-0">
          <div className="flex-1 text-danger p-md">
            总计：{count}/{total}
          </div>
          {isDone ? (
            <Button
              onClick={() => {
                navigate("/order-detail");
              }}
              className="h-full flex-1 p-md border-l border-border-0 flex items-center justify-center gap-3xs rounded-full"
            >
              返回订单
            </Button>
          ) : (
            <Button
              icon={<IconSave />}
              disabled={order?.images.length === 0}
              theme="solid"
              className="h-full flex-1 p-md border-l border-border-0 flex items-center justify-center gap-3xs rounded-full"
              onClick={() => {
                if (!isEdited) {
                  Modal.confirm({
                    width: "100vw",
                    closable: false,
                    title: "重要提示",
                    icon: (
                      <IconAlertTriangle
                        style={{ color: "var(--semi-color-danger)" }}
                      />
                    ),
                    cancelButtonProps: {
                      style: {
                        display: "none",
                      },
                    },
                    content: (
                      <div className="flex flex-col gap-md">
                        预览效果为最终出片效果哦，您已调整好裁剪位置了吗？（请您手动调整照片画面的裁切区域，以免主体画面被过度裁切，预览效果为最终出效果）
                        <div>
                          <Checkbox
                            onChange={(e) => {
                              setIsEdited(e.target.checked);
                            }}
                          >
                            请确认您已阅读并悉知以上内容
                          </Checkbox>
                        </div>
                      </div>
                    ),
                  });
                } else {
                  if (count < total) {
                    Modal.error({
                      width: "100vw",
                      closable: false,
                      content: `照片总数不足 ${total} 张！确认保存吗？`,
                      onOk: onSave,
                    });
                  } else {
                    Modal.confirm({
                      width: "100vw",
                      closable: false,
                      content: "确认保存设计吗？",
                      onOk: onSave,
                    });
                  }
                }
              }}
            >
              保存设计
            </Button>
          )}
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
