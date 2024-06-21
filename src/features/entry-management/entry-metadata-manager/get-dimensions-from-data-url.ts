export function getDimensionsFromDataUrl(dataURL: string): Promise<string | number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve((img.width / img.height).toFixed(4));
    };
    img.onerror = function () {
      resolve(0);
    };
    img.src = dataURL;
  });
}
