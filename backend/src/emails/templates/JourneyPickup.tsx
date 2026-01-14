import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout, Badge, DetailsCard } from '../components';

interface JourneyPickupProps {
  userName: string;
  tripTitle: string;
  tripDate?: string;
  boardedAt?: string;
  cabNumber: string;
}

export const JourneyPickup: React.FC<JourneyPickupProps> = ({
  userName,
  tripTitle,
  tripDate,
  boardedAt,
  cabNumber,
}) => {
  return (
    <EmailLayout preview={`Boarding confirmed for ${tripTitle} - Have a blessed Friday!`}>
      <Badge variant="success">✓ Boarded</Badge>

      <Text className="email-title" style={styles.title}>
        You're On Your Way! 🕌
      </Text>

      <Text className="email-text" style={styles.text}>
        Hi <strong>{userName}</strong>,
      </Text>

      <Text className="email-text" style={styles.text}>
        Your boarding for <strong>{tripTitle}</strong> has been recorded successfully.
      </Text>

      <DetailsCard
        items={[
          { icon: '🚗', label: 'Cab', value: cabNumber },
          { icon: '📍', label: 'Journey', value: 'Campus → Mosque', isSuccess: true },
          ...(tripDate ? [{ icon: '📅', label: 'Date', value: tripDate }] : []),
          ...(boardedAt ? [{ icon: '⏰', label: 'Boarded at', value: boardedAt }] : []),
        ]}
      />

      <Section style={styles.emojiSection}>
        <Text style={styles.emoji}>🤲</Text>
      </Section>

      <Text className="email-text" style={styles.centerText}>
        Have a blessed prayer!
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
  emojiSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  emoji: {
    fontSize: '48px',
    margin: 0,
  },
  centerText: {
    fontSize: '16px',
    color: '#52525b',
    textAlign: 'center' as const,
    margin: 0,
  },
};

export default JourneyPickup;

