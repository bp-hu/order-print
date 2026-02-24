import { imageListAtom, orderIdAtom } from "@/stores";
import { IconUpload } from "@douyinfe/semi-icons";
import { Button, Divider, Image, Typography } from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtomValue } from "jotai";
import History from "./history";

const { Text } = Typography;

export default () => {
  const navigate = useNavigate();
  const orderId = useAtomValue(orderIdAtom);
  const imageList = useAtomValue(imageListAtom);

  // if (!orderId) {
  //   navigate("/");
  //   return null;
  // }

  return (
    <div className="flex flex-col gap-md">
      <div className="relative flex items-center">
        <h5 className="text-text-0 text-center font-semibold flex-1">
          设计列表
        </h5>
        <Button
          className="absolute right-0"
          theme="borderless"
          onClick={() => navigate("/")}
        >
          验证其他订单
        </Button>
      </div>
      <Divider layout="horizontal" />
      <div className="shadow-md p-md rounded-md flex gap-3xs">
        <div className="flex gap-lg">
          <Image
            width={100}
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772"
          />
          <div className="ml-auot flex flex-col gap-3xs">
            <Text type="secondary">订单号：{orderId}</Text>
            <Text type="secondary">淘宝套餐 乐凯绒面 6寸白边 10</Text>
          </div>
        </div>
        <div className="ml-auto flex flex-col gap-md">
          <Button
            size="small"
            icon={<IconUpload />}
            theme="solid"
            onClick={() => {
              navigate("/upload");
            }}
          >
            上传图片
          </Button>
          <History />
        </div>
      </div>
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
  );
};
