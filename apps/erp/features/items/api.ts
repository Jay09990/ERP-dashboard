import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import type {
  Item,
  ItemCategory,
  ItemCategoryValues,
  ItemType,
  ItemTypeValues,
  ItemValues,
} from "./schema";

export function useItems(params?: Record<string, string>) {
  const qc = useQueryClient();
  return createResourceHooks<Item, ItemValues, ItemValues>(
    "items",
    endpoints.items.items,
    apiClient,
    qc,
  ).useList(params);
}

export function useCreateItem() {
  const qc = useQueryClient();
  return createResourceHooks<Item, ItemValues, ItemValues>(
    "items",
    endpoints.items.items,
    apiClient,
    qc,
  ).useCreate();
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return createResourceHooks<Item, ItemValues, ItemValues>(
    "items",
    endpoints.items.items,
    apiClient,
    qc,
  ).useUpdate();
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return createResourceHooks<Item, ItemValues, ItemValues>(
    "items",
    endpoints.items.items,
    apiClient,
    qc,
  ).useDelete();
}

// Item Types
export function useItemTypes(params?: Record<string, string>) {
  const qc = useQueryClient();
  return createResourceHooks<ItemType, ItemTypeValues, ItemTypeValues>(
    "item-types",
    endpoints.masters.itemType,
    apiClient,
    qc,
  ).useList(params);
}

export function useCreateItemType() {
  const qc = useQueryClient();
  return createResourceHooks<ItemType, ItemTypeValues, ItemTypeValues>(
    "item-types",
    endpoints.masters.itemType,
    apiClient,
    qc,
  ).useCreate();
}

export function useUpdateItemType() {
  const qc = useQueryClient();
  return createResourceHooks<ItemType, ItemTypeValues, ItemTypeValues>(
    "item-types",
    endpoints.masters.itemType,
    apiClient,
    qc,
  ).useUpdate();
}

export function useDeleteItemType() {
  const qc = useQueryClient();
  return createResourceHooks<ItemType, ItemTypeValues, ItemTypeValues>(
    "item-types",
    endpoints.masters.itemType,
    apiClient,
    qc,
  ).useDelete();
}

// Item Categories
export function useItemCategories(params?: Record<string, string>) {
  const qc = useQueryClient();
  return createResourceHooks<ItemCategory, ItemCategoryValues, ItemCategoryValues>(
    "item-categories",
    endpoints.masters.itemCategories,
    apiClient,
    qc,
  ).useList(params);
}

export function useCreateItemCategory() {
  const qc = useQueryClient();
  return createResourceHooks<ItemCategory, ItemCategoryValues, ItemCategoryValues>(
    "item-categories",
    endpoints.masters.itemCategories,
    apiClient,
    qc,
  ).useCreate();
}

export function useUpdateItemCategory() {
  const qc = useQueryClient();
  return createResourceHooks<ItemCategory, ItemCategoryValues, ItemCategoryValues>(
    "item-categories",
    endpoints.masters.itemCategories,
    apiClient,
    qc,
  ).useUpdate();
}

export function useDeleteItemCategory() {
  const qc = useQueryClient();
  return createResourceHooks<ItemCategory, ItemCategoryValues, ItemCategoryValues>(
    "item-categories",
    endpoints.masters.itemCategories,
    apiClient,
    qc,
  ).useDelete();
}
