// Centralized order status values to avoid typos across the app
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", order: 1 },
  { value: "preparing", label: "Preparing", order: 2 },
  { value: "awaiting pickup", label: "Awaiting Pickup", order: 3 },
  { value: "out for delivery", label: "Out for Delivery", order: 4 },
  { value: "delivered", label: "Delivered", order: 5 },
];

// Statuses that owners can manually select, except delivered and out for delivery
export const OWNER_SELECTABLE_STATUSES = ORDER_STATUSES.filter(
  (status) => status.value !== "delivered" && status.value !== "out for delivery"
);

// All statuses that should be shown in owner dropdown
export const OWNER_VISIBLE_STATUSES = ORDER_STATUSES.filter(
  (status) => status.value !== "delivered"
);

export const getOrderStatusLabel = (value) => {
  if (!value) return value;
  const status = ORDER_STATUSES.find((s) => s.value === value);
  return status ? status.label : value.charAt(0).toUpperCase() + value.slice(1);
};

// Get next available statuses for owners (excludes delivered and out for delivery= disabled)
export const getNextAvailableStatuses = (currentStatus) => {
  if (!currentStatus || currentStatus === "delivered") {
    return []; 
  }
  
  const currentStatusObj = OWNER_SELECTABLE_STATUSES.find((s) => s.value === currentStatus);
  if (!currentStatusObj) return OWNER_SELECTABLE_STATUSES; 
  
  return OWNER_SELECTABLE_STATUSES.filter((status) => status.order > currentStatusObj.order);
};

export const canChangeStatus = (currentStatus) => {
  return currentStatus !== "delivered";
};

