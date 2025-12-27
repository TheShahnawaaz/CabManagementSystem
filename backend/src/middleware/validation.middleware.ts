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
    return_time,
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
      // Check if trip_date is a Friday
      const dayOfWeek = tripDate.getDay();
      if (dayOfWeek !== 5) {
        errors.push('Trip date must be a Friday (day 5 of the week)');
      }
    }
  }

  // Validate timestamps
  const timestamps = [
    { name: 'booking_start_time', value: booking_start_time },
    { name: 'booking_end_time', value: booking_end_time },
    { name: 'return_time', value: return_time },
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
    return_time &&
    end_time &&
    errors.length === 0
  ) {
    const bStart = new Date(booking_start_time).getTime();
    const bEnd = new Date(booking_end_time).getTime();
    const rTime = new Date(return_time).getTime();
    const eTime = new Date(end_time).getTime();

    if (bEnd <= bStart) {
      errors.push('booking_end_time must be after booking_start_time');
    }
    if (bEnd >= rTime) {
      errors.push('booking_end_time must be before return_time (booking window must close before trip starts)');
    }
    if (eTime <= rTime) {
      errors.push('end_time must be after return_time');
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
    return_time,
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
    !return_time &&
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
      // Check if trip_date is a Friday
      const dayOfWeek = tripDate.getDay();
      if (dayOfWeek !== 5) {
        errors.push('Trip date must be a Friday (day 5 of the week)');
      }
    }
  }

  // Validate timestamps if provided
  const timestampFields = [
    { name: 'booking_start_time', value: booking_start_time },
    { name: 'booking_end_time', value: booking_end_time },
    { name: 'return_time', value: return_time },
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
  const { id } = req.params;

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
// BOOKING VALIDATION
// ====================================

export const validateBooking = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { trip_id, hall } = req.body;

  const errors: string[] = [];

  // Validate trip_id
  if (!trip_id) {
    errors.push('trip_id is required');
  } else {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trip_id)) {
      errors.push('Invalid trip_id format');
    }
  }

  // Validate hall
  if (!hall) {
    errors.push('hall is required');
  } else if (typeof hall !== 'string') {
    errors.push('hall must be a string');
  } else {
    const validHalls = ['RK', 'PAN', 'LBS', 'VS'];
    if (!validHalls.includes(hall)) {
      errors.push(`hall must be one of: ${validHalls.join(', ')}`);
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
