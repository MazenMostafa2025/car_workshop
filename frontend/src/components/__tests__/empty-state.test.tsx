import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/data/empty-state";
import { Search } from "lucide-react";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Empty" description="Try adjusting your search" />);
    expect(screen.getByText("Try adjusting your search")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Empty" />);
    // The description text should not be in the document
    expect(screen.queryByText(/.+/)).not.toBeNull(); // title is present
    expect(screen.queryByText("Try adjusting your search")).not.toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add New</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Add New" })).toBeInTheDocument();
  });

  it("renders custom icon when provided", () => {
    render(
      <EmptyState title="No search results" icon={<Search data-testid="custom-icon" />} />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders default icon when none provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    // Default icon is FolderOpen which renders as SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<EmptyState title="Empty" className="min-h-[400px]" />);
    expect(container.firstChild).toHaveClass("min-h-[400px]");
  });
});
