import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout, Badge, Button, DetailsCard } from '../components';

interface BookingReminderProps {
  tripTitle: string;
  tripDate: string;
  departureTime?: string;
  amount: number;
  bookingDeadline?: string;
  isFinalReminder?: boolean;
  actionUrl?: string;
}

export const BookingReminder: React.FC<BookingReminderProps> = ({
  tripTitle,
  tripDate,
  departureTime,
  amount,
  bookingDeadline,
  isFinalReminder = false,
  actionUrl = 'https://fridaycab.com/trips',
}) => {
  const heading = isFinalReminder
    ? 'Last Chance to Book!'
    : 'Booking is Open!';

  const bodyText = isFinalReminder
    ? `Hurry! Booking for **${tripTitle}** is closing soon. Don't miss out on your seat.`
    : `Booking for **${tripTitle}** is now open. Reserve your seat for this Friday's prayer trip.`;

  const badgeText = isFinalReminder ? '⏰ Final Reminder' : '🔔 Reminder';
  const badgeVariant = isFinalReminder ? 'warning' : 'info';

  return (
    <EmailLayout preview={`${badgeText}: ${tripTitle} — Book your seat now!`}>
      <Badge variant={badgeVariant}>{badgeText}</Badge>

      <Text className="email-title" style={styles.title}>
        {heading}
      </Text>

      <Text className="email-text" style={styles.text}>
        Assalamu Alaikum everyone,
      </Text>

      <Text className="email-text" style={styles.text}>
        {isFinalReminder
          ? <>Hurry! Booking for <strong>{tripTitle}</strong> is closing soon. Don't miss out on your seat.</>
          : <>Booking for <strong>{tripTitle}</strong> is now open. Reserve your seat for this Friday's prayer trip.</>
        }
      </Text>

      <DetailsCard
        items={[
          { icon: '📅', label: 'Trip Date', value: tripDate },
          { icon: '⏰', label: 'Departure', value: departureTime || 'Check app' },
          { icon: '💰', label: 'Fare', value: `₹${amount}` },
          ...(bookingDeadline
            ? [{ icon: '🕐', label: 'Booking Closes', value: bookingDeadline, isSuccess: false }]
            : []),
        ]}
      />

      <Section style={styles.buttonSection}>
        <Button href={actionUrl}>Book Your Seat Now</Button>
      </Section>

      {isFinalReminder ? (
        <Text className="email-muted" style={styles.mutedCenter}>
          This is the final reminder. Booking will close soon — act now!
        </Text>
      ) : (
        <Text className="email-muted" style={styles.mutedCenter}>
            Secure your spot early to help us plan the trip better.
        </Text>
      )}
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

export default BookingReminder;
