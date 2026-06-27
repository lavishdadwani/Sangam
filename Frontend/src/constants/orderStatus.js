// Centralized order status values to avoid typos across the app
export const ORDER_STATUSES = [
  { value: "pending",           label: "Pending",           order: 1 },
  { value: "preparing",         label: "Preparing",         order: 2 },
  { value: "awaiting pickup",   label: "Awaiting Pickup",   order: 3 },
  { value: "out for delivery",  label: "Out for Delivery",  order: 4 },
  { value: "delivered",         label: "Delivered",         order: 5 },
  { value: "cancelled",         label: "Cancelled",         order: 6 },
];

// Statuses that owners can manually select (not delivered, not out for delivery, not cancelled)
export const OWNER_SELECTABLE_STATUSES = ORDER_STATUSES.filter(
  (s) => !["delivered", "out for delivery", "cancelled"].includes(s.value)
);

// All statuses that should be shown in owner dropdown
export const OWNER_VISIBLE_STATUSES = ORDER_STATUSES.filter(
  (s) => !["delivered", "cancelled"].includes(s.value)
);

export const TERMINAL_STATUSES = ["delivered", "cancelled"];

export const getOrderStatusLabel = (value) => {
  if (!value) return value;
  const status = ORDER_STATUSES.find((s) => s.value === value);
  return status ? status.label : value.charAt(0).toUpperCase() + value.slice(1);
};

// Get next available statuses for owners
export const getNextAvailableStatuses = (currentStatus) => {
  if (!currentStatus || TERMINAL_STATUSES.includes(currentStatus)) return [];
  const currentStatusObj = OWNER_SELECTABLE_STATUSES.find((s) => s.value === currentStatus);
  if (!currentStatusObj) return OWNER_SELECTABLE_STATUSES;
  return OWNER_SELECTABLE_STATUSES.filter((s) => s.order > currentStatusObj.order);
};

export const canChangeStatus = (currentStatus) => {
  return !TERMINAL_STATUSES.includes(currentStatus);
};
