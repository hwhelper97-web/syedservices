import { getCurrencyInfo } from "./currencies";

export interface LineItemInput {
  serviceName: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  discountType?: "PERCENTAGE" | "FIXED" | string | null;
  discountValue?: number | null;
  taxRate?: number | null; // e.g. 5 for 5%
  sortOrder?: number;
}

export interface CalculatedLineItem extends LineItemInput {
  lineSubtotal: number;
  lineDiscountAmount: number;
  lineAfterDiscount: number;
  lineTaxAmount: number;
  lineTotal: number;
}

export interface InvoiceCalculationInput {
  currency?: string | null;
  items: LineItemInput[];
  discountType?: "PERCENTAGE" | "FIXED" | string | null;
  discountValue?: number | null;
  taxRate?: number | null; // invoice-level tax %
  shippingFee?: number | null;
  amountPaid?: number | null;
  dueDate?: Date | string | null;
  currentStatus?: string | null;
}

export interface InvoiceCalculationResult {
  items: CalculatedLineItem[];
  subtotal: number;
  lineDiscountsTotal: number;
  invoiceDiscountTotal: number;
  discountTotal: number;
  lineTaxesTotal: number;
  invoiceTaxTotal: number;
  taxTotal: number;
  shippingFee: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  suggestedStatus: string;
}

/**
 * Rounds a number to the decimal precision of the currency.
 */
export function roundToCurrency(amount: number, currencyCode?: string | null): number {
  const curr = getCurrencyInfo(currencyCode);
  const factor = Math.pow(10, curr.decimals);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/**
 * Calculates a single line item.
 */
export function calculateLineItem(item: LineItemInput, currencyCode?: string | null): CalculatedLineItem {
  const qty = Math.max(0, typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1);
  const price = Math.max(0, typeof item.unitPrice === "number" && !isNaN(item.unitPrice) ? item.unitPrice : 0);
  const lineSubtotal = roundToCurrency(qty * price, currencyCode);

  let lineDiscountAmount = 0;
  const discVal = typeof item.discountValue === "number" && !isNaN(item.discountValue) ? item.discountValue : 0;
  if (discVal > 0) {
    if (item.discountType === "PERCENTAGE") {
      lineDiscountAmount = roundToCurrency(lineSubtotal * (Math.min(100, Math.max(0, discVal)) / 100), currencyCode);
    } else if (item.discountType === "FIXED") {
      lineDiscountAmount = roundToCurrency(Math.min(lineSubtotal, discVal), currencyCode);
    }
  }

  const lineAfterDiscount = Math.max(0, roundToCurrency(lineSubtotal - lineDiscountAmount, currencyCode));

  let lineTaxAmount = 0;
  const taxRate = typeof item.taxRate === "number" && !isNaN(item.taxRate) ? item.taxRate : 0;
  if (taxRate > 0) {
    lineTaxAmount = roundToCurrency(lineAfterDiscount * (taxRate / 100), currencyCode);
  }

  const lineTotal = roundToCurrency(lineAfterDiscount + lineTaxAmount, currencyCode);

  return {
    ...item,
    quantity: qty,
    unitPrice: price,
    lineSubtotal,
    lineDiscountAmount,
    lineAfterDiscount,
    lineTaxAmount,
    lineTotal,
  };
}

/**
 * Calculates complete invoice totals with subtotal, discounts, taxes, fees, and balance.
 */
export function calculateInvoiceTotals(input: InvoiceCalculationInput): InvoiceCalculationResult {
  const currencyCode = input.currency || "PKR";
  const items = (input.items || []).map((it) => calculateLineItem(it, currencyCode));

  // Subtotal = sum of all raw line subtotals
  const subtotal = roundToCurrency(
    items.reduce((sum, it) => sum + it.lineSubtotal, 0),
    currencyCode
  );

  // Line discounts total
  const lineDiscountsTotal = roundToCurrency(
    items.reduce((sum, it) => sum + it.lineDiscountAmount, 0),
    currencyCode
  );

  // Remaining base after line discounts
  const afterLineDiscounts = Math.max(0, subtotal - lineDiscountsTotal);

  // Invoice-level discount
  let invoiceDiscountTotal = 0;
  const invDiscVal = typeof input.discountValue === "number" && !isNaN(input.discountValue) ? input.discountValue : 0;
  if (invDiscVal > 0) {
    if (input.discountType === "PERCENTAGE") {
      invoiceDiscountTotal = roundToCurrency(afterLineDiscounts * (Math.min(100, Math.max(0, invDiscVal)) / 100), currencyCode);
    } else if (input.discountType === "FIXED") {
      invoiceDiscountTotal = roundToCurrency(Math.min(afterLineDiscounts, invDiscVal), currencyCode);
    }
  }

  const discountTotal = roundToCurrency(lineDiscountsTotal + invoiceDiscountTotal, currencyCode);
  const taxableBase = Math.max(0, subtotal - discountTotal);

  // Line taxes total
  const lineTaxesTotal = roundToCurrency(
    items.reduce((sum, it) => sum + it.lineTaxAmount, 0),
    currencyCode
  );

  // Invoice-level tax
  let invoiceTaxTotal = 0;
  const invTaxRate = typeof input.taxRate === "number" && !isNaN(input.taxRate) ? input.taxRate : 0;
  if (invTaxRate > 0) {
    invoiceTaxTotal = roundToCurrency(taxableBase * (invTaxRate / 100), currencyCode);
  }

  const taxTotal = roundToCurrency(lineTaxesTotal + invoiceTaxTotal, currencyCode);

  const shippingFee = roundToCurrency(
    Math.max(0, typeof input.shippingFee === "number" && !isNaN(input.shippingFee) ? input.shippingFee : 0),
    currencyCode
  );

  const totalAmount = roundToCurrency(
    Math.max(0, subtotal - discountTotal + taxTotal + shippingFee),
    currencyCode
  );

  const amountPaid = roundToCurrency(
    Math.max(0, typeof input.amountPaid === "number" && !isNaN(input.amountPaid) ? input.amountPaid : 0),
    currencyCode
  );

  const balanceDue = roundToCurrency(Math.max(0, totalAmount - amountPaid), currencyCode);

  // Determine suggested status
  let suggestedStatus = input.currentStatus || "ISSUED";
  if (suggestedStatus === "VOID" || suggestedStatus === "CANCELLED") {
    // Keep cancelled/void
  } else if (totalAmount > 0 && balanceDue <= 0.0001 && amountPaid >= totalAmount) {
    suggestedStatus = "PAID";
  } else if (amountPaid > 0 && balanceDue > 0.0001) {
    suggestedStatus = "PARTIALLY_PAID";
  } else if (amountPaid === 0) {
    const isOverdue = input.dueDate ? new Date(input.dueDate).getTime() < new Date().setHours(0, 0, 0, 0) : false;
    if (isOverdue && suggestedStatus !== "DRAFT") {
      suggestedStatus = "OVERDUE";
    } else if (suggestedStatus === "DRAFT") {
      suggestedStatus = "DRAFT";
    } else if (suggestedStatus === "SENT") {
      suggestedStatus = "SENT";
    } else {
      suggestedStatus = "ISSUED";
    }
  }

  return {
    items,
    subtotal,
    lineDiscountsTotal,
    invoiceDiscountTotal,
    discountTotal,
    lineTaxesTotal,
    invoiceTaxTotal,
    taxTotal,
    shippingFee,
    totalAmount,
    amountPaid,
    balanceDue,
    suggestedStatus,
  };
}
