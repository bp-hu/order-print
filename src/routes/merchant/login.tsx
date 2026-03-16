import { decryptBase64 } from "@/utils";
import { Button, Form, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useSetAtom } from "jotai";
import { useRef } from "react";
import { merchantIdAtom } from "./store";

export function Login() {
  const formRef = useRef<FormApi>();
  const setMerchantId = useSetAtom(merchantIdAtom);

  async function submit() {
    const formApi = formRef.current;
    await formApi?.validate();
    const values = formApi?.getValues();

    if (
      values?.merchantId !== "cannon" ||
      values?.password !== decryptBase64("Y2Fubm9uMTIzNDU2Nw==")
    ) {
      Toast.error("用户名或密码错误");
      return;
    } else {
      setMerchantId(values?.merchantId);
    }
  }

  return (
    <div className="bg-white flex items-center justify-center h-[400px] bg-cover bg-[url('https://img.kanzheli.cn/images/extmall_bg.jpg')]">
      <div className="w-[320px] flex flex-col gap-xl bg-white px-lg py-md rounded-md">
        <h5 className="block w-full font-semibold text-success text-center">
          登录商家端
        </h5>
        <Form
          getFormApi={(api) => {
            formRef.current = api;
          }}
        >
          <Form.Input
            field="merchantId"
            size="large"
            placeholder="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
            onEnterPress={() => {
              submit();
            }}
          />
          <Form.Input
            size="large"
            field="password"
            placeholder="密码"
            rules={[{ required: true, message: "请输入密码" }]}
            onEnterPress={() => {
              submit();
            }}
          />
          <Button
            className="w-full"
            theme="solid"
            size="large"
            onClick={submit}
          >
            登录
          </Button>
        </Form>
      </div>
    </div>
  );
}
