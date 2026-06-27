export type AdminRole = 'superadmin' | 'ops' | 'support';

export type UserRole = 'user' | 'owner' | 'deliveryBoy';
export type UserStatus = 'active' | 'deactivated' | 'blocked' | 'banned';

export interface PlatformUser {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  isOnline: boolean;
  photo: string | null;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  users: PlatformUser[];
  pagination: Pagination;
}

export interface Rider extends PlatformUser {
  isApproved: boolean;
  location: {
    address: string | null;
    city: string | null;
    coordinates: [number, number];
  };
}

export interface RiderStats {
  totalDeliveries: number;
  totalOrderValue: number;
}

export type NotificationType = 'info' | 'warning' | 'promotion' | 'system';
export type NotificationStatus = 'sent' | 'scheduled' | 'failed';
export type NotificationTarget = 'all' | 'user' | 'owner' | 'deliveryBoy' | 'specific';

export interface NotificationRecord {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetRole: NotificationTarget;
  targetUserId: string | null;
  sendEmail: boolean;
  sentBy: { _id: string; fullName: string; email: string } | null;
  status: NotificationStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
}

export interface NotificationTemplate {
  _id: string;
  name: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface PaginatedNotifications {
  notifications: NotificationRecord[];
  pagination: Pagination;
}

export type ComplaintStatus   = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintCategory = 'order' | 'restaurant' | 'rider' | 'payment' | 'other';

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  raisedBy: { _id: string; fullName: string; email: string; mobile?: string; role: string } | null;
  assignedTo: { _id: string; fullName: string; email: string; role: string } | null;
  orderId: { _id: string; totalAmount: number; paymentMethod: string; createdAt: string } | null;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStaff {
  _id: string;
  fullName: string;
  email: string;
  role: AdminRole;
}

export interface PaginatedComplaints {
  complaints: Complaint[];
  pagination: Pagination;
}

export interface PlatformSettings {
  _id?: string;
  deliveryCharge: { base: number; perKm: number; freeAbove: number };
  commission: { percentage: number };
  tax: { gst: number };
  order: { minOrderAmount: number; maxDeliveryRadiusKm: number };
  notifications: { emailEnabled: boolean };
  updatedAt?: string;
}

export interface AdminProfile {
  _id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
}

export interface DailyPoint {
  _id: { year: number; month: number; day: number };
  revenue?: number;
  orders?: number;
  count?: number;
}

export interface HourPoint { _id: number; count: number; }
export interface PaymentPoint { _id: string; count: number; }

export interface TopRestaurant {
  _id: string;
  name: string;
  city: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsData {
  days: number;
  revenueAndOrders: DailyPoint[];
  customerGrowth: DailyPoint[];
  peakHours: HourPoint[];
  paymentBreakdown: PaymentPoint[];
  topRestaurants: TopRestaurant[];
}

export interface TopRider {
  _id: string;
  fullName: string;
  email: string;
  isOnline: boolean;
  deliveryCount: number;
  totalValue: number;
}

export interface FleetStats {
  riders: { total: number; online: number; offline: number; busy: number; available: number };
  deliveries: { today: number; avgMinutes: number };
  topRiders: TopRider[];
}

export type OrderStatus = 'pending' | 'preparing' | 'awaiting pickup' | 'out for delivery' | 'delivered' | 'cancelled';

export interface ShopOrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  item: { _id: string; name: string; image: string; price: number } | null;
}

export interface ShopOrder {
  _id: string;
  shop: { _id: string; name: string; image: string; city: string; address: string } | null;
  owner: string;
  subTotal: number;
  status: OrderStatus;
  shopOrderItems: ShopOrderItem[];
  assignedDeliveryBoy: { _id: string; fullName: string; email: string; mobile: string; isOnline: boolean } | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  _id: string;
  user: { _id: string; fullName: string; email: string; mobile: string } | null;
  paymentMethod: 'cod' | 'online';
  totalAmount: number;
  payment: boolean;
  deliveryAddress: { text: string; latitude: number; longitude: number };
  shopOrders: ShopOrder[];
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
}

export interface PaginatedOrders {
  orders: AdminOrder[];
  pagination: Pagination;
}

export type RestaurantStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Restaurant {
  _id: string;
  name: string;
  image: string;
  city: string;
  state: string;
  address: string;
  status: RestaurantStatus;
  createdAt: string;
  owner: { _id: string; fullName: string; email: string; mobile: string };
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  foodType: 'veg' | 'non veg';
  image: string;
  rating: { average: number; count: number };
}

export interface RestaurantStats {
  itemCount: number;
  totalOrders: number;
  totalRevenue: number;
  avgRating: number;
}

export interface PaginatedRestaurants {
  restaurants: Restaurant[];
  pagination: Pagination;
}

export interface PaginatedRiders {
  riders: Rider[];
  pagination: Pagination;
}

export interface DashboardStats {
  users: { total: number; owners: number; deliveryBoys: number };
  shops: { total: number };
  orders: { total: number; pending: number; today: number };
  revenue: { total: number };
}

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: AdminRole;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}
