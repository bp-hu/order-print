export function getClipSize({
  layout,
  containerSize,
  image,
  frameRatio,
  isAuto = false,
}: {
  layout: "horizontal" | "vertical";
  containerSize: [number, number];
  image: HTMLImageElement;
  frameRatio: number;
  isAuto?: boolean;
}): {
  frameWidth: number;
  frameHeight: number;
  imageWidth: number;
  imageHeight: number;
} {
  const { naturalWidth: width, naturalHeight: height } = image;
  const [containerWidth, containerHeight] = containerSize;

  if (isAuto) {
    if (width > height) {
      return {
        frameWidth: containerWidth,
        frameHeight: (containerWidth / width) * height,
        imageWidth: containerWidth,
        imageHeight: (containerWidth / width) * height,
      };
    } else {
      return {
        frameWidth: (containerHeight / height) * width,
        frameHeight: containerHeight,
        imageWidth: (containerHeight / height) * width,
        imageHeight: containerHeight,
      };
    }
  }

  if (layout === "horizontal") {
    const frameHeight = containerWidth * frameRatio;
    return {
      frameWidth: containerWidth,
      frameHeight: frameHeight,
      imageWidth: (frameHeight / height) * width,
      imageHeight: frameHeight,
    };
  } else {
    const frameWidth = containerHeight * frameRatio;
    return {
      frameWidth: frameWidth,
      frameHeight: containerHeight,
      imageWidth: frameWidth,
      imageHeight: (frameWidth / width) * height,
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
