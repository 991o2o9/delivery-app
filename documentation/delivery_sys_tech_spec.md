# DELIVERY / COURIER SYSTEM
## Backend Technical Specification
*University Project · Spring Boot REST API*

---

## 1. Project Overview

| | |
|---|---|
| **Project** | Delivery / Courier System |
| **Type** | Full-Stack Web Application |
| **Purpose** | Platform for courier delivery management: client order creation, courier assignment, delivery tracking, pricing, and rating system. |
| **Users** | CLIENT · COURIER · ADMIN |

### Core Capabilities

- Registration & JWT-based authentication (CLIENT / COURIER / ADMIN)
- Order creation with cargo type, urgency, weight, and geolocation
- Geolocation-based order discovery for couriers (sorted by proximity)
- Real-time delivery status transitions with full history
- Automated distance & price calculation via Google Maps API
- Courier rating & review system
- Admin panel: courier application management

---

## 2. Technology Stack

### Backend

| Technology | Role |
|---|---|
| **Java 17** | Core language |
| **Spring Boot 3.4.1** | Application framework |
| **Spring Security** | Authentication & authorization |
| **Spring Data JPA / Hibernate** | ORM — database access layer |
| **PostgreSQL** | Primary relational database |
| **JWT (JSON Web Token)** | Stateless token-based authentication |
| **Swagger / OpenAPI 3** | Auto-generated API documentation |
| **Maven** | Build tool & dependency management |
| **Caffeine Cache** | Local in-memory caching |
| **Hibernate Validator** | DTO input validation |
| **RestTemplate** | HTTP client for external API calls |

### Frontend

- React — UI library
- TypeScript — statically typed JavaScript
- REST + JWT Bearer token in `Authorization` header

---

## 3. Backend Architecture

N-Tier layered architecture (Controller → Service → Repository → Entity).

| Layer | Responsibility |
|---|---|
| **Controller Layer** | Receives HTTP requests; validates roles via `@PreAuthorize`; returns DTOs |
| **Service Layer** | All business logic: pricing, status transitions, external API calls |
| **Repository Layer** | `JpaRepository` interfaces — SQL queries via Hibernate / PostgreSQL |
| **Entity Layer** | JPA-mapped Java classes representing database tables |
| **Security Layer** | `SecurityConfig` + `JwtAuthenticationFilter` — token validation per request |
| **DTO Layer** | Request/Response objects decoupled from entities |
| **Mapper Layer** | Entity ↔ DTO conversion |

---

## 4. Database Entities

### User

| Field | Type / Notes | Relationships |
|---|---|---|
| `id, email, password` | PK, unique, bcrypt hash | OneToMany → Order (as client) |
| `firstName, lastName` | String | OneToMany → Order (as courier) |
| `role` | Enum: CLIENT / COURIER / ADMIN | OneToMany → Review |
| `rating, reviewsCount` | Double, Integer | |

### Order

| Field | Type / Notes | Relationships |
|---|---|---|
| `id, status` | PK, Enum status | ManyToOne → User (client) |
| `pickupAddress, destinationAddress` | String | ManyToOne → User (courier) |
| `pickupLat/Lon, destLat/Lon` | Double — coordinates | OneToMany → DeliveryStatusHistory |
| `price, distanceKm` | Double | |
| `cargoType, urgency, weight` | Enums / Double | |

### DeliveryStatusHistory

| Field | Type / Notes | Relationships |
|---|---|---|
| `id, status, changedAt` | PK, Enum, Timestamp | ManyToOne → Order |

### Review

| Field | Type / Notes | Relationships |
|---|---|---|
| `id, rating, comment, createdAt` | PK, Int, String, Timestamp | OneToOne → Order |
| | | ManyToOne → User (client & courier) |

### CourierApplication

| Field | Notes |
|---|---|
| `id, userId, status` | Application from user requesting COURIER role; reviewed by ADMIN |

---

## 5. Security

### Components

