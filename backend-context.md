# Frontend Integration Blueprint: Delivery System API

This document provides a comprehensive technical specification for the Frontend team. Use these interfaces and endpoint definitions to build the integration layer of the React application.

---

## 1. Data Models (TypeScript Interfaces)

### Enums
```typescript
export enum UserRole {
  CLIENT = 'CLIENT',
  COURIER = 'COURIER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum CargoType {
  FOOD = 'FOOD',
  DOCUMENT = 'DOCUMENT',
  PARCEL = 'PARCEL'
}

export enum Urgency {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
```

### Generic Pagination Wrapper
Spring Data returns a `Page<T>` object for paginated collections:
```typescript
export interface Page<T> {
  content: T[];          // Actual list of items
  totalPages: number;    // Total number of available pages
  totalElements: number; // Total count of items in database
  size: number;          // Page size (e.g., 10)
  number: number;        // Current page index (starts at 0)
  last: boolean;         // true if this is the last page
  first: boolean;        // true if this is the first page
  numberOfElements: number; // Count of items in the current page
}
```

### DTOs
```typescript
export interface UserRegistrationRequest {
  email: string;
  password: string; // min 6 chars
  firstName: string;
  lastName: string;
}

export interface UserResponseDto {
  id: string; // UUID
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePictureUrl?: string;
  rating: number;
  defaultAddress?: string;
}

export interface UserProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  defaultAddress?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  email: string;
  role: string; // "ROLE_CLIENT", "ROLE_COURIER", "ROLE_ADMIN"
  id: string; // UUID
}

export interface OrderRequestDto {
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number; // Must be handled as number (double precision)
  pickupLon: number;
  destLat: number;
  destLon: number;
  cargoType?: CargoType; // Default: PARCEL
  weight?: number; // Default: 1.0
  description?: string;
  senderPhone?: string;
  receiverName?: string;
  receiverPhone?: string;
  pickupComment?: string;
  deliveryComment?: string;
  urgency?: Urgency; // Default: STANDARD
  paymentMethod?: PaymentMethod; // Default: CASH
}

export interface StatusHistoryDto {
  status: OrderStatus;
  changedAt: string; // ISO-8601, parse with new Date(value)
}

export interface OrderResponseDto {
  id: string;
  clientEmail: string;
  courierEmail?: string;
  status: OrderStatus;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number;
  pickupLon: number;
  destLat: number;
  destLon: number;
  distanceKm: number;
  price: number;
  estimatedArrivalTime: string; // ISO-8601
  createdAt: string; // ISO-8601
  cargoType: CargoType;
  weight: number;
  receiverName?: string;
  urgency: Urgency;
  paymentMethod: PaymentMethod;
  history?: StatusHistoryDto[];
}

export interface AvailableOrderResponseDto extends OrderResponseDto {
  distanceFromYou: number; // km, rounded to 2 decimals
}

export interface DashboardStatsDto {
  totalRevenue: number;
  totalOrders: number;
  activeCouriers: number;
  ordersByStatus: Record<OrderStatus, number>;
  averageDeliveryTimeMinutes: number;
}

export interface CourierSummaryDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rating: number;
  completedOrdersCount: number;
  isActive: boolean;
}

export interface ErrorResponse {
  timestamp: string; // ISO-8601
  message: string;
  details: string;
}
```

---

## 2. API Endpoints Registry

### Authentication & Public
| Method | URL | Body | Response (200/201) | Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `UserRegistrationRequest` | `UserResponseDto` | Public |
| `POST` | `/api/auth/login` | `LoginRequest` | `JwtResponse` | Public |
| `GET` | `/api/health` | None | `{ "status": "UP", "message": "..." }` | Public |

### Client Operations
| Method | URL | Body | Response | Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | `OrderRequestDto` | `OrderResponseDto` | `CLIENT`, `ADMIN` |
| `GET` | `/api/orders/my` | None | `Page<OrderResponseDto>` | `CLIENT` |
| `GET` | `/api/orders/{id}` | None | `OrderResponseDto` | Any Authenticated |
| `GET` | `/api/users/profile/{id}` | None | `UserResponseDto` | Any Authenticated |
| `PUT` | `/api/users/profile/{id}` | `UserProfileUpdateDto` | `UserResponseDto` | Own Profile / ADMIN |
| `POST` | `/api/applications/apply/{userId}` | `{ "message": string }` | `CourierApplicationResponse` | `CLIENT` |

