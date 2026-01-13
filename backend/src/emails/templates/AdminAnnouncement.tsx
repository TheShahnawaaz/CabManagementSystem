import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout, Badge, Button } from '../components';

interface AdminAnnouncementProps {
  userName: string;
  subject: string;
  message: string;
  actionUrl?: string;
}

export const AdminAnnouncement: React.FC<AdminAnnouncementProps> = ({
  userName,
  subject,
  message,
  actionUrl,
}) => {
  return (
    <EmailLayout preview={message.substring(0, 100)}>
      <Badge variant="info">📢 Announcement</Badge>

      <Text className="email-title" style={styles.title}>
        {subject}
      </Text>

      <Text className="email-text" style={styles.text}>
        Hi <strong>{userName}</strong>,
      </Text>

      <Section style={styles.messageBox}>
        <Text className="email-text" style={styles.messageText}>
          {message}
        </Text>
      </Section>

      {actionUrl && (
        <Section style={styles.buttonSection}>
          <Button href={actionUrl}>Learn More</Button>
        </Section>
      )}

      <Text className="email-muted" style={styles.footer}>
        This message was sent by the Friday Cab team.
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
  messageBox: {
    backgroundColor: 'transparent',
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
  },
  messageText: {
    fontSize: '16px',
    color: '#52525b',
    lineHeight: 1.8,
    margin: 0,
    whiteSpace: 'pre-line' as const,
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  footer: {
    fontSize: '14px',
    color: '#71717a',
    textAlign: 'center' as const,
    margin: '24px 0 0 0',
  },
};

export default AdminAnnouncement;

