import { Request, Response, NextFunction } from 'express';

/**
 * Validation Middleware
 * Validates request data before processing
 */

// ====================================
// TRIP VALIDATION
// ====================================

export const validateTripData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    trip_title,
    trip_date,
    booking_start_time,
    booking_end_time,
    departure_time,
    prayer_time,
    end_time,
    amount_per_person,
  } = req.body;

  const errors: string[] = [];

  // Validate trip_title
  if (!trip_title || typeof trip_title !== 'string' || trip_title.trim().length === 0) {
    errors.push('Trip title is required and must be a non-empty string');
  } else if (trip_title.length > 255) {
    errors.push('Trip title must not exceed 255 characters');
  }

  // Validate trip_date
  if (!trip_date) {
    errors.push('Trip date is required');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trip_date)) {
      errors.push('Trip date must be in YYYY-MM-DD format');
    } else {
      const tripDate = new Date(trip_date);
      if (isNaN(tripDate.getTime())) {
        errors.push('Invalid trip date');
      }
    }
  }

  // Validate timestamps
  const timestamps = [
    { name: 'booking_start_time', value: booking_start_time },
    { name: 'booking_end_time', value: booking_end_time },
    { name: 'departure_time', value: departure_time },
    { name: 'prayer_time', value: prayer_time },
    { name: 'end_time', value: end_time },
  ];

  for (const ts of timestamps) {
    if (!ts.value) {
      errors.push(`${ts.name} is required`);
    } else {
      const date = new Date(ts.value);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid ${ts.name} format`);
      }
    }
  }

  // Validate time sequence (if all timestamps are valid)
  if (
    booking_start_time &&
    booking_end_time &&
    departure_time &&
    prayer_time &&
    end_time &&
    errors.length === 0
  ) {
    const bStart = new Date(booking_start_time).getTime();
    const bEnd = new Date(booking_end_time).getTime();
    const dTime = new Date(departure_time).getTime();
    const pTime = new Date(prayer_time).getTime();
    const eTime = new Date(end_time).getTime();

    if (bEnd <= bStart) {
      errors.push('booking_end_time must be after booking_start_time');
    }
    if (bEnd >= dTime) {
      errors.push('booking_end_time must be before departure_time (booking window must close before cabs depart)');
    }
    if (dTime >= pTime) {
      errors.push('departure_time must be before prayer_time');
    }
    if (pTime >= eTime) {
      errors.push('prayer_time must be before end_time');
    }
  }

  // Validate amount_per_person
  if (amount_per_person === undefined || amount_per_person === null) {
    errors.push('amount_per_person is required');
  } else {
    const amount = parseFloat(amount_per_person);
    if (isNaN(amount) || amount <= 0) {
      errors.push('amount_per_person must be a positive number');
    } else if (amount > 10000) {
      errors.push('amount_per_person seems too high (max: 10,000)');
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
};

// ====================================
// PARTIAL UPDATE VALIDATION (for PUT requests)
// ====================================

export const validateTripUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    trip_title,
    trip_date,
    booking_start_time,
    booking_end_time,
    departure_time,
    prayer_time,
    end_time,
    amount_per_person,
  } = req.body;

  const errors: string[] = [];

  // At least one field must be provided
  if (
    !trip_title &&
    !trip_date &&
    !booking_start_time &&
    !booking_end_time &&
    !departure_time &&
    !prayer_time &&
    !end_time &&
    amount_per_person === undefined
  ) {
    res.status(400).json({
      success: false,
      error: 'At least one field must be provided for update',
    });
    return;
  }

  // Validate individual fields if provided
  if (trip_title !== undefined) {
    if (typeof trip_title !== 'string' || trip_title.trim().length === 0) {
      errors.push('Trip title must be a non-empty string');
    } else if (trip_title.length > 255) {
      errors.push('Trip title must not exceed 255 characters');
    }
  }

  if (trip_date !== undefined) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trip_date)) {
      errors.push('Trip date must be in YYYY-MM-DD format');
    } else {
      const tripDate = new Date(trip_date);
      if (isNaN(tripDate.getTime())) {
        errors.push('Invalid trip date');
      }
    }
  }

  // Validate timestamps if provided
  const timestampFields = [
    { name: 'booking_start_time', value: booking_start_time },
    { name: 'booking_end_time', value: booking_end_time },
    { name: 'departure_time', value: departure_time },
    { name: 'prayer_time', value: prayer_time },
    { name: 'end_time', value: end_time },
  ];

  for (const field of timestampFields) {
    if (field.value !== undefined) {
      const date = new Date(field.value);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid ${field.name} format`);
      }
    }
  }

  if (amount_per_person !== undefined) {
    const amount = parseFloat(amount_per_person);
    if (isNaN(amount) || amount <= 0) {
      errors.push('amount_per_person must be a positive number');
    } else if (amount > 10000) {
      errors.push('amount_per_person seems too high (max: 10,000)');
    }
  }

  // Note: We don't validate time sequence here because we don't have all values
  // The database constraints will catch any logical errors

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
};

