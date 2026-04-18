import { useAtomValue } from "jotai";
import { useState } from "react";
import { Batch } from "./batch";
import { Filter, FilterValue } from "./filter";
import { Login } from "./login";
import { OrderCreator } from "./order-creator";
import { OrderHistory } from "./order-history";
import { OrderList } from "./order-list";
import { merchantIdAtom } from "./store";

export default function MerchantPage() {
  const merchantId = useAtomValue(merchantIdAtom);
  const [filterValue, setFilterValue] = useState<FilterValue>({
    searchKey: "",
    customerStatus: "",
    merchantStatus: "",
  });

  if (!merchantId) {
    return <Login />;
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between gap-md">
        <Filter value={filterValue} setValue={setFilterValue} />
        <div className="flex items-center gap-md">
          <Batch />
          <OrderCreator />
          <OrderHistory />
        </div>
      </div>
      <OrderList filterValue={filterValue} />
    </div>
  );
}