| Component | Description |
|---|---|
| **Spring Security** | Core security framework |
| **JwtUtils** | Token generation and validation |
| **JwtAuthenticationFilter** | Intercepts each request; extracts user ID and role from token |
| **BCryptPasswordEncoder** | Password hashing |
| **SecurityConfig** | Stateless session policy; CORS/CSRF disabled; route permissions |
| **@PreAuthorize** | Method-level role enforcement on controller endpoints |

### Roles

- `CLIENT` — creates orders, leaves reviews
- `COURIER` — accepts and executes orders
- `ADMIN` — manages courier applications, views all data

### Public Endpoints

| Method | Path | Access |
|---|---|---|
| `POST` | `/api/auth/register` | PUBLIC |
| `POST` | `/api/auth/login` | PUBLIC |
| `GET` | `/swagger-ui/**` | PUBLIC |
| `GET` | `/v3/api-docs/**` | PUBLIC |

*All other endpoints require a valid JWT Bearer token.*

---

## 6. Controllers & API Endpoints

| Controller | Method | Path | Roles |
|---|---|---|---|
| **AuthController** | `POST` | `/api/auth/register` | PUBLIC |
| **AuthController** | `POST` | `/api/auth/login` | PUBLIC |
| **OrderController** | `POST` | `/api/orders` | CLIENT, ADMIN |
| **OrderController** | `GET` | `/api/orders` | CLIENT, ADMIN |
| **OrderController** | `GET` | `/api/orders/{id}` | CLIENT, COURIER, ADMIN |
| **OrderController** | `GET` | `/api/orders/available` | COURIER |
| **OrderController** | `POST` | `/api/orders/{id}/accept` | COURIER |
| **OrderController** | `PATCH` | `/api/orders/{id}/pickup` | COURIER |
| **OrderController** | `PATCH` | `/api/orders/{id}/deliver` | COURIER |
| **OrderController** | `POST` | `/api/orders/{id}/review` | CLIENT |
| **UserController** | `GET` | `/api/users/me` | CLIENT, COURIER, ADMIN |
| **UserController** | `PUT` | `/api/users/me` | CLIENT, COURIER, ADMIN |
| **CourierApplicationController** | `POST` | `/api/courier-applications` | CLIENT |
| **CourierApplicationController** | `GET` | `/api/courier-applications` | ADMIN |
| **CourierApplicationController** | `PATCH` | `/api/courier-applications/{id}/approve` | ADMIN |
| **CourierApplicationController** | `PATCH` | `/api/courier-applications/{id}/reject` | ADMIN |
| **AdminController** | `GET` | `/api/admin/orders` | ADMIN |
| **AdminController** | `GET` | `/api/admin/users` | ADMIN |

---

## 7. Services

| Service Class | Responsibility |
|---|---|
| **OrderService** | Core order lifecycle: creation, assignment, status transitions, haversine sort |
| **AuthService** | Registration, login, JWT token issuance |
| **GoogleMapsService** | Distance Matrix API calls; returns distance (km) and travel time |
| **PricingService** | Calculates delivery price from distance, weight, and urgency |
| **ReviewService** | Saves review, recalculates courier rating |
| **CourierApplicationService** | Handles courier application workflow for admin approval |
| **UserService** | Profile retrieval and update |

---

## 8. Core Business Features

- Order creation with automated price & distance calculation
- Courier assignment with Pessimistic Locking (race condition protection)
- Delivery status tracking: `CREATED` → `ASSIGNED` → `PICKED_UP` → `DELIVERED`
- `DeliveryStatusHistory` — full audit trail per order
- Geolocation-based order search (Haversine formula — proximity sort)
- Dynamic pricing: distance × weight × urgency coefficient
- Google Maps Distance Matrix integration
- Reviews & weighted courier rating recalculation
- Role-Based Access Control (CLIENT / COURIER / ADMIN)
- JWT stateless authentication
- Global Exception Handler with structured error responses
- DTO validation with Hibernate Validator (`@Valid`)
- Swagger / OpenAPI 3 documentation
- Caffeine in-memory caching