// ====================================
// UUID VALIDATION
// ====================================

export const validateUUID = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = req.params.id as string;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
    return;
  }

  next();
};

// ====================================
// USER PROFILE VALIDATION
// ====================================

export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, phone_number, email_notifications } = req.body;
  const errors: string[] = [];

  if (name === undefined && phone_number === undefined && email_notifications === undefined) {
    res.status(400).json({
      success: false,
      error: 'At least one field (name, phone_number, or email_notifications) is required'
    });
    return;
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (name.trim().length > 255) {
      errors.push('Name must not exceed 255 characters');
    } else {
      req.body.name = name.trim();
    }
  }

  if (phone_number !== undefined) {
    if (phone_number === null || phone_number === '') {
      req.body.phone_number = null;
    } else {
      const normalizedPhone = String(phone_number).replace(/[^0-9]/g, '');
      if (normalizedPhone.length !== 10) {
        errors.push('Phone number must be exactly 10 digits (without +91)');
      } else {
        req.body.phone_number = normalizedPhone;
      }
    }
  }

  // Validate email_notifications if provided
  if (email_notifications !== undefined) {
    if (typeof email_notifications !== 'boolean') {
      errors.push('email_notifications must be a boolean');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
};

// ====================================
// USER MANAGEMENT VALIDATION
// ====================================

export const validateUserCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, name, phone_number, is_admin } = req.body;
  const errors: string[] = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  // Validate name
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name must be a non-empty string');
  } else if (name.trim().length > 255) {
    errors.push('Name must not exceed 255 characters');
  }

  // Validate phone_number (optional)
  if (phone_number !== undefined && phone_number !== null && phone_number !== '') {
    const normalizedPhone = String(phone_number).replace(/[^0-9]/g, '');
    if (normalizedPhone.length !== 10) {
      errors.push('Phone number must be exactly 10 digits (without +91)');
    }
  }

  // Validate is_admin (optional, default false)
  if (is_admin !== undefined && typeof is_admin !== 'boolean') {
    errors.push('is_admin must be a boolean');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, name, phone_number } = req.body;
  const errors: string[] = [];

  // At least one field must be provided
  if (email === undefined && name === undefined && phone_number === undefined) {
    res.status(400).json({
      success: false,
      error: 'At least one field (email, name, or phone_number) is required',
    });
    return;
  }

  // Validate email if provided
  if (email !== undefined) {
    if (typeof email !== 'string') {
      errors.push('Email must be a string');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (name.trim().length > 255) {
      errors.push('Name must not exceed 255 characters');
    }
  }

  // Validate phone_number if provided
  if (phone_number !== undefined && phone_number !== null && phone_number !== '') {
    const normalizedPhone = String(phone_number).replace(/[^0-9]/g, '');
    if (normalizedPhone.length !== 10) {
      errors.push('Phone number must be exactly 10 digits (without +91)');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
};
