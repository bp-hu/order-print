import { DEFAULT_CONTAINER_SIZE } from "@/consts";
import { ClipType } from "@/typings";

interface ClipProps {
  layout: "horizontal" | "vertical";
  containerSize: [number, number];
  imageSize: [number, number];
  paperRatio: number;
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

/**
 * 根据容器大小和纸张比例计算相框大小
 */
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
}): [number, number] {
  const [width, height] = imageSize;
  const [containerWidth, containerHeight] = containerSize;
  const isHorizontal = layout === "horizontal";
  const paperRatio = getPaperRatioByLayout({
    layout,
    paperRatio: paperRatioProp,
  });

  let frameWidth = 0;
  let frameHeight = 0;

  if (isAuto) {
    frameWidth =
      width > height ? containerWidth : (containerHeight / height) * width;
    frameHeight =
      width > height ? (containerWidth / width) * height : containerHeight;
  } else {
    if (isHorizontal) {
      frameWidth = containerWidth;
      frameHeight =
        paperRatio < 1 ? frameWidth * paperRatio : frameWidth / paperRatio;
    } else {
      frameHeight = containerHeight;
      frameWidth =
        paperRatio < 1 ? frameHeight * paperRatio : frameHeight / paperRatio;
    }
  }

  return [frameWidth, frameHeight];
}

/**
 * 获取裁剪参数：裁剪框大小、裁剪框比例、裁剪百分比（相对于相框）
 */
export function getClipParams({
  layout,
  paperRatio,
  imageSize,
  frameSize,
}: {
  layout: "horizontal" | "vertical";
  paperRatio: number;
  frameSize: [number, number];
  imageSize: [number, number];
}) {
  const imageRatio = imageSize[0] / imageSize[1];
  const [frameWidth, frameHeight] = frameSize;
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

/**
 * 获取裁剪尺寸：相框尺寸、照片尺寸
 */
export function getClipSize({
  layout,
  containerSize,
  paperRatio: paperRatioProp,
  clipType,
  imageSize,
}: ClipProps & {
  clipType?: ClipType;
}): {
  frameWidth: number;
  frameHeight: number;
  imageWidth: number;
  imageHeight: number;
} {
  const [width, height] = imageSize;
  const imageRatio = width / height;
  const isAuto = ["auto", "around"].includes(clipType || "");
  const [frameWidth, frameHeight] = getFrameSizeFromContainer({
    layout,
    containerSize,
    paperRatio: paperRatioProp,
    isAuto,
    imageSize,
  });

  let imageWidth = 0;
  let imageHeight = 0;

  const isHorizontal = layout === "horizontal";
  const isVertical = !isHorizontal;
  const paperRatio =
    (isHorizontal && paperRatioProp < 1) || (isVertical && paperRatioProp >= 1)
      ? 1 / paperRatioProp
      : paperRatioProp;
  const maxFrameLength = Math.max(frameWidth, frameHeight);

  if (paperRatio <= imageRatio) {
    imageWidth =
      clipType === "around" ? frameWidth - 0.08 * maxFrameLength : frameWidth;
    imageHeight = (imageWidth / width) * height;
  } else {
    imageHeight =
      clipType === "around" ? frameHeight - 0.08 * maxFrameLength : frameHeight;
    imageWidth = (imageHeight / height) * width;
  }

  return {
    frameWidth,
    frameHeight,
    imageWidth,
    imageHeight,
  };
}

/**
 * 获取格式化的打印参数（用于后端处理图片）
 */
export function getPrintParams({
  paperSize,
  clipType,
  clipPosPercent,
  clipSizePercent,
  imageSize,
  ...props
}: Omit<ClipProps, "paperRatio" | "containerSize"> & {
  paperSize: [number, number];
  clipType: ClipType;
  clipPosPercent: [number, number];
  clipSizePercent: [number, number];
}) {
  const [paperWidth, paperHeight] = paperSize;
  const paperRatioProp = paperSize[0] / paperSize[1];
  const imageRatio = imageSize[0] / imageSize[1];
  const {
    frameHeight,
    frameWidth,
    imageWidth: zoomImageWidth,
    imageHeight: zoomImageHeight,
  } = getClipSize({
    ...props,
    paperRatio: paperRatioProp,
    clipType,
    containerSize: DEFAULT_CONTAINER_SIZE,
    imageSize,
  });

  // 根据纸张尺寸等比计算照片尺寸和留白尺寸
  let imageWidth = (paperWidth / frameWidth) * zoomImageWidth;
  let imageHeight = (paperHeight / frameHeight) * zoomImageHeight;
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
  const isHorizontal = props.layout === "horizontal";
  const isVertical = !isHorizontal;
  const paperRatio =
    (isHorizontal && paperRatioProp < 1) || (isVertical && paperRatioProp >= 1)
      ? 1 / paperRatioProp
      : paperRatioProp;

  const isAround = clipType === "around";
  // 四周留白：留页面的 4% 作为留白区域
  const maxPaperLength = Math.max(paperWidth, paperHeight);
  const blankX = isAround ? 0.04 * maxPaperLength : 0;
  const blankY = isAround ? 0.04 * maxPaperLength : 0;

  // 高度裁剪
  if (imageRatio <= paperRatio) {
    // 智能裁剪的 imageHeight 需要基于图片尺寸重新计算，因为 getClipSize 返回的是裁剪后的尺寸
    imageHeight = (imageWidth / zoomImageWidth) * zoomImageHeight;
    const clipTop = clipPosPercent[0] * imageHeight;
    const clipHeight = clipSizePercent[1] * imageHeight;

    return {
      start_x: 0,
      start_y: clipTop,
      end_x: imageWidth,
      end_y: clipHeight + clipTop,
      blank_top: blankY,
      blank_bottom: blankY,
      blank_left: blankX,
      blank_right: blankX,
      photo_w: imageWidth,
      photo_h: imageHeight,
    };
  } else {
    // 宽度裁剪
    // 智能裁剪的 imageWidth 需要基于图片尺寸重新计算，因为 getClipSize 返回的是裁剪后的尺寸
    imageWidth = (imageHeight / zoomImageHeight) * zoomImageWidth;
    const clipLeft = clipPosPercent[1] * imageWidth;
    const clipWidth = clipSizePercent[0] * imageWidth;

    return {
      start_x: clipLeft,
      start_y: 0,
      end_x: clipWidth + clipLeft,
      end_y: imageHeight,
      blank_top: blankY,
      blank_bottom: blankY,
      blank_left: blankX,
      blank_right: blankX,
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
