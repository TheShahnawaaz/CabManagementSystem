import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout, Badge, Button, DetailsCard } from '../components';

interface BookingConfirmedProps {
  userName: string;
  tripTitle: string;
  tripDate: string;
  tripTime?: string;
  hall: string;
  amount: number;
  bookingId: string;
  actionUrl?: string;
}

export const BookingConfirmed: React.FC<BookingConfirmedProps> = ({
  userName,
  tripTitle,
  tripDate,
  tripTime,
  hall,
  amount,
  bookingId,
  actionUrl = 'https://fridaycab.com/bookings',
}) => {
  return (
    <EmailLayout preview={`Your booking for ${tripTitle} is confirmed! Booking ID: ${bookingId}`}>
      <Badge variant="success">✓ Confirmed</Badge>

      <Text className="email-title" style={styles.title}>
        Booking Confirmed!
      </Text>

      <Text className="email-text" style={styles.text}>
        Hi <strong>{userName}</strong>,
      </Text>

      <Text className="email-text" style={styles.text}>
        Great news! Your booking for <strong>{tripTitle}</strong> has been confirmed successfully.
      </Text>

      <DetailsCard
        items={[
          { icon: '📅', label: 'Trip Date', value: tripDate },
          { icon: '⏰', label: 'Time', value: tripTime || 'TBA' },
          { icon: '📍', label: 'Pickup Hall', value: hall },
          { icon: '💰', label: 'Amount Paid', value: `₹${amount}`, isSuccess: true },
          { icon: '🎫', label: 'Booking ID', value: bookingId },
        ]}
      />

      <Section style={styles.buttonSection}>
        <Button href={actionUrl}>View Booking Details</Button>
      </Section>

      <Text className="email-muted" style={styles.mutedCenter}>
        You'll receive another email once your cab is assigned.
      </Text>
    </EmailLayout>
  );
};

const styles = {
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#18181b',
    margin: '0 0 16px 0',
    lineHeight: 1.3,
  },
  text: {
    fontSize: '16px',
    lineHeight: 1.7,
    color: '#52525b',
    margin: '0 0 16px 0',
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  mutedCenter: {
    color: '#71717a',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '24px 0 0 0',
  },
};

export default BookingConfirmed;

