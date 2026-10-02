import { describe, expect, it, spyOn } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import { useSnackbar } from "./useSnackbar";

function ErrorNotice({ error }: { error: unknown }) {
  const Snackbar = useSnackbar();
  return (
    <>
      <button onClick={() => Snackbar.error(error)}>Show error</button>
      <Snackbar />
    </>
  );
}

describe("useSnackbar error messages", () => {
  it.each([
    {
      name: "serialized thunk error",
      error: { name: "Error", message: "共有リンクを作成できませんでした" },
      message: "共有リンクを作成できませんでした",
    },
    {
      name: "Error instance",
      error: new Error("Clipboard permission denied"),
      message: "Clipboard permission denied",
    },
    {
      name: "string rejection",
      error: "通信に失敗しました",
      message: "通信に失敗しました",
    },
    { name: "numeric rejection", error: 503, message: "503" },
    { name: "null rejection", error: null, message: "null" },
  ])("renders a readable alert for $name", ({ error, message }) => {
    const log = spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorNotice error={error} />);

    fireEvent.click(screen.getByRole("button", { name: "Show error" }));

    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("alert")).not.toHaveTextContent("[object Object]");
    expect(log).toHaveBeenCalledWith(error);
  });
});
