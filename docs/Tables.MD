# SQL Tables for the Project


User Table: (data from google login)
- id
- name
- email
- profile_picture
- created_at
- updated_at


Admin Table:
- id
- name
- email
- password_hash
- created_at
- updated_at


Trip Table: 
- id 
- trip_date (date of the trip)
- booking_start_time (date and time of the booking start)
- booking_end_time (date and time of the booking end)
- return_time (date and time of the return)
- created_at
- updated_at



Payment Table:
- id
- user_id (Reference to the User Table)
- trip_id (Reference to the Trip Table)
- payment_status (String: Pending, Confirmed, Failed)
- payment_amount
- payment_date
- payment_method
- created_at
- updated_at


Trip_User Table: (Entry on payment confirmation)
- id 
- trip_id (Reference to the Trip Table)
- user_id (Reference to the User Table)
- hall (String: LBS, MMM, etc.)
- payment_id (Reference to the Payment Table)
- created_at
- updated_at


Cab Table:
- id
- trip_id (Reference to the Trip Table)
- cab_number
- cab_type
- cab_capacity
- cab_owner_name
- cab_owner_phone
- pickup_region (String: RK, RP, GKH, VS, MS, HJB, JCB, LLR, PAN loop)
- passkey
- created_at
- updated_at



Cab_Allocation Table: (QR code Identification)
- id
- trip_id (Reference to the Trip Table)
- user_id (Reference to the User Table)
- cab_id (Reference to the Cab Table)
- created_at
- updated_at


Journey Table: (Entry on QR code scan)
- id
- trip_id (Reference to the Trip Table)
- user_id (Reference to the User Table)
- cab_id (Reference to the Cab Table)
- journey_type (String: Pickup or Dropoff)
- journey_date_time (date and time of the journey pickup or dropoff)
- created_at
- updated_at

