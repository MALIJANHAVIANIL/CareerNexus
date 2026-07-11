# CareerNexus Placement Portal — Backend Architecture Specification

This document provides a comprehensive technical overview of the backend architecture designed and implemented for the **CareerNexus College Placement Portal**.

---

## 1. Architectural Design Overview

The CareerNexus backend is built as a stateless RESTful API utilizing the **Java Spring Boot** framework, running on top of **Spring Data JPA (Hibernate)** and a **PostgreSQL** database. Authentication and authorization are handled using a stateless token-based flow backed by **Spring Security** and **JSON Web Tokens (JWT)**.

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (HTTP / REST + JWT Bearer Token)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY & ROUTING LAYER                     │
│    Spring Security • JwtAuthenticationFilter • CORS Filter       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  CONTROLLER   │       │  CONTROLLER   │       │  CONTROLLER   │
│  StudentCtrl  │       │  AlumniCtrl   │       │    TpoCtrl    │
└───────┬───────┘       └───────┬───────┘       └───────┬───────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                          │
│     Business Logic • Transaction Management • Security Gates     │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        REPOSITORY LAYER                         │
│               Spring Data JPA Repositories (ORM)                │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL DB                           │
│  Tables: users, profiles, jobs, applications, events, audit_logs│
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Stack & Dependencies

| Dependency | Purpose | Version |
| :--- | :--- | :--- |
| **Spring Boot Web** | MVC architecture to support RESTful API controllers | `3.3.0` |
| **Spring Security** | Fine-grained URL authorization and CORS policies | `3.3.0` |
| **jjwt (JSON Web Token)** | Compact, URL-safe sign/verify token generator | `0.11.5` |
| **Spring Data JPA** | Object-Relational Mapping (ORM) via Hibernate | `3.3.0` |
| **PostgreSQL Driver** | Dynamic connection pooling and database driver integration | Runtime |
| **Lombok** | Boilerplate code reduction (getters, setters, builders) | `1.18.30` |

---

## 3. Directory Layout & Package Structure

```
src/main/java/com/careernexus/
├── config/                  # Configuration layers
│   ├── SecurityConfig.java  # Spring Security filter chains and path definitions
│   └── CorsConfig.java      # Allowed origins and HTTP request rules
├── controller/              # REST Endpoints matching frontend API calls
│   ├── AuthController.java  # Account register / authentication
│   ├── StudentController.java # Resume reviews, qualifications, profile detail
│   ├── AlumniController.java # Mentor sessions and prep experiences
│   └── TpoController.java   # Admin lists, verifications, system audit log boards
├── security/                # JWT verification broker
│   ├── JwtTokenProvider.java # Secret encryption and token validator
│   └── JwtAuthenticationFilter.java # Header interceptor extracting claims
├── entity/                  # JPA Database Mapping entities
│   ├── User.java            # Unified authentication user (Student/Alumni/TPO/HR)
│   ├── StudentProfile.java  # GPA, PRN, education parameters
│   ├── AlumniProfile.java   # Active employer details and domain parameters
│   ├── Job.java             # Recruiters jobs registry
│   ├── JobApplication.java  # Candidate application records
│   ├── Event.java           # Webinar, bootcamp lists
│   └── AuditLog.java        # Security, verification audit registers
├── repository/              # Spring Data JPA data access interfaces
│   ├── UserRepository.java
│   ├── StudentProfileRepository.java
│   └── AuditLogRepository.java
├── service/                 # Business logic interfaces and implementations
│   ├── UserService.java
│   ├── TpoService.java
│   └── AuditLogService.java
└── dto/                     # Data Transfer Objects for API payloads
```

---

## 4. Security & JWT Authentication Flow

1. **User Sign In**: `AuthController.java` delegates authentication checks to the `AuthServiceImpl.java`.
2. **Token Generation**: Upon matching password hashes (BCrypt), a signed JWT is minted containing user claims (e.g., `email`, `role`).
3. **Stateless Filtration**:
   * All requests intercept inside `JwtAuthenticationFilter.java`.
   * Claims are extracted from the `Authorization: Bearer <token>` header.
   * On success, a security context is established (`SecurityContextHolder.getContext().setAuthentication(...)`).
4. **Role Authority Guarding**: Route restrictions are configured inside `SecurityConfig.java`:
   ```java
   .requestMatchers("/api/tpo/**").hasAuthority("TPO")
   .requestMatchers("/api/alumni/**").hasAnyAuthority("ALUMNI", "TPO")
   .requestMatchers("/api/student/**").hasAnyAuthority("STUDENT", "TPO")
   ```

---

## 5. Audit Logging System

For institutional compliance and placement drive logging, critical security and database modification events are registered to the database dynamically via the `AuditLogService.java`:
* **Logged Operations**:
  * Profile modifications and resume uploads.
  * Recruiter job publish actions.
  * Student interview applications.
  * TPO verification updates (e.g., "Alumni account verified").
* **Entity Attributes**: `id`, `actorEmail`, `action`, `details`, `timestamp`.
* **Access Control**: Exclusively fetched on TPO Analytics tab boards (`/api/tpo/audit-logs`) to check real-time system changes.

---

## 6. Auto-Seeding & Database Initialization

Upon booting the application, `CareerNexusApplication.java` executes checks to ensure the portal is fully operational without empty datasets:
* **Admin Profile**: Inserts the default TPO Administrator profile (`tpo@college.edu` / `Admin@123`).
* **Recruiter Accounts**: Seeds 6 verified recruiter profiles with populated jobs and placement requirements.
* **Database Driver**: Connects to the local PostgreSQL instance specified under `application.properties`.
