import { IconForward, IconReply } from "@douyinfe/semi-icons";
import { Button, Input } from "@douyinfe/semi-ui";

export function Angle({
  angle,
  setAngle,
}: {
  angle: number | undefined;
  setAngle: (angle: number | undefined) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-xs">
      角度
      <Button
        size="small"
        icon={<IconReply />}
        onClick={() => {
          setAngle((angle ?? 0) - 1);
        }}
      />
      <Input
        className="w-[36px] [&>input]:px-3xs"
        value={angle}
        onChange={(v) => {
          setAngle(v === "" ? undefined : Number(v));
        }}
        onBlur={() => {
          setAngle(angle ?? 0);
        }}
      />
      °
      <Button
        size="small"
        icon={<IconForward />}
        onClick={() => {
          const nextAngle = (angle ?? 0) + 1;
          setAngle(nextAngle);
        }}
      />
    </div>
  );
}
