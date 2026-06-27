// Centralized order status constants to avoid typos across the backend
export const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  AWAITING_PICKUP: "awaiting pickup",
  OUT_FOR_DELIVERY: "out for delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

// Statuses that owners can manually set
export const OWNER_SELECTABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.AWAITING_PICKUP,
];

// Check if owner can set a status
export const canOwnerSetStatus = (status) => {
  return OWNER_SELECTABLE_STATUSES.includes(status);
};

