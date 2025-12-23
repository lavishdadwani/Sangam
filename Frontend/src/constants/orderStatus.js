// Centralized order status values to avoid typos across the app
// Order matters - statuses must progress forward only
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", order: 1 },
  { value: "preparing", label: "Preparing", order: 2 },
  { value: "out for delivery", label: "Out for Delivery", order: 3 },
  { value: "delivered", label: "Delivered", order: 4 },
];

// Statuses that owners can select (excludes "delivered" - only delivery boys can mark as delivered)
export const OWNER_SELECTABLE_STATUSES = ORDER_STATUSES.filter(
  (status) => status.value !== "delivered"
);

export const getOrderStatusLabel = (value) => {
  if (!value) return value;
  const status = ORDER_STATUSES.find((s) => s.value === value);
  return status ? status.label : value.charAt(0).toUpperCase() + value.slice(1);
};

// Get next available statuses for owners (forward progression only, excludes delivered)
export const getNextAvailableStatuses = (currentStatus) => {
  if (!currentStatus || currentStatus === "delivered") {
    return []; // No status changes allowed if delivered
  }
  
  const currentStatusObj = OWNER_SELECTABLE_STATUSES.find((s) => s.value === currentStatus);
  if (!currentStatusObj) return OWNER_SELECTABLE_STATUSES; // If status not found, show all owner-selectable
  
  // Return only statuses that are forward in progression (excluding delivered)
  return OWNER_SELECTABLE_STATUSES.filter((status) => status.order > currentStatusObj.order);
};

// Check if status can be changed
export const canChangeStatus = (currentStatus) => {
  return currentStatus !== "delivered";
};

