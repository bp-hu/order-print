import {
  deleteHistoryImageList,
  getImageInfo,
  recoverHistoryImageList,
} from "@/servers";
import { orderAtom, refreshOrderAtom } from "@/stores";
import { TImage } from "@/typings";
import {
  IconCheckCircleStroked,
  IconDelete,
  IconHistory,
} from "@douyinfe/semi-icons";
import { IllustrationIdle } from "@douyinfe/semi-illustrations";
import {
  Button,
  Empty,
  Image,
  Modal,
  SideSheet,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import dayjs from "dayjs";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";

const { Text } = Typography;

export default () => {
  const [visible, setVisible] = useState(false);
  const order = useAtomValue(orderAtom);
  const refreshOrder = useSetAtom(refreshOrderAtom);
  const imageIds = order?.history_images || [];
  const [images, setImages] = useState([] as TImage[]);
  const [selectedKeys, setSelectedKeys] = useState([] as string[]);
  const imagesGroup = useMemo(
    () =>
      images.reduce(
        (v, cur) => {
          const date = dayjs(cur.created_at).format("YYYY-MM-DD");
          v[date] = v[date] || [];
          v[date].push(cur);
          return v;
        },
        {} as Record<string, TImage[]>,
      ),
    [images],
  );
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!imageIds.length || !visible) {
      return;
    }

    (async () => {
      const imageList = await Promise.all(
        imageIds.map(async (id) =>
          getImageInfo(order?.order_number || "", id).then((res) => ({
            ...res,
            id,
            url: `/api/v1/images/${order?.order_number || ""}/${id}`,
          })),
        ),
      );
      setImages(imageList);
    })();
  }, [...imageIds, visible]);

  return (
    <>
      <Text
        size="small"
        icon={<IconHistory />}
        onClick={() => {
          setVisible(true);
        }}
      >
        历史图片
      </Text>
      <SideSheet
        title="历史图片"
        width="100vw"
        height="100vh"
        placement="bottom"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <div className="flex justify-end gap-md">
            <Button onClick={() => setVisible(false)}>取消</Button>
            <Button
              type="danger"
              theme="solid"
              disabled={!selectedKeys.length}
              loading={deleteLoading}
              onClick={() => {
                Modal.confirm({
                  title: "确认删除吗？",
                  content: "删除后将无法恢复",
                  width: "100vw",
                  onOk: async () => {
                    if (order) {
                      try {
                        setDeleteLoading(true);
                        await deleteHistoryImageList(
                          order?.order_number || "",
                          selectedKeys,
                        );
                        setSelectedKeys([]);
                        setImages(
                          images.filter(
                            (item) => !selectedKeys.includes(item.id),
                          ),
                        );
                        refreshOrder();
                      } finally {
                        setDeleteLoading(false);
                      }
                    }
                  },
                });
              }}
            >
              删除
            </Button>
            <Button
              type="primary"
              theme="solid"
              loading={recoverLoading}
              disabled={!selectedKeys.length}
              onClick={async () => {
                if (order) {
                  try {
                    setRecoverLoading(true);
                    await recoverHistoryImageList(
                      order.order_number || "",
                      selectedKeys,
                    );
                    setVisible(false);
                    setSelectedKeys([]);
                    Toast.success("导入成功");
                    refreshOrder();
                  } finally {
                    setRecoverLoading(false);
                  }
                }
              }}
            >
              导入
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-md">
          {Object.entries(imagesGroup).map(([date, list]) => (
            <div key={date} className="flex flex-col gap-md">
              <Tag className="w-full text-[16px] font-medium" size="large">
                {date}
              </Tag>
              <div className="flex flex-wrap gap-md">
                {list.map(({ url, id }, index) => {
                  const isSelected = selectedKeys.includes(id);
                  return (
                    <div
                      key={index}
                      className="relative rounded-md cursor-pointer hover:[&_[data-slot=delete]]:visible"
                      onClick={() =>
                        setSelectedKeys(
                          isSelected
                            ? selectedKeys.filter((item) => item !== id)
                            : [...selectedKeys, id],
                        )
                      }
                    >
                      <Image
                        src={url}
                        width={200}
                        alt={`lamp${index + 1}`}
                        style={{ marginRight: 5 }}
                        preview={false}
                      />
                      <IconCheckCircleStroked
                        data-slot="check"
                        className={`invisible text-white rounded-full bg-success absolute top-[4px] right-[8px] ${isSelected ? "visible" : "invisible"}`}
                      />
                      <IconDelete
                        data-slot="delete"
                        className="invisible absolute top-[24px] right-[8px] text-(--semi-color-danger)"
                        onClick={(e) => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: "确认删除吗？",
                            content: "删除后将无法恢复",
                            width: "100vw",
                            onOk: async () => {
                              if (order) {
                                await deleteHistoryImageList(
                                  order?.order_number || "",
                                  [id],
                                );
                                setImages(
                                  images.filter((item) => item.id !== id),
                                );
                                refreshOrder();
                              }
                            },
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(imagesGroup).length === 0 ? (
            <Empty
              className="mt-[24px]"
              title="暂无历史图片"
              image={<IllustrationIdle />}
            />
          ) : null}
        </div>
      </SideSheet>
    </>
  );
};
