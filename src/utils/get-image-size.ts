export function getImageSize(file: File) {
  return new Promise<{ naturalWidth: number; naturalHeight: number }>(
    (resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // 加载完成后释放对象URL
        URL.revokeObjectURL(url);
        resolve({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("图片加载失败"));
      };

      img.src = url;
    },
  );
}
