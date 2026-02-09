import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary");
  });

  it("applies destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveClass("bg-destructive");
  });

  it("applies success variant", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveClass("bg-green-100");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warn</Badge>);
    expect(screen.getByText("Warn")).toHaveClass("bg-amber-100");
  });

  it("applies info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info")).toHaveClass("bg-blue-100");
  });

  it("applies outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).not.toHaveClass("bg-primary");
  });

  it("merges custom className", () => {
    render(<Badge className="my-class">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("my-class");
  });
});
