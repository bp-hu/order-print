import { imageListAtom, orderIdAtom } from "@/stores";
import {
  IconFile,
  IconInfoCircle,
  IconRedo,
  IconUpload,
} from "@douyinfe/semi-icons";
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
      <div className="flex items-center">
        <h5 className="text-primary font-semibold flex items-center gap-3xs">
          <IconFile />
          订单详情
        </h5>
        <Button
          theme="borderless"
          className="ml-auto"
          icon={<IconRedo className="ml-auto text-primary" />}
          onClick={() => navigate("/")}
        >
          返回
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
      {imageList.length < 10 ? (
        <div className="typo-sm text-danger flex items-center gap-3xs">
          <IconInfoCircle size="small" />
          照片数不足 10 张
        </div>
      ) : null}
      <Button size="large" theme="solid" disabled={imageList.length < 10}>
        提交印刷
      </Button>
    </div>
  );
};
