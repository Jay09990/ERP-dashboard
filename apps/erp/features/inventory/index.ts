// Inventory feature barrel export
// This is the only import path other features should use

export * from "./api";
export * from "./schema";

export { WarehouseList } from "./components/WarehouseList";
export { WarehouseFormDrawer } from "./components/WarehouseFormDrawer";
export { BatchList } from "./components/BatchList";
export { BatchFormDrawer } from "./components/BatchFormDrawer";
export { StockSummaryView } from "./components/StockSummaryView";
export { StockLedgerView } from "./components/StockLedgerView";
export { TransferList } from "./components/TransferList";
export { TransferFormDrawer } from "./components/TransferFormDrawer";
export { AdjustmentList } from "./components/AdjustmentList";
export { AdjustmentFormDrawer } from "./components/AdjustmentFormDrawer";