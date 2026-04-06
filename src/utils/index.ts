import { DEFAULT_CONTAINER_SIZE } from "@/consts";
import { ClipType } from "@/typings";

interface ClipProps {
  layout: "horizontal" | "vertical";
  containerSize: [number, number];
  imageSize: [number, number];
  paperRatio: number;
  isAuto?: boolean;
}

export function getPaperRatioByLayout({
  layout,
  paperRatio: paperRatioProp,
}: {
  layout: "horizontal" | "vertical";
  paperRatio: number;
}) {
  const isHorizontal = layout === "horizontal";
  const isVertical = !isHorizontal;

  return (isHorizontal && paperRatioProp < 1) ||
    (isVertical && paperRatioProp >= 1)
    ? 1 / paperRatioProp
    : paperRatioProp;
}

export function getFrameSizeFromContainer({
  layout,
  containerSize,
  paperRatio: paperRatioProp,
  isAuto = false,
  imageSize,
}: {
  layout: "horizontal" | "vertical";
  containerSize: [number, number];
  imageSize: [number, number];
  paperRatio: number;
  isAuto?: boolean;
}) {
  const [width, height] = imageSize;
  const [containerWidth, containerHeight] = containerSize;
  const isHorizontal = layout === "horizontal";
  const paperRatio = getPaperRatioByLayout({
    layout,
    paperRatio: paperRatioProp,
  });

  let frameWidth = 0;
  let frameHeight = 0;

  if (isHorizontal) {
    frameWidth = containerWidth;
    frameHeight =
      paperRatio < 1 ? frameWidth * paperRatio : frameWidth / paperRatio;
  } else {
    frameHeight = containerHeight;
    frameWidth =
      paperRatio < 1 ? frameHeight * paperRatio : frameHeight / paperRatio;
  }

  if (isAuto) {
    frameWidth =
      width > height ? containerWidth : (containerHeight / height) * width;
    frameHeight =
      width > height ? (containerWidth / width) * height : containerHeight;
  }

  return [frameWidth, frameHeight];
}

export function getClipParams({
  layout,
  paperRatio,
  imageSize,
  containerSize,
}: {
  layout: "horizontal" | "vertical";
  paperRatio: number;
  containerSize: [number, number];
  imageSize: [number, number];
}) {
  const imageRatio = imageSize[0] / imageSize[1];
  const [frameWidth, frameHeight] = getFrameSizeFromContainer({
    layout,
    containerSize,
    paperRatio,
    isAuto: true,
    imageSize,
  });
  const clipRatio = getPaperRatioByLayout({
    layout,
    paperRatio,
  });
  let croppingWidth = 0;
  let croppingHeight = 0;
  const isVertical = imageRatio <= clipRatio;

  // 纵向裁剪
  if (isVertical) {
    croppingWidth = frameWidth;
    croppingHeight =
      (layout === "vertical" && clipRatio < 1) ||
      (layout === "horizontal" && clipRatio >= 1)
        ? croppingWidth / clipRatio
        : croppingWidth * clipRatio;
  } else {
    // 横向裁剪
    croppingHeight = frameHeight;
    croppingWidth =
      (layout === "vertical" && clipRatio < 1) ||
      (layout === "horizontal" && clipRatio >= 1)
        ? croppingHeight * clipRatio
        : croppingHeight / clipRatio;
  }

  return {
    croppingWidth,
    croppingHeight,
    clipRatio,
    clipHeightPercent: croppingHeight / frameHeight,
    clipWidthPercent: croppingWidth / frameWidth,
  };
}

export function getClipSize({
  layout,
  containerSize,
  paperRatio: paperRatioProp,
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
  const [frameWidth, frameHeight] = getFrameSizeFromContainer({
    layout,
    containerSize,
    paperRatio: paperRatioProp,
    isAuto,
    imageSize,
  });

  let imageWidth = 0;
  let imageHeight = 0;

  if (isAuto) {
    imageWidth =
      width > height ? containerWidth : (containerHeight / height) * width;
    imageHeight =
      width > height ? (containerWidth / width) * height : containerHeight;
  }

  const isHorizontal = layout === "horizontal";
  const isVertical = !isHorizontal;
  const paperRatio =
    (isHorizontal && paperRatioProp < 1) || (isVertical && paperRatioProp >= 1)
      ? 1 / paperRatioProp
      : paperRatioProp;

  if (paperRatio <= imageRatio) {
    imageWidth = frameWidth;
    imageHeight = (imageWidth / width) * height;
  } else {
    imageHeight = frameHeight;
    imageWidth = (imageHeight / height) * width;
  }

  return {
    frameWidth,
    frameHeight,
    imageWidth,
    imageHeight,
  };
}

export function getPrintParams({
  paperSize,
  clipType,
  clipPosPercent,
  clipSizePercent,
  imageSize,
  ...props
}: Omit<ClipProps, "paperRatio" | "isAuto" | "containerSize"> & {
  paperSize: [number, number];
  clipType: ClipType;
  clipPosPercent: [number, number];
  clipSizePercent: [number, number];
}) {
  const [paperWidth, paperHeight] = paperSize;
  const paperRatioProp = paperSize[0] / paperSize[1];
  const imageRatio = imageSize[0] / imageSize[1];
  const isAuto = clipType === "auto";
  const {
    frameHeight,
    frameWidth,
    imageWidth: zoomImageWidth,
    imageHeight: zoomImageHeight,
  } = getClipSize({
    ...props,
    paperRatio: paperRatioProp,
    isAuto,
    containerSize: DEFAULT_CONTAINER_SIZE,
    imageSize,
  });

  const imageWidth = (paperWidth / frameWidth) * zoomImageWidth;
  const imageHeight = (paperHeight / frameHeight) * zoomImageHeight;
  const blankWidth = paperWidth - imageWidth;
  const blankHeight = paperHeight - imageHeight;

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
  const isHorizontal = props.layout === "horizontal";
  const isVertical = !isHorizontal;
  const paperRatio =
    (isHorizontal && paperRatioProp < 1) || (isVertical && paperRatioProp >= 1)
      ? 1 / paperRatioProp
      : paperRatioProp;
  if (imageRatio <= paperRatio) {
    const clipTop = clipPosPercent[0] * paperHeight;
    const clipHeight = clipSizePercent[1] * paperHeight;

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
    const clipLeft = clipPosPercent[1] * paperWidth;
    const clipWidth = clipSizePercent[0] * paperWidth;

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

export function download(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
