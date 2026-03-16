import { useAtomValue } from "jotai";
import { Login } from "./login";
import { OrderCreator } from "./order-creator";
import { OrderList } from "./order-list";
import { merchantIdAtom } from "./store";

export default function MerchantPage() {
  const merchantId = useAtomValue(merchantIdAtom);

  if (!merchantId) {
    return <Login />;
  }

  return (
    <div>
      <div>
        <OrderCreator />
      </div>
      <OrderList />
    </div>
  );
}
