import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImage, UserImage } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["gallery", "image", "delete"],
    mutationFn: async ({ id }: { id: string }) => {
      await deleteImage(activeUser!.username, id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<UserImage[]>(
        [QueryIdentifiers.GALLERY_IMAGES, activeUser?.username],
        (
          queryClient.getQueryData<UserImage[]>([
            QueryIdentifiers.GALLERY_IMAGES,
            activeUser?.username
          ]) ?? []
        ).filter((image) => image._id !== id)
      );
    }
  });
}
