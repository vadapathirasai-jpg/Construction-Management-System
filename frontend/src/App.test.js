import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppDataProvider } from "./context/AppData";

test("renders the dashboard", () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppDataProvider><App /></AppDataProvider>
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /Dashboard/ })).toBeInTheDocument();
  expect(screen.getByText("Recent Projects")).toBeInTheDocument();
});
