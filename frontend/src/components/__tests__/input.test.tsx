import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("accepts text input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Name" />);

    const input = screen.getByPlaceholderText("Name");
    await user.type(input, "John Doe");
    expect(input).toHaveValue("John Doe");
  });

  it("can be disabled", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("supports type=password", () => {
    render(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
  });

  it("supports type=email", () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
  });

  it("supports type=number", () => {
    render(<Input type="number" placeholder="Count" />);
    expect(screen.getByPlaceholderText("Count")).toHaveAttribute("type", "number");
  });

  it("applies custom className", () => {
    render(<Input className="w-64" placeholder="Sized" />);
    expect(screen.getByPlaceholderText("Sized")).toHaveClass("w-64");
  });

  it("fires onChange handler", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<Input onChange={handler} placeholder="Type" />);

    await user.type(screen.getByPlaceholderText("Type"), "a");
    expect(handler).toHaveBeenCalled();
  });

  it("supports defaultValue", () => {
    render(<Input defaultValue="preset" placeholder="Val" />);
    expect(screen.getByPlaceholderText("Val")).toHaveValue("preset");
  });
});
