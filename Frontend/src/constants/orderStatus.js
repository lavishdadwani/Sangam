// Centralized order status values to avoid typos across the app
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  // Note: backend currently expects "out of delivery"
  { value: "out for delivery", label: "Out for Delivery" },
];

export const getOrderStatusLabel = (value) =>
  ORDER_STATUSES.find((s) => s.value === value)?.label || value;

