export function download(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const elem = document.createElement("a");
  elem.style.display = "none";
  elem.href = url;
  elem.setAttribute("download", filename);

  if (typeof elem.download === "undefined") {
    elem.setAttribute("target", "_blank");
  }

  document.body.appendChild(elem);
  elem.click();

  setTimeout(() => {
    document.body.removeChild(elem);
    URL.revokeObjectURL(url);
  }, 200);
}
