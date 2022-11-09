import { render, RenderOptions } from "@testing-library/react";

import { ThemeProvider } from "./styles";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(console, "error").mockImplementation(() => {});

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: Providers, ...options });
}
