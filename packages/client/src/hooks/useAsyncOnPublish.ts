import { useAsyncCallback } from "react-async-hook"
import copy from "copy-to-clipboard"

import { useSnackbar } from "./useSnackbar"
import { usePublishFile } from "./usePublishFile"

export const useAsyncOnPublish = (id: string) => {
  const publish = usePublishFile(id)
  const Snackbar = useSnackbar()

  const asyncOnPublish = useAsyncCallback(
    async () => {
      const url = await publish()
      const result = copy(url)
      if (!result) throw new Error("Failed to copy")

      return url
    },
    {
      onSuccess: () => Snackbar.show({ message: "共有URLをコピーしました", severity: "success" }),
      onError: (error) => {
        console.error(error)
        Snackbar.show({ message: "失敗しました", severity: "error" })
      },
    }
  )

  return { publish, asyncOnPublish, Snackbar }
}
