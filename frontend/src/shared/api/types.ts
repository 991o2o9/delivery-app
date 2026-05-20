export enum UserRole {
  CLIENT = 'ROLE_CLIENT',
  COURIER = 'ROLE_COURIER',
  ADMIN = 'ROLE_ADMIN',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum CargoType {
  FOOD = 'FOOD',
  DOCUMENT = 'DOCUMENT',
  PARCEL = 'PARCEL',
}

export enum Urgency {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

export type UserResponseDto = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type JwtResponse = {
  token: string;
  email: string;
  role: UserRole;
  id: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserRegistrationRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export interface OrderRequestDto {
  pickupAddress: string;
  pickupLat: number;
  pickupLon: number;
  destinationAddress: string;
  destLat: number;
  destLon: number;
  cargoType: CargoType;
  weight: number;
  description: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  urgency: Urgency;
  paymentMethod: PaymentMethod;
  pickupComment?: string;
  deliveryComment?: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export type ReviewResponseDto = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  orderId: string;
};

export type DashboardStatsDto = {
  totalRevenue: number;
  totalOrders: number;
  activeCouriers: number;
  ordersByStatus: Record<OrderStatus, number>;
};

export type CourierSummaryDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rating: number;
  completedOrdersCount: number;
  active: boolean;
};

export type OrderHistoryDto = {
  id: string;
  status: OrderStatus;
  changedAt: string;
  comment?: string;
};

export type OrderResponseDto = {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
  cargoType: CargoType;
  urgency: Urgency;
  paymentMethod: PaymentMethod;
  price: number;
  weight: number;
  distanceKm: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLon: number;
  destinationAddress: string;
  destLat: number;
  destLon: number;
  pickupComment?: string;
  deliveryComment?: string;
  description?: string;
  senderPhone?: string;
  receiverPhone?: string;
  clientEmail?: string;
  courierEmail?: string;
  receiverName?: string;
  estimatedArrivalTime?: string;
  createdAt: string;
  updatedAt: string;
  history: OrderHistoryDto[];
  isReviewed?: boolean;
};

export type CourierApplicationDto = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

export interface AvailableOrderResponseDto extends OrderResponseDto {
  distanceFromYou: number;
}

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
