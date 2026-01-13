import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout, Badge, DetailsCard } from '../components';

interface JourneyReturnProps {
  userName: string;
  tripTitle: string;
  cabNumber: string;
}

const BRAND_NAME = process.env.EMAIL_BRAND_NAME || "IITKGP Cabs";

export const JourneyReturn: React.FC<JourneyReturnProps> = ({
  userName,
  tripTitle,
  cabNumber,
}) => {
  return (
    <EmailLayout preview={`Return journey completed for ${tripTitle} - See you next Friday!`}>
      <Badge variant="success">✓ Return Logged</Badge>

      <Text className="email-title" style={styles.title}>
        Welcome Back! 🏠
      </Text>

      <Text className="email-text" style={styles.text}>
        Hi <strong>{userName}</strong>,
      </Text>

      <Text className="email-text" style={styles.text}>
        Your return journey for <strong>{tripTitle}</strong> has been logged.
      </Text>

      <DetailsCard
        items={[
          { icon: '🚗', label: 'Cab', value: cabNumber },
          { icon: '📍', label: 'Journey', value: 'Mosque → Campus', isSuccess: true },
        ]}
      />

      <Text className="email-text" style={styles.centerText}>
        Thank you for using <strong>{BRAND_NAME}</strong>!<br />
        We hope you had a blessed Friday. 🤲
      </Text>

      <Text className="email-muted" style={styles.seeYou}>
        See you next Friday! 👋
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
  centerText: {
    fontSize: '16px',
    color: '#52525b',
    textAlign: 'center' as const,
    lineHeight: 1.8,
    margin: '24px 0 0 0',
  },
  seeYou: {
    fontSize: '14px',
    color: '#71717a',
    textAlign: 'center' as const,
    margin: '16px 0 0 0',
  },
};

export default JourneyReturn;

