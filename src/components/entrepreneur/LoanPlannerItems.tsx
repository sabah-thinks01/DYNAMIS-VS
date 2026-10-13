"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";

export interface PurchaseItem {
  id: string;
  name: string;
  amount: string;
}

interface LoanPlannerItemsProps {
  items: PurchaseItem[];
  totalCost: number;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: "name" | "amount", value: string) => void;
}

export function LoanPlannerItems({
  items,
  totalCost,
  onAddItem,
  onRemoveItem,
  onItemChange,
}: LoanPlannerItemsProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-main">What you need to buy</h2>
          <p className="text-xs text-muted">
            Add the tools, materials, or equipment your business needs.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-muted block">Total cost</span>
          <span className="text-lg sm:text-xl font-extrabold text-accent">
            {formatINR(totalCost)}
          </span>
        </div>
      </div>

      {/* Items Rows */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-surface-subtle/50 border border-border-default/60"
          >
            <div className="flex-1">
              <label htmlFor={`item-name-${item.id}`} className="sr-only">
                Item description
              </label>
              <input
                id={`item-name-${item.id}`}
                type="text"
                value={item.name}
                onChange={(e) => onItemChange(item.id, "name", e.target.value)}
                placeholder={`Item ${index + 1} (e.g. Sewing machine, raw materials)`}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border border-border-default bg-surface text-main placeholder:text-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              />
            </div>

            <div className="w-full sm:w-44 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted">
                  ₹
                </span>
                <label htmlFor={`item-amount-${item.id}`} className="sr-only">
                  Amount in rupees
                </label>
                <input
                  id={`item-amount-${item.id}`}
                  type="number"
                  min="0"
                  step="1000"
                  value={item.amount}
                  onChange={(e) => onItemChange(item.id, "amount", e.target.value)}
                  placeholder="Cost"
                  className="w-full pl-7 pr-3 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-lg border border-border-default bg-surface text-main placeholder:text-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove item ${index + 1}`}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-status-error hover:bg-status-error-bg border border-transparent hover:border-status-error-border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <div className="pt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-border-default bg-surface hover:bg-surface-hover text-main text-xs sm:text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>Add item</span>
        </button>

        <span className="text-xs text-muted">
          {items.filter((i) => Number(i.amount) > 0).length}{" "}
          {items.filter((i) => Number(i.amount) > 0).length === 1 ? "item added" : "items added"}
        </span>
      </div>
    </div>
  );
}
