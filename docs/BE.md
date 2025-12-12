# Backend Design Documentation

## Friday Cab Allocation System - Backend

**Version:** 1.0  
**Last Updated:** December 12, 2025  
**Tech Stack:** Node.js, Express.js, Supabase

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Documentation](#api-documentation)
6. [Database Integration](#database-integration)
7. [Business Logic](#business-logic)
8. [External Integrations](#external-integrations)
9. [Security](#security)
10. [Error Handling](#error-handling)
11. [Performance & Optimization](#performance--optimization)
12. [Deployment](#deployment)

---
<!-- 
## 1. System Overview

### 1.1 Purpose

### 1.2 Core Responsibilities

### 1.3 System Boundaries

---

## 2. Architecture

### 2.1 High-Level Architecture

### 2.2 Design Patterns

### 2.3 Project Structure

### 2.4 Module Organization

---

## 3. Technology Stack

### 3.1 Core Technologies

### 3.2 Framework & Libraries

### 3.3 Development Tools

### 3.4 Version Requirements

---

## 4. Authentication & Authorization

### 4.1 Student Authentication
#### 4.1.1 Google OAuth Flow
#### 4.1.2 Session Management
#### 4.1.3 Token Strategy

### 4.2 Admin Authentication
#### 4.2.1 JWT-based Authentication
#### 4.2.2 Password Management
#### 4.2.3 Session Management

### 4.3 Authorization Middleware
#### 4.3.1 Role-based Access Control
#### 4.3.2 Protected Routes
#### 4.3.3 Permission Checks

--- -->

## 5. API Documentation

### 5.1 Authentication Endpoints

#### 5.1.1 Student Authentication
##### POST `/api/auth/student/google`

- Description: Student login with Google OAuth
##### GET `/api/auth/student/google/callback`

- Description: Callback after Google OAuth authentication
##### POST `/api/auth/student/logout`
- Description: Student logout
##### GET `/api/auth/student/me`
- Description: Get student profile



### 5.3 Trip Endpoints

#### 5.3.1 Trip Management (Admin)
##### POST `/api/trips`
- Description: Create a new trip
##### GET `/api/trips`
- Description: Get all trips
- Add more filters and sorting options
##### GET `/api/trips/:id`
- Description: Get a trip by id
##### PUT `/api/trips/:id`
- Description: Update a trip by id
##### DELETE `/api/trips/:id`
- Description: Delete a trip by id

#### 5.3.2 Active Trip (Student)
##### GET `/api/trips/active`
- Description: Get all active trips
- Same for all users
##### GET `/api/trips/past`
- Description: Get all past trips
- Only show the trips that student has booked
##### GET `/api/trips/:id/details`
- Description: Get a trip by id
- Check detail of user's booking


### 5.4 Booking Endpoints

<!-- #### 5.4.1 Student Booking
##### POST `/api/bookings`
##### GET `/api/bookings/my-bookings`
##### GET `/api/bookings/:id` -->

#### 5.4.2 Admin Booking Management
<!-- Not to be done initially -->
##### GET `/api/admin/bookings`
##### GET `/api/admin/bookings/:tripId`


### 5.6 Cab Management Endpoints (Admin)

#### 5.6.1 Cab CRUD
##### GET `/api/admin/cabs/:tripId`
- Description: Get all cabs in a given trip
##### PUT `/api/admin/cabs/:id`
- Description: Update a cab by id
##### DELETE `/api/admin/cabs/:id`
- Description: Delete a cab by id

#### 5.6.2 Bulk Cab Operations
##### POST `/api/admin/cabs/bulk-create`
- Description: Create multiple cabs in a given trip

### 5.7 Allocation Endpoints (Admin)

#### 5.7.1 Demand Analysis
##### GET `/api/admin/trips/:tripId`
- Description: Get all allocations in a given 
- Grouped by hall
- Also show the number of students in each hall


#### 5.7.3 Allocation Management
##### GET `/api/admin/trips/:tripId/allocation`
- Description: Get the allocation of the cabs and students
- Based on the demand analysis

##### POST `/api/admin/trips/:tripId/allocation`
- Description: Save the cabs and cab allocations
- Based on the demand analysis


<!-- 
### 5.8 QR Code Endpoints

#### 5.8.2 QR Validation (Driver)
##### POST `/api/validate/scan`
##### POST `/api/validate/verify`

### 5.9 Journey Endpoints

#### 5.9.1 Journey Logging
##### POST `/api/journeys/log`

#### 5.9.2 Journey Analytics (Admin)
##### GET `/api/admin/journeys/:tripId`
##### GET `/api/admin/journeys/:tripId/statistics`
##### GET `/api/admin/journeys/:tripId/no-shows`

### 5.10 Dashboard Endpoints (Admin)

#### 5.10.1 Overview Statistics
##### GET `/api/admin/dashboard/overview`
##### GET `/api/admin/dashboard/stats/:tripId`

---

## 6. Database Integration

### 6.1 Supabase Configuration

### 6.2 Connection Management

### 6.3 Query Optimization

### 6.4 Transaction Handling

### 6.5 Database Migrations

---

## 7. Business Logic

### 7.1 Booking Flow

#### 7.1.1 Booking Creation
#### 7.1.2 Payment Verification
#### 7.1.3 Booking Confirmation

### 7.2 Allocation Algorithm

#### 7.2.1 Demand Collection
#### 7.2.2 Cab Requirement Calculation
#### 7.2.3 Student-to-Cab Mapping
#### 7.2.4 Optimization Logic

### 7.3 QR Code Generation

#### 7.3.1 Token Generation
#### 7.3.2 Encryption/Signing
#### 7.3.3 QR Code Format

### 7.4 Validation Logic

#### 7.4.1 Outbound Validation Rules
#### 7.4.2 Return Validation Rules
#### 7.4.3 Passkey Verification

### 7.5 Journey Logging

#### 7.5.1 Event Capture
#### 7.5.2 Duplicate Handling
#### 7.5.3 Analytics Aggregation

---

## 8. External Integrations

### 8.1 Google OAuth

#### 8.1.1 OAuth Configuration
#### 8.1.2 User Profile Retrieval
#### 8.1.3 Token Management

### 8.2 Payment Gateway

#### 8.2.1 Gateway Selection
#### 8.2.2 Payment Initiation
#### 8.2.3 Webhook Handling
#### 8.2.4 Reconciliation

### 8.3 SMS/Email Service (Optional)

#### 8.3.1 Notification Service
#### 8.3.2 Message Templates
#### 8.3.3 Delivery Tracking

---

## 9. Security

### 9.1 Authentication Security

#### 9.1.1 Token Security
#### 9.1.2 Password Hashing
#### 9.1.3 Session Security

### 9.2 API Security

#### 9.2.1 Rate Limiting
#### 9.2.2 CORS Configuration
#### 9.2.3 Input Validation
#### 9.2.4 SQL Injection Prevention

### 9.3 Data Security

#### 9.3.1 Encryption at Rest
#### 9.3.2 Encryption in Transit
#### 9.3.3 Sensitive Data Handling

### 9.4 QR Security

#### 9.4.1 Token Signing
#### 9.4.2 Expiration Handling
#### 9.4.3 Replay Attack Prevention

---

## 10. Error Handling

### 10.1 Error Types

### 10.2 Error Response Format

### 10.3 Logging Strategy

### 10.4 Error Recovery

---

## 11. Performance & Optimization

### 11.1 Caching Strategy

#### 11.1.1 Redis Integration
#### 11.1.2 Cache Invalidation
#### 11.1.3 Cache Keys

### 11.2 Database Optimization

#### 11.2.1 Query Optimization
#### 11.2.2 Index Strategy
#### 11.2.3 Connection Pooling

### 11.3 API Optimization

#### 11.3.1 Response Compression
#### 11.3.2 Pagination
#### 11.3.3 Batch Operations

### 11.4 Load Management

#### 11.4.1 Request Queuing
#### 11.4.2 Background Jobs
#### 11.4.3 Scaling Strategy

---

## 12. Deployment

### 12.1 Environment Configuration

#### 12.1.1 Development
#### 12.1.2 Staging
#### 12.1.3 Production

### 12.2 Build Process

### 12.3 CI/CD Pipeline

### 12.4 Hosting Platform

### 12.5 Monitoring & Logging

#### 12.5.1 Application Monitoring
#### 12.5.2 Error Tracking
#### 12.5.3 Performance Metrics

### 12.6 Backup Strategy

---

## Appendix

### A. Environment Variables

### B. API Response Codes

### C. Error Code Reference

### D. Database Schema Reference

---

**Document End**


















 -->
