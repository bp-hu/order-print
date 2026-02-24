import { imageListAtom } from "@/stores";
import { cn } from "@auix/utils";
import {
  IconAlertTriangle,
  IconColorPalette,
  IconDelete,
  IconEdit,
  IconImage,
} from "@douyinfe/semi-icons";
import { Button, Modal, SideSheet, Switch } from "@douyinfe/semi-ui";
import { useAtom } from "jotai";
import { useState } from "react";
import { CountEditor } from "./count-editor";

export function Batch() {
  const [visible, setVisible] = useState(false);
  const [countVisible, setCountVisible] = useState(false);
  const [imageList, setImageList] = useAtom(imageListAtom);

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
          <div className="flex items-center gap-xs">
            自动调色
            <Switch />
          </div>
          <div className="flex">
            {[
              {
                icon: <IconColorPalette />,
                label: "智能裁剪",
                onClick: () => {
                  setVisible(false);
                },
              },
              {
                icon: <IconImage />,
                label: "两边留白",
                onClick: () => {
                  setVisible(false);
                },
              },
              {
                icon: <IconImage />,
                label: "单边留白",
                onClick: () => {
                  setVisible(false);
                },
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
                onOk() {
                  setImageList([]);
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
        onOk={(count) => {
          setImageList(imageList.map((v) => ({ ...v, count })));
        }}
      />
    </>
  );
}
