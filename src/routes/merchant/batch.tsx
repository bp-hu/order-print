import { download } from "@/utils";
import { Badge, Button, Modal } from "@douyinfe/semi-ui";
import { useAtom } from "jotai";
import { batchModeAtom, selectedKeysAtom } from "./store";

export function Batch() {
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const [selectedKeys, setSelectedKeys] = useAtom(selectedKeysAtom);

  return (
    <>
      {!batchMode ? (
        <Button
          onClick={() => {
            setBatchMode(true);
          }}
        >
          批量下载
        </Button>
      ) : null}
      {batchMode ? (
        <>
          <Badge count={selectedKeys.length}>
            <Button
              onClick={() => {
                Modal.confirm({
                  title: "确认下载",
                  content: (
                    <div>
                      <div>确认下载以下订单的照片：</div>
                      <ul>
                        {selectedKeys.map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                  onOk() {
                    download(
                      `/api/v1/images/${selectedKeys.join(",")}/orders_zip/download_zip`,
                    );
                    setSelectedKeys([]);
                    setBatchMode(false);
                  },
                });
              }}
            >
              下载
            </Button>
          </Badge>
          <Button
            onClick={() => {
              setBatchMode(false);
            }}
          >
            取消
          </Button>
        </>
      ) : null}
    </>
  );
}
