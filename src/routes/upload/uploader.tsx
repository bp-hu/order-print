import { DEFAULT_CONTAINER_SIZE, PHOTO_SIZES } from "@/consts";
import {
  countAtom,
  imageCacheAtom,
  orderAtom,
  orderIdAtom,
  refreshOrderAtom,
  totalAtom,
} from "@/stores";
import { fileToDataURL, getClipParams, getPrintParams, single } from "@/utils";
import { getImageSize } from "@/utils/get-image-size";
import { http } from "@/utils/http";
import { IconUpload } from "@douyinfe/semi-icons";
import { Button, Modal, Progress, Spin, Upload } from "@douyinfe/semi-ui";
import { useRequest } from "@safe-fe/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import PQueue from "p-queue";
import { stringify } from "qs";
import { forwardRef, useRef, useState } from "react";

const uploadQueue = new PQueue({ concurrency: 1 });

export const Uploader = forwardRef<Upload, any>((props, ref) => {
  const total = useAtomValue(totalAtom);
  const count = useAtomValue(countAtom);
  const order = useAtomValue(orderAtom);
  const refreshOrder = useSetAtom(refreshOrderAtom);
  const setImageCache = useSetAtom(imageCacheAtom);
  const orderId = useAtomValue(orderIdAtom);
  const [uploading, setUploading] = useState<boolean>(false);
  const totalRef = useRef<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentIndexRef = useRef<number>(currentIndex);
  const [percent, setPercent] = useState(0);

  const { run: upload } = useRequest(
    ({ query, body, onUploadProgress, onSuccess, onError }) =>
      http
        .post(`/images?${stringify(query)}`, body, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress,
        })
        .then((res) => onSuccess(res))
        .catch((err) => onError(err)),
  );

  return (
    <>
      {uploading ? (
        <div className="fixed left-0 top-0 w-full h-full bg-black/50 flex items-center justify-center z-999">
          <div className="flex flex-col text-white flex flex-col items-center gap-xs">
            <Spin wrapperClassName="[&>.semi-spin-wrapper]:text-white" />
            <div className="flex flex-col items-center gap-xs">
              照片上传中，请稍候（{currentIndex + 1} / {totalRef.current}）
              <Progress className="w-full" stroke="white" percent={percent} />
            </div>
          </div>
        </div>
      ) : null}
      <Upload
        ref={ref}
        action="https://api.semi.design/upload"
        showUploadList={false}
        multiple
        disabled={count >= total}
        beforeUpload={({ fileList }) => {
          const newFileList = fileList.filter(
            (v) => v.status === "uploading" && v.shouldUpload !== false,
          );
          if (count + newFileList.length > total) {
            single(
              "upload-error",
              () =>
                new Promise((resolve, reject) => {
                  Modal.error({
                    width: "100vw",
                    content: `照片数量不能超过 ${total} 张`,
                    onOk: resolve,
                    onCancel: reject,
                  });
                }),
            );
            return {
              shouldUpload: false,
            };
          }

          setUploading(true);
          setCurrentIndex(0);
          currentIndexRef.current = 0;
          totalRef.current = newFileList.length;

          return {
            shouldUpload: true,
          };
        }}
        customRequest={async ({
          fileInstance,
          onProgress,
          onSuccess,
          onError,
        }) => {
          const formData = new FormData();
          formData.append("file", fileInstance);
          const { naturalWidth, naturalHeight } =
            await getImageSize(fileInstance);
          const imageSize = [naturalWidth, naturalHeight] as [number, number];
          const photoSize =
            PHOTO_SIZES[order?.photo_size as keyof typeof PHOTO_SIZES];
          const layout =
            naturalWidth >= naturalHeight ? "horizontal" : "vertical";
          const { clipHeightPercent, clipWidthPercent } = getClipParams({
            layout,
            paperRatio: photoSize?.w / photoSize?.h,
            containerSize: DEFAULT_CONTAINER_SIZE,
            imageSize,
          });

          await uploadQueue.add(() =>
            upload({
              query: {
                order_id: orderId,
                edit_params: JSON.stringify({
                  count: 1,
                  paper_w: photoSize?.w,
                  paper_h: photoSize?.h,
                  naturalWidth,
                  naturalHeight,
                  clipType: "auto",
                  layout,
                  clipHeightPercent,
                  clipWidthPercent,
                  clipTopPercent: 0,
                  clipLeftPercent: 0,
                  ...getPrintParams({
                    paperSize: [photoSize?.w || 0, photoSize?.h || 0],
                    clipType: "auto",
                    layout,
                    imageSize,
                    clipPosPercent: [0, 0],
                    clipSizePercent: [clipWidthPercent, clipHeightPercent],
                  }),
                }),
              },
              body: formData,
              onUploadProgress(e: any) {
                onProgress({
                  total: e.total,
                  loaded: e.loaded,
                });
                setPercent((e.loaded / e.total) * 100);
              },
              async onSuccess(res: any) {
                onSuccess(res);
                setPercent(0);

                const nextIndex = currentIndexRef.current + 1;
                setCurrentIndex(nextIndex);
                currentIndexRef.current = nextIndex;

                const imgUrl = await fileToDataURL(fileInstance);
                setImageCache((prev: any) => [
                  ...prev,
                  { url: imgUrl, key: res.id },
                ]);

                if (nextIndex >= totalRef.current) {
                  setUploading(false);
                  refreshOrder();
                }
              },
              onError(err: any) {
                onError(err);
                setPercent(0);
                const nextIndex = currentIndexRef.current + 1;
                setCurrentIndex(nextIndex);
                currentIndexRef.current = nextIndex;
                if (nextIndex >= totalRef.current) {
                  setUploading(false);
                  refreshOrder();
                }
              },
            }),
          );
        }}
      >
        <Button
          size="small"
          icon={<IconUpload />}
          theme="solid"
          disabled={uploading || count >= total}
        >
          上传图片
        </Button>
      </Upload>
    </>
  );
});
