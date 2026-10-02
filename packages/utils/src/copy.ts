export async function copy(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch (_) {
    let written = false;
    const onCopy = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      // A modal's focus trap can prevent selecting a temporary textarea.
      event.clipboardData.setData("text/plain", value);
      event.preventDefault();
      written = true;
    };

    document.addEventListener("copy", onCopy);
    try {
      if (!document.execCommand("copy") || !written) {
        throw new Error("Failed to copy text to the clipboard");
      }
    } finally {
      document.removeEventListener("copy", onCopy);
    }
  }
}
