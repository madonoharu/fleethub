import copy from "copy-to-clipboard";
import { useAsyncCallback } from "react-async-hook";

import { filesSelectors, publishFile } from "../store";
import { tweet } from "../utils";

import { useAppDispatch, useAppSelector } from "./rtk-hooks";
import { useSnackbar } from "./useSnackbar";

export const useAsyncOnPublish = (id: string) => {
  const shareUrl = useAppSelector((root) => root.present.nav.shareUrl);
  const name = useAppSelector(
    (root) => filesSelectors.selectById(root, id)?.name
  );

  const dispatch = useAppDispatch();
  const Snackbar = useSnackbar();

  const asyncOnPublish = useAsyncCallback(async () => {
    if (shareUrl) return shareUrl;
    const url = await dispatch(publishFile({ fileId: id })).unwrap();
    return url;
  });

  const onUrlCopy = () => {
    asyncOnPublish
      .execute()
      .then((url) => {
        const result = copy(url);

        if (!result) throw new Error("Failed to copy");

        Snackbar.show({
          message: "コピーしました",
          severity: "success",
        });

        return url;
      })
      .catch((error) => {
        console.error(error);
        Snackbar.show({ message: "失敗しました", severity: "error" });
      });
  };

  const onTweet = () => {
    return asyncOnPublish
      .execute()
      .then((url) => {
        tweet({ url, text: name || "" });
      })
      .catch((error) => {
        console.error(error);
        Snackbar.show({ message: "失敗しました", severity: "error" });
      });
  };

  const { loading, execute } = asyncOnPublish;

  return {
    shareUrl,
    loading,
    execute,
    asyncOnPublish,
    onUrlCopy,
    onTweet,
    Snackbar,
  };
};
