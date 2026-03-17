import { IconForward, IconReply } from "@douyinfe/semi-icons";
import { Button, Input } from "@douyinfe/semi-ui";

export function Rotate({
  rotate,
  setRotate,
}: {
  rotate: number | undefined;
  setRotate: (rotate: number | undefined) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-xs">
      角度
      <Button
        size="small"
        icon={<IconReply />}
        onClick={() => {
          setRotate((rotate ?? 0) - 1);
        }}
      />
      <Input
        className="w-[36px] [&>input]:px-3xs"
        value={rotate}
        onChange={(v) => {
          setRotate(v === "" ? undefined : Number(v));
        }}
        onBlur={() => {
          setRotate(rotate ?? 0);
        }}
      />
      °
      <Button
        size="small"
        icon={<IconForward />}
        onClick={() => {
          const nextRotate = (rotate ?? 0) + 1;
          setRotate(nextRotate);
        }}
      />
    </div>
  );
}
