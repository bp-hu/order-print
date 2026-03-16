import { ClipType } from "@/typings";

interface ClipProps {
  layout: "horizontal" | "vertical";
  containerSize: [number, number];
  imageSize: [number, number];
  frameRatio: number;
  isAuto?: boolean;
}

export function getClipSize({
  layout,
  containerSize,
  frameRatio,
  isAuto = false,
  imageSize,
}: ClipProps): {
  frameWidth: number;
  frameHeight: number;
  imageWidth: number;
  imageHeight: number;
} {
  const [containerWidth, containerHeight] = containerSize;
  const [width, height] = imageSize;

  if (isAuto) {
    const frameWidth =
      width > height ? containerWidth : (containerHeight / height) * width;
    const frameHeight =
      width > height ? (containerWidth / width) * height : containerHeight;
    const imageWidth =
      width > height ? containerWidth : (containerHeight / height) * width;
    const imageHeight =
      width > height ? (containerWidth / width) * height : containerHeight;

    return {
      frameWidth,
      frameHeight,
      imageWidth,
      imageHeight,
    };
  }

  if (layout === "horizontal") {
    const frameHeight =
      frameRatio < 1
        ? containerWidth * frameRatio
        : containerHeight / frameRatio;
    const frameWidth = containerWidth;

    return {
      frameWidth,
      frameHeight,
      imageWidth: (frameHeight / height) * width,
      imageHeight: frameHeight,
    };
  } else {
    const frameHeight = containerHeight;
    const frameWidth =
      frameRatio < 1 ? frameHeight * frameRatio : frameHeight / frameRatio;

    return {
      frameWidth,
      frameHeight,
      imageWidth: (frameHeight / height) * width,
      imageHeight: frameHeight,
    };
  }
}

export function getPrintParams({
  pageSize,
  clipType,
  clipPosPercent,
  clipSizePercent,
  ...props
}: Omit<ClipProps, "frameRatio" | "isAuto" | "containerSize"> & {
  pageSize: [number, number];
  clipType: ClipType;
  clipPosPercent: [number, number];
  clipSizePercent: [number, number];
}) {
  const [pageWidth, pageHeight] = pageSize;
  const frameRatio = pageSize[0] / pageSize[1];
  const isAuto = clipType === "auto";
  const {
    imageWidth: _imageWidth,
    imageHeight: _imageHeight,
    frameHeight,
    frameWidth,
  } = getClipSize({
    ...props,
    frameRatio,
    isAuto,
    containerSize: [400, 400],
  });

  const imageWidth = (pageWidth / frameWidth) * _imageWidth;
  const imageHeight = (pageHeight / frameHeight) * _imageHeight;
  const blankWidth = pageWidth - imageWidth;
  const blankHeight = pageHeight - imageHeight;

  // 单边留白
  if (clipType === "single") {
    return {
      start_x: 0,
      start_y: 0,
      end_x: imageWidth,
      end_y: imageHeight,
      blank_top: 0,
      blank_bottom: 0,
      blank_left: 0,
      blank_right: blankWidth,
      photo_w: imageWidth,
      photo_h: imageHeight,
    };
  }

  // 双边留白
  if (clipType === "margin") {
    return {
      start_x: 0,
      start_y: 0,
      end_x: imageWidth,
      end_y: imageHeight,
      blank_top: 0,
      blank_bottom: 0,
      blank_left: blankWidth / 2,
      blank_right: blankWidth / 2,
      photo_w: imageWidth,
      photo_h: imageHeight,
    };
  }

  // 智能裁剪
  const clipTop = clipPosPercent[0] * pageHeight;
  const clipHeight = clipSizePercent[1] * pageHeight;

  return {
    start_x: 0,
    start_y: clipTop,
    end_x: imageWidth,
    end_y: clipHeight + clipTop,
    blank_top: 0,
    blank_bottom: 0,
    blank_left: 0,
    blank_right: 0,
    photo_w: imageWidth,
    photo_h: imageHeight,
  };
}

/**
 * 避免事件重复触发的工具函数，常用于请求错误消息的去重
 * @param id 识别重复触发的唯一 id
 * @param resolver Promise 对象，当 resolver 还处于 pending 状态时将不会触发多次
 */
const singleCache: Record<string, any> = {};
export function single<T>(id: string, resolver: () => Promise<T>): Promise<T> {
  if (!singleCache[id]) {
    singleCache[id] = resolver().finally(() => {
      singleCache[id] = null;
    });
    return singleCache[id];
  }

  return Promise.reject();
}

// 加密
export function encryptBase64(str: string) {
  return btoa(encodeURIComponent(str));
}

// 解密
export function decryptBase64(encrypted: string) {
  return decodeURIComponent(atob(encrypted));
}
