import { render, screen } from "@testing-library/react";
jest.mock("./Components/ParticleBackground", () => () => (
  <div data-testid="particle-background" />
));
import App from "./App";

test("renders the app shell without the voice feature on the default page", () => {
  render(<App />);
  expect(screen.getAllByText(/intro/i).length).toBeGreaterThan(0);
  expect(
    screen.queryByText(/voice assistant/i, { selector: "h3" }),
  ).not.toBeInTheDocument();
});
