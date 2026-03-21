import { ClipType } from "@/typings";

interface ClipProps {
  layout: "horizontal" | "vertical";
  containerSize: [number, number];
  imageSize: [number, number];
  paperRatio: number;
  isAuto?: boolean;
}

export function getClipSize({
  layout,
  containerSize,
  paperRatio,
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
  const imageRatio = width / height;

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

  let frameWidth = 0;
  let frameHeight = 0;
  if (layout === "horizontal") {
    frameWidth = containerWidth;
    frameHeight =
      paperRatio < 1 ? frameWidth * paperRatio : frameWidth / paperRatio;
  } else {
    frameHeight = containerHeight;
    frameWidth =
      paperRatio < 1 ? frameHeight * paperRatio : frameHeight / paperRatio;
  }

  return {
    frameWidth,
    frameHeight,
    imageWidth:
      imageRatio >= paperRatio ? frameWidth : (frameHeight / height) * width,
    imageHeight:
      imageRatio >= paperRatio ? (frameWidth / width) * height : frameHeight,
  };
}

export function getPrintParams({
  pageSize,
  clipType,
  clipPosPercent,
  clipSizePercent,
  imageSize,
  ...props
}: Omit<ClipProps, "paperRatio" | "isAuto" | "containerSize"> & {
  pageSize: [number, number];
  clipType: ClipType;
  clipPosPercent: [number, number];
  clipSizePercent: [number, number];
}) {
  const [pageWidth, pageHeight] = pageSize;
  const paperRatio = pageSize[0] / pageSize[1];
  const imageRatio = imageSize[0] / imageSize[1];
  const isAuto = clipType === "auto";
  const {
    frameHeight,
    frameWidth,
    imageWidth: zoomImageWidth,
    imageHeight: zoomImageHeight,
  } = getClipSize({
    ...props,
    paperRatio,
    isAuto,
    containerSize: [400, 400],
    imageSize,
  });

  const imageWidth = (pageWidth / frameWidth) * zoomImageWidth;
  const imageHeight = (pageHeight / frameHeight) * zoomImageHeight;
  const blankWidth = pageWidth - imageWidth;
  const blankHeight = pageHeight - imageHeight;

  // 单边留白
  if (clipType === "single") {
    // 左右留白
    if (frameWidth > zoomImageWidth) {
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
    } else {
      // 上下留白
      return {
        start_x: 0,
        start_y: 0,
        end_x: imageWidth,
        end_y: imageHeight,
        blank_top: 0,
        blank_bottom: blankHeight,
        blank_left: 0,
        blank_right: 0,
        photo_w: imageWidth,
        photo_h: imageHeight,
      };
    }
  }

  // 双边留白
  if (clipType === "margin") {
    // 左右留白
    if (frameWidth > zoomImageWidth) {
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
    } else {
      // 上下留白
      return {
        start_x: 0,
        start_y: 0,
        end_x: imageWidth,
        end_y: imageHeight,
        blank_top: blankHeight / 2,
        blank_bottom: blankHeight / 2,
        blank_left: 0,
        blank_right: 0,
        photo_w: imageWidth,
        photo_h: imageHeight,
      };
    }
  }

  /** 智能裁剪 */
  // 高度裁剪
  if (imageRatio <= paperRatio) {
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
  } else {
    // 宽度裁剪
    const clipLeft = clipPosPercent[1] * pageWidth;
    const clipWidth = clipSizePercent[0] * pageWidth;

    return {
      start_x: clipLeft,
      start_y: 0,
      end_x: clipWidth + clipLeft,
      end_y: imageHeight,
      blank_top: 0,
      blank_bottom: 0,
      blank_left: 0,
      blank_right: 0,
      photo_w: imageWidth,
      photo_h: imageHeight,
    };
  }
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

export function fileToDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      resolve(e.target.result); // data:image/png;base64,...
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
