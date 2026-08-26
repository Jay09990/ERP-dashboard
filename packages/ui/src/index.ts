// shadcn/ui primitives
export * from "./components/ui/button";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/card";
export * from "./components/ui/table";
export * from "./components/ui/badge";
export * from "./components/ui/progress";
export * from "./components/ui/separator";

// Hand-rolled composite components (DataTable, StatusPill, FilterBar, StatCard)
// These wrap the raw HTML/CSS layer and remain the public API so call sites don't change.
export { DataTable, StatusPill, FilterBar, StatCard } from "./components";

// cn utility (re-exported so consumers can use it without a separate import)
export { cn } from "./lib/utils";
