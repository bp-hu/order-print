import { customerConfirm } from "@/servers";
import {
  orderAtom,
  orderIdAtom,
  refreshOrderAtom,
  showPrintTipAtom,
} from "@/stores";
import { IconFilledArrowUp, IconUpload } from "@douyinfe/semi-icons";
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef } from "react";

const { Text } = Typography;

export default () => {
  const navigate = useNavigate();
  const order = useAtomValue(orderAtom);
  const refreshOrder = useSetAtom(refreshOrderAtom);
  const setOrderId = useSetAtom(orderIdAtom);
  const [showPrintTip, setShowPrintTip] = useAtom(showPrintTipAtom);
  const count = useMemo(
    () =>
      order?.orders.reduce(
        (prev, cur) =>
          prev +
          (cur.images?.reduce(
            (acc, cur) => acc + (cur.edited_params?.count || 0),
            0,
          ) || 0),
        0,
      ) || 0,
    [order],
  );
  const isDesigned = count > 0;
  const isDone = useMemo(
    () => order?.orders.every((item) => item.customer_status === "照片已上传"),
    [order],
  );
  const isConfirmedRef = useRef<boolean>(false);

  return (
    <>
      {showPrintTip && isDesigned ? (
        <div className="fixed left-0 top-0 w-full h-full bg-black/50">
          <div className="absolute top-[250px] text-white p-md">
            <div
              className="underline"
              onClick={() => {
                setShowPrintTip(false);
              }}
            >
              我知道了
            </div>
            <div className="text-[16px] font-medium mt-[12px]">
              请点击“提交印刷”，您的设计将会进入生产。若未点击“提交印刷”，将不会进入生产可随时修改。文件保存30天，过期后需重新设计！
            </div>
            <IconFilledArrowUp className="text-[36px] absolute right-[64px] top-[-12px]" />
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-md">
        <div className="relative flex items-center">
          <h5 className="text-text-0 text-center font-semibold flex-1">
            设计列表
          </h5>
          <Button
            className="absolute right-0"
            theme="borderless"
            onClick={() => {
              Modal.confirm({
                title: "确认验证其他订单吗？",
                content: "退出当前订单的设计，验证另一订单",
                width: "100vw",
                onOk: () => {
                  // 验证其他订单时，需要清空当前订单号
                  setOrderId("");
                  navigate("/");
                },
              });
            }}
          >
            验证其他订单
          </Button>
        </div>
        <Divider layout="horizontal" />
        <div className="flex flex-col gap-md">
          {order?.orders.map((item) => (
            <div className="shadow-md p-md rounded-md flex gap-3xs">
              <div className="flex gap-lg">
                <div className="ml-auot flex flex-col gap-3xs font-medium">
                  <Text type="secondary">订单号：{item?.order_number}</Text>
                  <Text type="secondary">订单名称：{item?.order_name}</Text>
                  <Text type="secondary">
                    照片数量：
                    {item?.images?.reduce(
                      (acc, cur) => acc + (cur.edited_params?.count || 0),
                      0,
                    ) || 0}
                    /{item?.max_photo_count}
                  </Text>
                </div>
              </div>
              <div className="ml-auto flex flex-col gap-xs">
                {item.customer_status === "照片已上传" ? (
                  <div className="flex flex-col gap-md">
                    <Button
                      size="small"
                      theme="solid"
                      onClick={() => {
                        navigate(
                          `/upload?id=${order?.order_number}&subOrderId=${item?.order_number}`,
                        );
                      }}
                    >
                      查看设计
                    </Button>
                    <span className="text-primary text-center font-medium">
                      提交成功
                    </span>
                  </div>
                ) : (
                  <Button
                    size="small"
                    icon={<IconUpload />}
                    theme="solid"
                    onClick={() => {
                      navigate(
                        `/upload?id=${order?.order_number}&subOrderId=${item?.order_number}`,
                      );
                    }}
                  >
                    {isDesigned ? "修改设计" : "上传图片"}
                  </Button>
                )}
                {/* <History /> */}
              </div>
            </div>
          ))}
        </div>

        {isDesigned && !isDone ? (
          <div>
            <Button
              className="w-full"
              theme="solid"
              type="danger"
              onClick={async () => {
                const subOrder = order?.orders.find(
                  (item) =>
                    (item.images || []).reduce(
                      (acc, cur) => acc + (cur.edited_params?.count || 0),
                      0,
                    ) < item.max_photo_count,
                );
                if (subOrder) {
                  Modal.error({
                    width: "100vw",
                    title: "重要提示",
                    content: `订单（${subOrder.order_number}）照片数不足 ${subOrder.max_photo_count}，不允许提交`,
                  });
                  return;
                }

                Modal.confirm({
                  title: "确认提交印刷吗？",
                  width: "100vw",
                  content: (
                    <div className="flex flex-col gap-md">
                      提交前请您仔细确认下方内容!
                      <ul className="flex flex-col gap-xs">
                        <li>
                          ●本品为定制类商品，提交订单后即刻进入生产流程（不能修改），非生产质量问题不退不换。
                        </li>
                        <li>
                          ●已确认照片均已按要求调整了裁切框（未裁切到重要信息位置且预留2mm误差范围）。
                        </li>
                        <li>
                          ●已确认所有设计均已调整完毕（包含但不仅限于重复照片、重复设计、裁切框、留白等信息）。
                        </li>
                        <li>
                          ●已确认模糊不清（包含但不仅限于分辨率低，对焦不准）的照片可正常印制。
                        </li>
                        <li>
                          ●提交照片后，请保持电话畅通，如遇快递停发等因素，佳能冲印团队将及时联系您。
                        </li>
                      </ul>
                      <Checkbox
                        onChange={(e) => {
                          isConfirmedRef.current = e.target.checked ?? false;
                        }}
                      >
                        我已阅读并确认以上的内容
                      </Checkbox>
                    </div>
                  ),
                  async onOk() {
                    if (!isConfirmedRef.current) {
                      return;
                    }
                    await customerConfirm(order?.order_number || "");
                    refreshOrder();
                    Toast.success("提交成功");
                  },
                });
              }}
            >
              提交印刷
            </Button>
          </div>
        ) : null}
        {/* {imageList.length < 10 ? (
        <div className="typo-sm text-danger flex items-center gap-3xs">
          <IconInfoCircle size="small" />
          照片数不足 10 张
        </div>
      ) : null} */}
        {/* <Divider layout="horizontal" />
      <div className="flex flex-col gap-md">
        <h5 className="w-full text-center text-danger">猜你喜欢</h5>
        <div className="grid grid-cols-2 gap-md">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-md items-center justify-center"
            >
              <Image
                width={100}
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772"
              />
              <div className="text-text-1 typo-sm break-all">
                【大尺寸冲印】 8*10寸 套餐 多件有折扣
              </div>
            </div>
          ))}
        </div>
      </div> */}
      </div>
    </>
  );
};
