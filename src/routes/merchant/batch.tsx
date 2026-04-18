import { MERCHANT_STATUS_COLOR } from "@/consts";
import { download } from "@/utils";
import { http } from "@/utils/http";
import { Badge, Button, Form, Modal, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useRequest } from "@safe-fe/hooks";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import {
  batchModeAtom,
  merchantStatusAtom,
  refreshOrderListAtom,
  selectedKeysAtom,
} from "./store";

export function Batch() {
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const [selectedKeys, setSelectedKeys] = useAtom(selectedKeysAtom);
  const refresh = useSetAtom(refreshOrderListAtom);
  const [visible, setVisible] = useState(false);
  const formRef = useRef<FormApi>(undefined);
  const merchantStatus = useAtomValue(merchantStatusAtom);
  const { run: batchUpdateOrder, loading } = useRequest((params) =>
    http
      .put(`/orders/batch_update/${params.orderIds?.join(",")}`, params, {
        withCredentials: false,
      })
      .then(() => {
        setVisible(false);
        Toast.success("批量编辑成功");
        setSelectedKeys([]);
        setBatchMode(false);
        refresh();
      }),
  );

  return (
    <>
      {!batchMode ? (
        <Button
          onClick={() => {
            setBatchMode(true);
          }}
        >
          批量操作
        </Button>
      ) : null}
      {batchMode ? (
        <>
          <Badge count={selectedKeys.length}>
            <Button
              disabled={!selectedKeys.length}
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
                  async onOk() {
                    const res = await http.get(
                      `/images/${selectedKeys.join(",")}/orders_zip/download_zip`,
                    );
                    (res.downloads || []).forEach((item) => {
                      download(item.url);
                    });
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
            disabled={!selectedKeys.length}
            onClick={() => setVisible(true)}
          >
            编辑
          </Button>
          <Modal
            title="批量编辑订单"
            visible={visible}
            onCancel={() => setVisible(false)}
            onOk={async () => {
              const form = formRef.current;
              await form?.validate();
              const values = form?.getValues();
              values.orderIds = selectedKeys;
              await batchUpdateOrder(values);
            }}
            okButtonProps={{
              loading,
            }}
          >
            <Form getFormApi={(formApi) => (formRef.current = formApi)}>
              <Form.Select
                placeholder="请选择商家状态"
                label="商家状态"
                field="merchant_status"
                optionList={merchantStatus.map((v) => ({
                  label: <div className={MERCHANT_STATUS_COLOR[v]}>{v}</div>,
                  value: v,
                }))}
              />
            </Form>
          </Modal>
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
