import { imageListAtom } from "@/stores";
import { IconCheckCircleStroked, IconHistory } from "@douyinfe/semi-icons";
import { Button, Image, SideSheet, Tag, Typography } from "@douyinfe/semi-ui";
import { useAtomValue } from "jotai";
import { useState } from "react";

const { Text } = Typography;

export default () => {
  const [visible, setVisible] = useState(false);
  const imageList = useAtomValue(imageListAtom);
  const [selectedKeys, setSelectedKeys] = useState([] as string[]);

  return (
    <>
      <Text
        size="small"
        icon={<IconHistory />}
        onClick={() => setVisible(true)}
      >
        历史图片
      </Text>
      <SideSheet
        title="历史图片"
        width="100vw"
        placement="bottom"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <div className="flex justify-end gap-md">
            <Button onClick={() => setVisible(false)}>取消</Button>
            <Button
              type="primary"
              theme="solid"
              onClick={() => {
                setVisible(false);
                setSelectedKeys([]);
              }}
            >
              导入
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-md">
          <Tag size="large">2026-02-07</Tag>
          <div className="flex flex-wrap gap-md">
            {imageList.map(({ url }, index) => {
              const isSelected = selectedKeys.includes(url);
              return (
                <div
                  key={index}
                  className="relative rounded-md cursor-pointer hover:[&_[data-slot=check]]:visible"
                  onClick={() =>
                    setSelectedKeys(
                      isSelected
                        ? selectedKeys.filter((item) => item !== url)
                        : [...selectedKeys, url],
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
                </div>
              );
            })}
          </div>
        </div>
      </SideSheet>
    </>
  );
};
