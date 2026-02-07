import { orderIdAtom } from "@/stores";
import { IconIdentity } from "@douyinfe/semi-icons";
import { Button, Input } from "@douyinfe/semi-ui";
import { useNavigate } from "@edenx/runtime/router";
import { useAtom } from "jotai";
import { useState } from "react";

export default () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useAtom(orderIdAtom);

  return (
    <div className="flex flex-col gap-xl">
      <h5 className="font-semibold flex items-center gap-3xs text-primary">
        <IconIdentity />
        验证订单信息
      </h5>
      <Input
        size="large"
        placeholder="请输入订单编号"
        value={orderId}
        onChange={setOrderId}
      />
      <Button
        className="w-full"
        theme="solid"
        size="large"
        disabled={!orderId}
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            navigate("/order-detail");
          }, 300);
        }}
      >
        验证
      </Button>
      <div>
        <h5 className="text-danger font-semibold">温馨提示</h5>
        <ol>
          <li>
            1. 订单内所有产品必须全部设计完成，并点击提交按钮，方能进行生产；
          </li>
          <li>
            2.
            建议距离第一次编辑30天内提交设计，不然文件到期后，需全部重新编辑；
          </li>
          <li>3. 订单支付后，需在3个月内来验证设计，超时不可进入设计；</li>
          <li>
            4. 编辑内所见即所得，所有照片请仔细确认效果，一旦提交不可再次修改；
          </li>
        </ol>
      </div>
    </div>
  );
};
