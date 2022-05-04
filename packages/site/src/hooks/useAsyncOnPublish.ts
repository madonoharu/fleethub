import { useAsyncCallback } from "react-async-hook";

import { filesSelectors, publishFile } from "../store";
import { tweet } from "../utils";

import { useAppDispatch, useAppSelector } from "./rtk-hooks";
import { useSnackbar } from "./useSnackbar";

export const useAsyncOnPublish = (id: string) => {
  const name = useAppSelector(
    (root) => filesSelectors.selectById(root, id)?.name
  );

  const dispatch = useAppDispatch();
  const Snackbar = useSnackbar();

  const asyncOnPublish = useAsyncCallback(async () => {
    const url = await dispatch(publishFile({ fileId: id })).unwrap();
    return url;
  });

  const handleRejected = (error: unknown) => {
    console.error(error);
    Snackbar.show({ message: String(error), severity: "error" });
  };

  const onUrlCopy = () => {
    asyncOnPublish
      .execute()
      .then(async (url) => {
        await navigator.clipboard.writeText(url);
        Snackbar.show({ message: "Success" });
      })
      .catch(handleRejected);
  };

  const onTweet = () => {
    return asyncOnPublish
      .execute()
      .then((url) => {
        tweet({ url, text: name || "" });
      })
      .catch(handleRejected);
  };

  const { loading, execute } = asyncOnPublish;

  return {
    loading,
    execute,
    asyncOnPublish,
    onUrlCopy,
    onTweet,
    Snackbar,
  };
};
