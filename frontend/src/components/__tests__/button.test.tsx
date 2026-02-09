import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text content", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("fires onClick handler", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);

    await user.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("can be disabled", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <Button disabled onClick={handler}>
        Disabled
      </Button>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders correct variant classes", () => {
    const { rerender } = render(<Button variant="destructive">Del</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Out</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");
  });

  it("renders correct size classes", () => {
    const { rerender } = render(<Button size="sm">S</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9");

    rerender(<Button size="lg">L</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-11");
  });

  it("applies custom className", () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom");
  });

  it("supports type=submit", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
