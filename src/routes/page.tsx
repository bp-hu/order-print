import { orderIdAtom } from "@/stores";
import { Button, Input } from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom } from "jotai";
import { useState } from "react";

export default () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useAtom(orderIdAtom);

  function submit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/order-detail");
    }, 300);
  }

  return (
    <div className="flex flex-col gap-xl">
      <div className="bg-white flex items-center justify-center h-[400px] bg-cover bg-[url('https://img.kanzheli.cn/images/extmall_bg.jpg')]">
        <div className="w-[320px] flex flex-col gap-xl bg-white px-lg py-md rounded-md">
          <h5 className="block w-full font-semibold text-success text-center">
            验证订单信息
          </h5>
          <Input
            size="large"
            placeholder="订单编号"
            value={orderId}
            onChange={setOrderId}
            onEnterPress={() => {
              if (orderId) {
                submit();
              }
            }}
          />
          <Button
            className="w-full"
            theme="solid"
            size="large"
            disabled={!orderId}
            loading={loading}
            onClick={submit}
          >
            同意协议并验证
          </Button>
          <a href="#" className="text-primary mx-auto">
            《用户协议》
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-md">
        <h5 className="text-text-0 font-semibold text-center">● 注意事项 ●</h5>
        <ol className="text-text-1 flex flex-col gap-xs">
          <li>
            1.
            下单后需要约10分钟后才能验证，遇大型促销节点，可能有延迟现象，请耐心等待
          </li>
          <li>
            2. 订单内所有产品必须全部设计完成，并点击提交按钮，方能进行生产；
          </li>
          <li>
            3.
            建议距离第一次编辑30天内提交设计，不然文件到期后，需全部重新编辑；
          </li>
          <li>
            4. 编辑内所见即所得，所有照片请仔细确认效果，一旦提交不可再次修改；
          </li>
        </ol>
      </div>
    </div>
  );
};
