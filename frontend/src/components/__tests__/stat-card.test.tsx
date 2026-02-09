import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/data/stat-card";
import { Users } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Customers" value={150} />);
    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<StatCard title="Revenue" value="$10,000" />);
    expect(screen.getByText("$10,000")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<StatCard title="Orders" value={42} description="Last 30 days" />);
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<StatCard title="Orders" value={42} />);
    expect(screen.queryByText("Last 30 days")).not.toBeInTheDocument();
  });

  it("renders positive trend", () => {
    render(
      <StatCard
        title="Revenue"
        value="$5K"
        trend={{ value: 12.5, isPositive: true }}
      />,
    );
    expect(screen.getByText(/↑/)).toBeInTheDocument();
    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
  });

  it("renders negative trend", () => {
    render(
      <StatCard
        title="Expenses"
        value="$3K"
        trend={{ value: 5, isPositive: false }}
      />,
    );
    expect(screen.getByText(/↓/)).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <StatCard title="Users" value={10} icon={Users} />,
    );
    // The lucide icon renders as an SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatCard title="Test" value={0} className="col-span-2" />,
    );
    // The outer Card should have the custom class
    expect(container.firstChild).toHaveClass("col-span-2");
  });
});
