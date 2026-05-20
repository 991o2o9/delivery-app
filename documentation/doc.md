# Delivery / Courier System

## Project Description

The **Delivery / Courier System** is a backend application designed to automate the operations of a delivery service.

The system is built using:

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* PostgreSQL

The main goal of the project is to implement a system capable of:

* Managing delivery orders
* Processing deliveries
* Assigning couriers to orders
* Tracking delivery statuses

---

# System Users

## 1. Client (`CLIENT`)

### Features

* Registration and authentication
* Creating delivery orders
* Specifying pickup and destination addresses
* Viewing order history
* Tracking delivery status

---

## 2. Courier (`COURIER`)

### Features

* Authentication in the system
* Viewing assigned orders
* Updating delivery statuses:

  * Accepted
  * In transit
  * Delivered

---

## 3. Administrator (`ADMIN`)

### Features

* User management
* Viewing all orders
* Assigning couriers to orders
* Monitoring and updating delivery statuses

---

# Core Functionality

* User registration and authentication
* Role-based access control
* User roles:

  * `CLIENT`
  * `COURIER`
  * `ADMIN`
* Creating, viewing, and managing orders
* Assigning couriers to orders
* Updating delivery statuses
* Data persistence using PostgreSQL
* Input data validation
* Centralized error handling
* API documentation using Swagger / OpenAPI

---

# Delivery Cost Calculation

A key feature of the project is the automatic delivery cost calculation.

When an order is created, the system:

1. Accepts pickup and destination addresses
2. Sends a request to an external routing service (**2GIS Routing API**)
3. Retrieves the distance between the two points
4. Calculates the delivery cost using the formula:

```text
cost = base price + (distance × price per kilometer)
```

The calculated results:

* Distance
* Delivery cost

are stored in the database and used during further order processing.

---

# Order Statuses

| Status        | Description                |
| ------------- | -------------------------- |
| `CREATED`     | Order has been created     |
| `CONFIRMED`   | Order has been confirmed   |
| `ASSIGNED`    | Courier has been assigned  |
| `PICKED_UP`   | Order picked up by courier |
| `IN_DELIVERY` | Order is on its way        |
| `DELIVERED`   | Order has been delivered   |
| `CANCELLED`   | Order has been cancelled   |

A full status change history is also maintained.

---

# Core Entities

## User

Stores information about system users.

## Order

Stores delivery order data.

## DeliveryStatusHistory

Stores the history of order status changes.

---

# Entity Relationships

Relationships between entities are implemented using:

* JPA
* Hibernate

---

# Project Architecture

| Layer          | Responsibility                   |
| -------------- | -------------------------------- |
| Controller     | Handling HTTP requests           |
| Service        | Application business logic       |
| Repository     | Database interactions            |
| Entity         | Data models                      |
| DTO            | Data transfer objects            |
| Security Layer | Authentication and authorization |

---

# Technologies Used

* Java
* Spring Boot
* Spring Web
* Spring Security
* Spring Data JPA (Hibernate)
* PostgreSQL
* Maven
* Lombok
* Swagger (OpenAPI)

---

# Conclusion

This project demonstrates:

* Modern backend development practices
* Business logic implementation
* Database interaction
* External API integration

The system solves the practical problem of automating a delivery service and showcases the core capabilities of the Spring Framework ecosystem.
