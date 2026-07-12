import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppDataProvider } from "./context/AppData";

test("redirects unauthenticated dashboard visits to login", () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppDataProvider><App /></AppDataProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /SECURE ENTRY/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Login to dashboard/ })).toBeInTheDocument();
});
