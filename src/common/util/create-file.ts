export async function createFile(uri: string) {
  let response = await fetch(uri);
  let data = await response.blob();
  let metadata = {
    type: "image/jpeg"
  };
  return new File([data], "thumbnail.jpg", metadata);
}
