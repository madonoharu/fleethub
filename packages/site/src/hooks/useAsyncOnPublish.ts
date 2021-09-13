import copy from "copy-to-clipboard";
import { useAsyncCallback } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { publishFile } from "../store";
import { useSnackbar } from "./useSnackbar";

export const useAsyncOnPublish = (id: string) => {
  const shareUrl = useSelector((root) => root.present.nav.shareUrl);
  const dispatch = useDispatch();
  const Snackbar = useSnackbar();

  const asyncOnPublish = useAsyncCallback(
    async () => {
      if (shareUrl) return shareUrl;

      const url = await dispatch(publishFile({ fileId: id })).unwrap();
      const result = copy(url);
      if (!result) throw new Error("Failed to copy");

      return url;
    },
    {
      onSuccess: () => {
        Snackbar.show({
          message: "共有URLをコピーしました",
          severity: "success",
        });
      },
      onError: (error) => {
        console.error(error);
        Snackbar.show({ message: "失敗しました", severity: "error" });
      },
    }
  );

  return { shareUrl, asyncOnPublish, Snackbar };
};
