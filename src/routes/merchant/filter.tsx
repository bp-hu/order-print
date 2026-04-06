import { CUSTOMER_STATUS_COLOR, MERCHANT_STATUS_COLOR } from "@/consts";
import { useUpdateEffect } from "@auix/utils";
import { IconSearch } from "@douyinfe/semi-icons";
import { Button, Input, Select } from "@douyinfe/semi-ui";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { customerStatusAtom, merchantStatusAtom } from "./store";

export interface FilterValue {
  searchKey: string;
  customerStatus: string;
  merchantStatus: string;
}

const DEFAULT_VAUE = {
  searchKey: "",
  customerStatus: "",
  merchantStatus: "",
};

export function Filter({
  value,
  setValue,
}: {
  value?: FilterValue;
  setValue: (v: FilterValue) => void;
}) {
  const [tempValue, setTempValue] = useState<FilterValue>(
    value || DEFAULT_VAUE,
  );
  const customerStatus = useAtomValue(customerStatusAtom);
  const merchantStatus = useAtomValue(merchantStatusAtom);

  useUpdateEffect(() => {
    if (!value) {
      return;
    }
    setTempValue(value || DEFAULT_VAUE);
  }, [value]);

  return (
    <div className="flex items-center gap-md">
      <Input
        showClear
        placeholder="请输入订单号搜索"
        value={tempValue.searchKey}
        onChange={(v) => setTempValue({ ...tempValue, searchKey: v })}
        prefix={<IconSearch />}
      />
      <Select
        showClear
        className="min-w-[140px]"
        optionList={customerStatus.map((v) => ({
          label: <div className={CUSTOMER_STATUS_COLOR[v]}>{v}</div>,
          value: v,
        }))}
        placeholder="客户状态"
        value={tempValue.customerStatus}
        onChange={(v: any) =>
          setTempValue({ ...tempValue, customerStatus: v || "" })
        }
      />
      <Select
        showClear
        className="min-w-[140px]"
        optionList={merchantStatus.map((v) => ({
          label: <div className={MERCHANT_STATUS_COLOR[v]}>{v}</div>,
          value: v,
        }))}
        placeholder="商户状态"
        value={tempValue.merchantStatus}
        onChange={(v: any) =>
          setTempValue({ ...tempValue, merchantStatus: v || "" })
        }
      />
      <Button theme="solid" onClick={() => setValue(tempValue)}>
        搜索
      </Button>
      <Button
        type="secondary"
        onClick={() => {
          setValue(DEFAULT_VAUE);
        }}
      >
        重置
      </Button>
    </div>
  );
}
