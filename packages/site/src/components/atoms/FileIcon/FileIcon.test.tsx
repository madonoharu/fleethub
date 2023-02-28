import { renderWithProviders } from "../../../test-utils";

import FileIcon from "./FileIcon";

describe("FileIcon", () => {
  it("plan", () => {
    const { getByTestId } = renderWithProviders(<FileIcon type="plan" />);
    expect(getByTestId("DescriptionIcon")).toBeTruthy();
  });

  it("folder", () => {
    const { getByTestId } = renderWithProviders(<FileIcon type="folder" />);
    expect(getByTestId("FolderIcon")).toBeTruthy();
  });
});
