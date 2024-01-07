import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getImages } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";

export function useGalleryImagesQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.GALLERY_IMAGES, activeUser?.username],
    queryFn: () => getImages(activeUser!.username),
    enabled: !!activeUser,
    initialData: []
  });
}
