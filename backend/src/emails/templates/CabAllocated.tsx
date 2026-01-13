import * as React from 'react';
import { Text, Section, Img } from '@react-email/components';
import { EmailLayout, Badge, Button, DetailsCard } from '../components';

interface CabAllocatedProps {
  userName: string;
  tripTitle: string;
  tripDate: string;
  departureTime?: string;
  cabNumber: string;
  pickupRegion: string;
  hall?: string;
  qrCodeUrl?: string;
  actionUrl?: string;
}

export const CabAllocated: React.FC<CabAllocatedProps> = ({
  userName,
  tripTitle,
  tripDate,
  departureTime,
  cabNumber,
  pickupRegion,
  hall,
  qrCodeUrl,
  actionUrl = 'https://fridaycab.com/bookings',
}) => {
  return (
    <EmailLayout preview={`Cab ${cabNumber} assigned for ${tripTitle}`}>
      <Badge variant="success">🚕 Cab Assigned</Badge>

      <Text className="email-title" style={styles.title}>
        Your Cab is Ready!
      </Text>

      <Text className="email-text" style={styles.text}>
        Hi <strong>{userName}</strong>,
      </Text>

      <Text className="email-text" style={styles.text}>
        Your cab for <strong>{tripTitle}</strong> has been assigned. Here are your details:
      </Text>

      <DetailsCard
        items={[
          { icon: '🚗', label: 'Cab Number', value: cabNumber },
          { icon: '🚏', label: 'Starting Point', value: pickupRegion },
          ...(hall ? [{ icon: '📍', label: 'Your Hall', value: hall }] : []),
          { icon: '📅', label: 'Trip Date', value: tripDate },
          { icon: '⏰', label: 'Departure', value: departureTime || 'Check app' },
        ]}
      />

      {/* QR Code Section */}
      {qrCodeUrl && (
        <Section style={styles.qrSection}>
          <Text className="email-text" style={styles.qrTitle}>
            Your Boarding Pass
          </Text>
          <Img
            src={qrCodeUrl}
            alt="Boarding QR Code"
            width={180}
            height={180}
            style={styles.qrCode}
          />
          <Text className="email-muted" style={styles.qrText}>
            Show this QR code to the driver when boarding
          </Text>
        </Section>
      )}

      <Section style={styles.buttonSection}>
        <Button href={actionUrl}>View Trip Details</Button>
      </Section>

      <Text className="email-text" style={styles.reminderText}>
        <strong>📋 Remember:</strong>
      </Text>
      <Text className="email-muted" style={styles.reminderList}>
        • Arrive at your hall 10 minutes early<br />
        • Keep your QR code ready
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
  qrSection: {
    textAlign: 'center' as const,
    margin: '28px 0',
    padding: '24px',
    backgroundColor: '#ffffff',
    border: '2px dashed #e4e4e7',
    borderRadius: '12px',
  },
  qrTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#18181b',
    margin: '0 0 16px 0',
  },
  qrCode: {
    margin: '0 auto',
    borderRadius: '8px',
  },
  qrText: {
    color: '#71717a',
    fontSize: '13px',
    margin: '12px 0 0 0',
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  reminderText: {
    fontSize: '16px',
    color: '#52525b',
    margin: '24px 0 8px 0',
  },
  reminderList: {
    fontSize: '14px',
    color: '#71717a',
    lineHeight: 2,
    margin: 0,
  },
};

export default CabAllocated;

