# Product Requirements Document (PRD)

## Campus Friday Prayer Cab System

**Document Title:** Campus Cab Allocation & Validation System
**Version:** Draft v1.0
**Platform:** Web Application (mobile-responsive, especially for Drivers and Students)
**Target Use Case:** Weekly Friday Prayer Logistics

---

## 1. Problem Statement

Every Friday, a large number of students need transportation from different halls to the mosque for prayers. The current process is:

* Manual and unorganized
* Lacking visibility into total demand
* Inefficient in cab allocation
* Unable to systematically validate who has paid and who is allowed to board

There is no centralized system to:

* Aggregate demand per hall
* Optimize cab usage
* Manage payments and confirmations
* Validate boarding for onward and return journeys

---

## 2. Proposed Solution

Build a centralized web platform that manages the **end-to-end lifecycle** of Friday prayer transport:

1. **Demand Collection:** Students register, select their hall, and pay.
2. **Optimization:** Admin runs a model to compute the required number of cabs per hall.
3. **Cab Assignment:** The system maps students to specific cabs and generates unique QR passes.
4. **Validation:** A QR + passkey-based validation flow ensures correct boarding on both onward and return journeys, using only a browser on the driver’s phone.

---

## 3. User Personas

### 3.1 Student

* Wants a simple way to:

  * Register for the trip
  * Pay the fare
  * Receive a confirmed boarding pass (QR code)
* Needs clarity about:

  * Pick-up hall
  * Cab details (number, etc.)

### 3.2 Admin

* Needs:

  * Overview of total demand per hall
  * Ability to run the allocation model
  * Interface to manage cabs and drivers
  * Mechanism to ensure only paid students board

### 3.3 Cab Driver

* Uses their own smartphone and browser (no app install).
* Needs:

  * A simple page to scan QR codes
  * A passkey to verify students for:

    * Outbound (Campus → Mosque)
    * Return (Mosque → Campus)

---

## 4. Functional Requirements

### Phase 1: Student Enrollment & Demand Generation

1. **Registration & Login**

   * Students access the website and log in using a **unique email ID**.
   * Student selects their **Residence Hall** from a predefined list.

2. **Payment**

   * A fixed fare is displayed.
   * Student is redirected to a **payment gateway**.
   * **Constraint:** Booking is considered complete **only after** successful payment.

3. **Booking Status**

   * On successful payment:

     * Booking status → `Confirmed`
     * Student is added to the demand pool for their hall.
   * Until admin allocation, the student sees a "Booking confirmed, awaiting cab allocation" status.

---

### Phase 2: Admin Operations (Optimization Loop)

1. **Demand Dashboard**

   * Admin sees a real-time summary:

     * `Hall Name` vs `Confirmed Student Count`
     * Example:

       * LBS Hall: 50 students
       * MMM Hall: 20 students

2. **Model Integration**

   * Admin clicks **“Run Allocation Model”**.
   * **Input:** Student count per hall.
   * **Output:** Required cabs per hall.

     * Example:

       * LBS Hall → 7-seater cabs → 8 cabs
       * MMM Hall → 3 cabs

3. **Cab & Driver Management**

   * In a **Fleet Management** tab, Admin enters:

     * Cab owner name (optional)
     * Cab number (plate)
     * Driver phone number
   * Number of cabs per hall is aligned with model output.

4. **Passkey Generation**

   * System generates a **unique 4-digit passkey per cab/driver**.
   * Admin shares with each driver via call/SMS:

     * Pickup location (hall)
     * Passkey (e.g., `4590`)
     * Reporting time

---

### Phase 3: System Mapping & QR Generation (Backend Logic)

1. **Student Grouping**

   * System groups students in batches of **7 per cab** (assuming 7-seater cabs).
   * Remaining students (if not divisible by 7) are grouped optimally in the last cab.

2. **Cab Assignment**

   * Each group (max 7 students) is assigned:

     * A **Cab ID** (linked to a specific driver and passkey)
   * Each student is thus mapped to:

     * `Student → Cab ID → Hall`

3. **QR Code Generation**

   * For each student:

     * System generates a **unique QR code**.
     * The QR encodes a secure link (e.g., with a token or ID) that references:

       * Student ID
       * Assigned Cab ID
       * Payment status

---

