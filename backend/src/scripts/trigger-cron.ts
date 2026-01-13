import dotenv from 'dotenv';
import axios from 'axios';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 3000;
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error('❌ Error: CRON_SECRET not found in .env');
  process.exit(1);
}

const url = `http://localhost:${PORT}/api/cron/process-emails`;

console.log(`🚀 Triggering email queue at ${url}...`);

async function triggerCron() {
  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          'x-cron-secret': CRON_SECRET,
        },
      }
    );

    console.log('✅ Success:', response.data);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: Server is not running. Please start the backend server first.');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    process.exit(1);
  }
}

triggerCron();
