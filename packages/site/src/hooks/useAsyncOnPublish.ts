import copy from "copy-to-clipboard";
import { useAsyncCallback } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { filesSelectors, publishFile } from "../store";
import { tweet } from "../utils";

import { useSnackbar } from "./useSnackbar";

export const useAsyncOnPublish = (id: string) => {
  const shareUrl = useSelector((root) => root.present.nav.shareUrl);
  const name = useSelector((root) => filesSelectors.selectById(root, id)?.name);

  const dispatch = useDispatch();
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
          message: "共有URLをコピーしました",
          severity: "success",
        });

        return url;
      })
      .catch((error) => {
        console.error(error);
        Snackbar.show({ message: "失敗しました", severity: "error" });
      });
  };

  const onTweet = () =>
    asyncOnPublish
      .execute()
      .then((url) => {
        tweet({ url, text: name || "" });
      })
      .catch((error) => {
        console.error(error);
        Snackbar.show({ message: "失敗しました", severity: "error" });
      });

  return { shareUrl, asyncOnPublish, onUrlCopy, onTweet, Snackbar };
};
