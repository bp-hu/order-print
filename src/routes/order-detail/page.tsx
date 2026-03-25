import { customerConfirm } from "@/servers";
import {
  countAtom,
  orderAtom,
  orderIdAtom,
  orderIsDoneAtom,
  refreshOrderAtom,
  showPrintTipAtom,
} from "@/stores";
import { IconFilledArrowUp, IconUpload } from "@douyinfe/semi-icons";
import {
  Button,
  Divider,
  Modal,
  Tag,
  Toast,
  Typography,
} from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

const { Text } = Typography;

export default () => {
  const navigate = useNavigate();
  const order = useAtomValue(orderAtom);
  const refreshOrder = useSetAtom(refreshOrderAtom);
  const setOrderId = useSetAtom(orderIdAtom);
  const [showPrintTip, setShowPrintTip] = useAtom(showPrintTipAtom);
  const maxCount = order?.max_photo_count || 0;
  const count = useAtomValue(countAtom);
  const isDesigned = count > 0;
  const isDone = useAtomValue(orderIsDoneAtom);

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
        <div className="shadow-md p-md rounded-md flex gap-3xs">
          <div className="flex gap-lg">
            <div className="ml-auot flex flex-col gap-3xs font-medium">
              <Text type="secondary">订单号：{order?.order_number}</Text>
              <Text type="secondary">订单名称：{order?.order_name}</Text>
            </div>
          </div>
          <div className="ml-auto flex flex-col gap-xs">
            {isDone ? (
              <Tag size="large" color="light-blue" className="font-medium">
                设计已提交
              </Tag>
            ) : (
              <Button
                size="small"
                icon={<IconUpload />}
                theme="solid"
                onClick={() => {
                  navigate(`/upload?id=${order?.order_number}`);
                }}
              >
                {isDesigned ? "修改设计" : "上传图片"}
              </Button>
            )}
            {/* <History /> */}
          </div>
        </div>
        {isDesigned && !isDone ? (
          <div>
            <Button
              className="w-full"
              theme="solid"
              type="danger"
              onClick={async () => {
                if (count < maxCount) {
                  Modal.error({
                    width: "100vw",
                    title: "重要提示",
                    content: `当前照片数不足 ${maxCount}，不允许提交`,
                  });
                  return;
                }
                await customerConfirm(order?.order_number || "");
                refreshOrder();
                Toast.success("提交成功");
              }}
            >
              提交印刷
            </Button>
          </div>
        ) : null}
        {isDone ? (
          <Button
            theme="solid"
            onClick={() => {
              navigate(`/upload?id=${order?.order_number}`);
            }}
          >
            查看设计
          </Button>
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
