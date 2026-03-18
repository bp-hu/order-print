import { deleteImageList, updateImageListParams } from "@/servers";
import { orderAtom } from "@/stores";
import { ClipType, EditParams } from "@/typings";
import { getPrintParams } from "@/utils";
import { cn } from "@auix/utils";
import {
  IconAlertTriangle,
  IconColorPalette,
  IconDelete,
  IconEdit,
  IconImage,
} from "@douyinfe/semi-icons";
import { Button, Modal, SideSheet, Toast } from "@douyinfe/semi-ui";
import { useAtom } from "jotai";
import { useState } from "react";
import { CountEditor } from "./count-editor";

export function Batch() {
  const [visible, setVisible] = useState(false);
  const [countVisible, setCountVisible] = useState(false);
  const [order, setOrder] = useAtom(orderAtom);
  const imageIds = (order?.images || [])?.map((v) => v.id || "");

  function getNextImages(clipType: ClipType) {
    return (order?.images || []).map((v) => {
      const editParams = v.edited_params as EditParams;
      return {
        ...v,
        edited_params: {
          ...v.edited_params,
          clipType,
          ...getPrintParams({
            pageSize: [editParams.paper_w || 0, editParams.paper_h || 0],
            layout: editParams.layout,
            clipType,
            imageSize: [
              editParams.naturalWidth || 0,
              editParams.naturalHeight || 0,
            ],
            clipPosPercent: [editParams.clipTopPercent || 0, 0],
            clipSizePercent: [0, editParams.clipHeightPercent || 0],
          }),
        },
      };
    });
  }

  async function handleBatchClip(clipType: ClipType) {
    if (!order) {
      setVisible(false);
      return;
    }
    const nextImages = getNextImages(clipType);
    await updateImageListParams(
      order?.order_number || "",
      nextImages.reduce(
        (pre, cur) => ({
          ...pre,
          [cur.id || ""]: cur.edited_params,
        }),
        {},
      ),
    );
    setOrder({
      ...order,
      images: nextImages,
    });
    setVisible(false);
  }

  return (
    <>
      <Button
        className="w-full mt-md"
        theme="light"
        onClick={() => setVisible(true)}
      >
        批量操作
      </Button>
      <SideSheet
        title={null}
        closable={false}
        visible={visible}
        onCancel={() => setVisible(false)}
        headerStyle={{
          display: "none",
        }}
        bodyStyle={{
          padding: 0,
          paddingTop: 24,
        }}
        placement="bottom"
      >
        <div className="flex flex-col gap-md">
          {/* <div className="flex items-center gap-xs">
            自动调色
            <Switch />
          </div> */}
          <div className="flex">
            {[
              {
                icon: <IconColorPalette />,
                label: "智能裁剪",
                onClick: () => handleBatchClip("auto"),
              },
              {
                icon: <IconImage />,
                label: "两边留白",
                onClick: () => handleBatchClip("margin"),
              },
              {
                icon: <IconImage />,
                label: "单边留白",
                onClick: () => handleBatchClip("single"),
              },
            ].map((v) => (
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-4xs flex-1 h-[54px] hover:bg-fill-1 px-4xs",
                )}
                onClick={v.onClick}
              >
                {v.icon}
                {v.label}
              </div>
            ))}
          </div>
          <Button
            icon={<IconEdit />}
            theme="solid"
            onClick={() => {
              setVisible(false);
              setCountVisible(true);
            }}
          >
            批量编辑数量
          </Button>
          <Button
            icon={<IconDelete />}
            type="danger"
            theme="solid"
            onClick={() => {
              Modal.confirm({
                width: "100vw",
                icon: (
                  <IconAlertTriangle
                    style={{ color: "var(--semi-color-danger)" }}
                  />
                ),
                title: "重要提示",
                content: "删除操作无法撤销，确认删除？",
                async onOk() {
                  const orderId = order?.order_number;

                  if (orderId && imageIds.length) {
                    await deleteImageList(orderId, imageIds);
                    setOrder({
                      ...order,
                      images: [],
                    });
                    Toast.success("删除成功");
                  }

                  setVisible(false);
                },
              });
            }}
          >
            批量删除
          </Button>
        </div>
      </SideSheet>
      <CountEditor
        visible={countVisible}
        setVisible={setCountVisible}
        onOk={async (count) => {
          if (order) {
            await updateImageListParams(
              order.order_number || "",
              order.images.reduce(
                (acc, item) => {
                  acc[item.id || ""] = {
                    ...item.edited_params,
                    count,
                  };
                  return acc;
                },
                {} as Record<string, EditParams>,
              ),
            );

            setOrder({
              ...order,
              images:
                order.images.map((item) => ({
                  ...item,
                  edited_params: { ...item.edited_params, count },
                })) || [],
            });
          }
        }}
      />
    </>
  );
}