### Courier Workflow
> **Important**: Status transition endpoints expect an **Empty Request Body**.
| Method | URL | Params | Response | Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/available` | `lat`, `lon` | `AvailableOrderResponseDto[]` | `COURIER` |
| `POST` | `/api/orders/{id}/accept` | None | `OrderResponseDto` | `COURIER` |
| `PATCH` | `/api/orders/{id}/pickup` | None | `OrderResponseDto` | `COURIER` (assigned) |
| `PATCH` | `/api/orders/{id}/start-transit`| None | `OrderResponseDto` | `COURIER` (assigned) |
| `PATCH` | `/api/orders/{id}/complete` | None | `OrderResponseDto` | `COURIER` (assigned) |

### Admin Dashboard & Management
> **Note**: The `ADMIN` role has authority to view all orders and manage all user accounts.
| Method | URL | Body | Response | Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/summary` | None | `DashboardStatsDto` | `ADMIN` |
| `GET` | `/api/admin/orders` | `?page=0&size=10` | `Page<AdminOrderResponseDto>`| `ADMIN` |
| `GET` | `/api/admin/couriers` | None | `CourierSummaryDto[]` | `ADMIN` |
| `POST` | `/api/admin/couriers/{id}/block` | None | `void` | `ADMIN` |

---

## 3. Business Logic Details

### Pricing Calculation
The backend uses a multi-factor formula in `PricingService`:
- **Formula**: `(basePrice + (distanceKm * pricePerKm)) * urgencyMultiplier + (weightKg * pricePerKg)`
- **Defaults**:
    - `basePrice`: 5.0
    - `pricePerKm`: 1.5
    - `pricePerKg`: 0.5
    - `urgencyMultiplier (EXPRESS)`: 1.5
- All prices are returned rounded to 2 decimal places.

### Courier Market sorting
When a courier requests available orders, the backend calculates the **Haversine Distance** (straight-line distance on a sphere) between the courier's `lat/lon` and the order's `pickupLat/Lon`.
The list is returned sorted by `distanceFromYou` ascending.

### Constraints & Validation
1. **One Active Order**: A courier cannot accept a new order if they already have one in `ASSIGNED`, `PICKED_UP`, or `IN_TRANSIT` status.
2. **Status Sequence**:
    - `ASSIGNED` -> `PICKED_UP`
    - `PICKED_UP` -> `IN_TRANSIT`
    - `IN_TRANSIT` -> `DELIVERED`
    - Any skip or backward transition results in an `IllegalStatusTransitionException` (400).

---

## 4. Error Catalog

All errors return a standardized JSON structure:

```json
{
  "timestamp": "2026-05-02T19:55:00",
  "message": "Error description",
  "details": "uri=/api/orders/..."
}
```

| HTTP Status | Trigger Case |
| :--- | :--- |
| `400 Bad Request` | Validation failure, skip delivery stages, or already having an active order. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | Accessing an endpoint without the required role (e.g., Client calling Admin API). |
| `404 Not Found` | Resource (Order, User) does not exist. |
| `502 Bad Gateway` | External API failure (Google Maps). |

---

## 5. Implementation & Integration Notes

### Frontend Environment
- **Google Maps**: The React app requires its own `VITE_GOOGLE_MAPS_API_KEY` for client-side map rendering and location searching.
- **Coordinates**: Always handle `latitude` and `longitude` as `number` types in TypeScript to match backend `Double` precision.

### Date Parsing
- All string fields representing dates (e.g., `createdAt`, `changedAt`, `estimatedArrivalTime`) are in **ISO-8601** format.
- They can be directly parsed using `new Date(value)` or libraries like `dayjs`/`date-fns`.

### JWT Storage
- Store the token in `localStorage` or a `SecureCookie`. 
- Header requirement: `Authorization: Bearer <token>`.

### CORS & Base URL
- **Base URL**: `http://localhost:8080`.
- **CORS**: Configured to allow all origins (`*`) and standard headers.
