import { imageListAtom } from "@/stores";
import { IconForward, IconReply } from "@douyinfe/semi-icons";
import { Button, Input } from "@douyinfe/semi-ui";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

export function Angle({ index }: { index: number }) {
  const { angle } = useAtomValue(imageListAtom)[index];
  const setImageList = useSetAtom(imageListAtom);
  const [tempAngle, setTempAngle] = useState<number | undefined>(
    () => angle || 0,
  );

  const setAngle = (angle: number) => {
    setTempAngle(angle);
    setImageList((prev: any) => {
      prev[index] = {
        ...prev[index],
        angle,
      };
      return [...prev];
    });
  };

  return (
    <div className="flex items-center justify-center gap-xs">
      角度
      <Button
        size="small"
        icon={<IconReply />}
        onClick={() => {
          const nextAngle = (tempAngle ?? 0) - 1;
          setTempAngle(nextAngle);
          setAngle(nextAngle);
        }}
      />
      <Input
        className="w-[36px] [&>input]:px-3xs"
        value={tempAngle}
        onChange={(v) => {
          setTempAngle(v === "" ? undefined : Number(v));
        }}
        onBlur={() => {
          setAngle(tempAngle ?? 0);
        }}
      />
      °
      <Button
        size="small"
        icon={<IconForward />}
        onClick={() => {
          const nextAngle = (tempAngle ?? 0) + 1;
          setTempAngle(nextAngle);
          setAngle(nextAngle);
        }}
      />
    </div>
  );
}