### Phase 4: Outbound Journey (Campus → Mosque)

#### 4.1 Student Experience

* On Friday morning:

  * Student logs in to the portal.
  * **“My Trip”** section shows:

    * Assigned cab number
    * Pickup hall and time
    * Unique **QR code** (displayed and/or sent via email)

#### 4.2 Driver Validation Flow

1. Driver opens phone camera and scans the student’s QR code.
2. QR redirects to a **web validation page** (no app).
3. Page prompts:

   * `Enter Driver Passkey` (4-digit code provided by Admin).
4. **Validation Logic (Outbound):**

   * System checks:

     * If QR is valid and belongs to a **paid student**.
     * If the **Cab ID associated with the student** matches the **passkey’s cab**.

   * **If match:**

     * Show **Green Success Screen**:

       * Message: “Success: Board this cab.”
       * Optional: Show student name & hall.

   * **If mismatch:**

     * Show **Red Error Screen**:

       * Message: “Error: This student is assigned to Cab [X].”

---

### Phase 5: Return Journey (Mosque → Campus)

**Policy:** For return, students may board **any** hired cab (no fixed cab constraint).

#### Driver Validation Flow (Return)

1. Driver scans the same student QR code.

2. Web page again asks for **Driver Passkey**.

3. **Validation Logic (Return):**

   * System verifies:

     * Student is a **valid paid user**.
     * Passkey corresponds to a **valid hired cab** in the system (any cab, not necessarily the outbound one).

4. **If valid:**

   * Show **Green Success Screen**:

     * “Success: Return trip authorized.”

5. **If invalid (unpaid student / non-hired cab):**

   * Show **Red Error Screen** with appropriate message.

---

## 5. User Flows

### 5.1 Student Flow

1. Visit website.
2. Log in using email.
3. Select Residence Hall.
4. Proceed to payment and complete transaction.
5. Wait for admin to allocate cabs.
6. On Friday:

   * Log in → open **“My Trip”**.
   * See:

     * Cab Number
     * Pickup Hall & Time
     * QR Code
7. At pickup point:

   * Show QR to driver for scanning.

---

### 5.2 Admin Flow

1. Log in to admin dashboard.
2. View **Demand Dashboard**:

   * Hall-wise confirmed student counts.
3. Click **“Run Allocation Model”**:

   * System suggests:

     * Total cabs required
     * Distribution per hall
4. Contact cab owner(s) and confirm number of cabs and drivers.
5. In **Fleet Management**, enter:

   * Cab numbers
   * Driver phone numbers
   * Assign cabs to halls (based on model output).
6. Click **“Assign Cabs & Generate QR”**:

   * System:

     * Maps students to cabs
     * Generates QR codes and passkeys
7. Share passkeys and pickup details with drivers.

---

### 5.3 Driver Flow

1. Receive instructions from Admin:

   * Pickup hall
   * Report time
   * Unique 4-digit passkey
   * URL (if needed) – though QR will open it.
2. Arrive at hall.
3. Scan student QR using phone camera.
4. Browser opens validation page:

   * Enter passkey → tap **Verify**.
5. See:

   * **Green Tick** → allow student to board.
   * **Red Cross** → deny or redirect student to correct cab (for outbound).

---

## 6. Technical Assumptions & Constraints

* **Driver Devices:**

  * Drivers use their own smartphones with internet access.
  * No dedicated mobile app; everything is browser-based.

* **Capacity Assumption:**

  * Each cab has a **fixed capacity** (e.g., 7 seats).
  * The allocation model is built on this assumption.

* **Network Connectivity:**

  * QR validation requires a **working internet connection** at pickup and return points.

* **Security:**

  * QR codes should be tamper-resistant (signed tokens or server-side validation).
  * Passkeys should be unique per cab and not guessable.

---

## 7. Success Metrics

1. **Allocation Accuracy**

   * 100% of **paid students** are assigned a seat in the allocation model.

2. **Boarding Speed**

   * Average time from QR scan → validation result:

     * **< 10 seconds** per student.

3. **Zero Leakage**

   * No unpaid student is allowed to board:

     * Enforced via **QR + passkey validation**.

4. **Operational Simplicity**

   * Drivers and students require **no training beyond one explanation**.
   * Admin can complete the full process (demand → allocation → cab setup) using only the admin dashboard.