---

## 9. External Integrations

| Service | Details |
|---|---|
| **Google Maps API** | Distance Matrix API — precise road distance (m) and travel time (s) between coordinates |
| **RestTemplate** | Spring HTTP client used for outbound API calls; API key stored in environment variables |

---

## 10. Exception Handling

| Exception / Handler | Status | Trigger |
|---|---|---|
| **GlobalExceptionHandler** | `@ControllerAdvice` | Intercepts all exceptions; returns structured JSON error responses |
| **ResourceNotFoundException** | HTTP 404 | Entity not found (user, order, review) |
| **IllegalStatusTransitionException** | HTTP 400 | Invalid order status transition attempt |
| **CourierAlreadyHasActiveOrderException** | HTTP 409 | Courier attempts to accept a second concurrent order |
| **ExternalApiException** | HTTP 502 | Google Maps API failure or timeout |

---

## 11. Validation

Library: `spring-boot-starter-validation` (Hibernate Validator)

| Annotation / Class | Usage |
|---|---|
| `@NotBlank` | String fields must not be null or whitespace (email, password, addresses) |
| `@NotNull` | Field must be present (coordinates, cargo type) |
| `@Min / @Max` | Numeric range constraints (weight, rating) |
| `@Valid` | Triggers validation cascade on request DTOs in controllers |
| `MethodArgumentNotValidException` | Auto-thrown on validation failure → caught by GlobalExceptionHandler → HTTP 400 |

---

## 12. Key Backend Methods

| Method | Class | Purpose |
|---|---|---|
| `createOrder()` | OrderService | Calls Google Maps API, invokes PricingService, persists order + initial status history |
| `acceptOrder()` | OrderService | Pessimistic lock (SELECT FOR UPDATE), assigns courier, validates no active orders |
| `getAvailableOrdersForCourier()` | OrderService | Fetches CREATED orders, sorts by Haversine distance from courier coordinates |
| `calculateHaversineDistance()` | OrderService | Great-circle distance formula between two coordinate pairs |
| `leaveReview()` | ReviewService | Persists review, recalculates courier weighted average rating |
| `authenticateUser()` | AuthService | Validates credentials via AuthenticationManager, issues JWT token |
| `getDistance()` | GoogleMapsService | Calls Distance Matrix API via RestTemplate, parses response |
| `calculatePrice()` | PricingService | Formula: base rate × distance × weight coefficient × urgency multiplier |

---

## 13. Backend Advantages

| Advantage | Details |
|---|---|
| **Clean N-Tier Architecture** | Clear separation of Controller / Service / Repository / Entity layers |
| **JWT Stateless Authentication** | No server-side sessions; horizontally scalable |
| **Role-Based Access Control** | Granular `@PreAuthorize` on every protected endpoint |
| **Pessimistic Locking** | `SELECT FOR UPDATE` prevents race conditions on order acceptance |
| **Google Maps Integration** | Real-world road distance used for pricing (not straight-line estimates) |
| **Full Status Audit Trail** | DeliveryStatusHistory logs every status change with timestamp |
| **Global Exception Handler** | Uniform JSON error responses; no raw Tomcat error pages |
| **Input Validation** | `@Valid` on all request DTOs with descriptive 400 responses |
| **Swagger / OpenAPI 3** | Auto-generated, always up-to-date API documentation |
| **Transaction Safety** | `@Transactional` on all service methods modifying state |

---

## 14. Conclusion

Delivery / Courier System is a modern, production-grade backend application built on the Spring Boot ecosystem. The project demonstrates proficient application of enterprise Java practices: layered architecture, stateless JWT security, transactional data integrity with pessimistic locking, third-party REST API integration, and comprehensive input validation and error handling. The full API surface is documented via Swagger/OpenAPI 3 and ready for frontend or mobile consumption.