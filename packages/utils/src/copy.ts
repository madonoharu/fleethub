function createFakeElement(value: string): HTMLTextAreaElement {
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";
  const fakeElement = document.createElement("textarea");
  // Prevent zooming on iOS
  fakeElement.style.fontSize = "12pt";
  // Reset box model
  fakeElement.style.border = "0";
  fakeElement.style.padding = "0";
  fakeElement.style.margin = "0";
  // Move element out of screen horizontally
  fakeElement.style.position = "absolute";
  fakeElement.style[isRTL ? "right" : "left"] = "-9999px";
  // Move element to the same position vertically
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElement.style.top = `${yPosition}px`;

  fakeElement.setAttribute("readonly", "");
  fakeElement.value = value;

  return fakeElement;
}

function select(element: HTMLTextAreaElement) {
  const isReadOnly = element.hasAttribute("readonly");

  if (!isReadOnly) {
    element.setAttribute("readonly", "");
  }

  element.select();
  element.setSelectionRange(0, element.value.length);

  if (!isReadOnly) {
    element.removeAttribute("readonly");
  }

  return element.value;
}

export async function copy(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch (_) {
    const fakeElement = createFakeElement(value);
    document.body.appendChild(fakeElement);
    select(fakeElement);
    document.execCommand("copy");
    fakeElement.remove();
  }
}
