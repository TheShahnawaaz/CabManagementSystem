/**
 * Copy Production Data to Dev Database
 * 
 * This script:
 * 1. Connects to production database and exports all data
 * 2. Anonymizes user emails (test1@gmail.com, test2@gmail.com, etc.)
 * 3. Clears dev database tables
 * 4. Inserts data into dev database in correct FK order
 * 
 * Usage: 
 *   PROD_DATABASE_URL="..." DEV_DATABASE_URL="..." npx ts-node scripts/copy-prod-to-dev.ts
 */

import { Pool } from 'pg';

// Get database URLs from environment
const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL;
const DEV_DATABASE_URL = process.env.DEV_DATABASE_URL;

if (!PROD_DATABASE_URL || !DEV_DATABASE_URL) {
  console.error('❌ Error: Please set PROD_DATABASE_URL and DEV_DATABASE_URL environment variables');
  console.log('\nUsage:');
  console.log('  PROD_DATABASE_URL="postgres://..." DEV_DATABASE_URL="postgres://..." npx ts-node scripts/copy-prod-to-dev.ts');
  process.exit(1);
}

// Create database connections
const prodPool = new Pool({ connectionString: PROD_DATABASE_URL });
const devPool = new Pool({ connectionString: DEV_DATABASE_URL });

// Tables in order of dependencies (for insert) 
// Reverse this order for delete
const TABLES_INSERT_ORDER = [
  'users',
  'trips', 
  'payments',
  'trip_users',
  'cabs',
  'cab_allocations',
  'journeys',
  'notifications',
  'email_queue',
];

interface UserMapping {
  oldId: string;
  newEmail: string;
  index: number;
}

async function main() {
  console.log('🚀 Starting production to dev data copy...\n');

  try {
    // Test connections
    console.log('📡 Testing database connections...');
    await prodPool.query('SELECT 1');
    console.log('  ✅ Production database connected');
    await devPool.query('SELECT 1');
    console.log('  ✅ Dev database connected\n');

    // Fetch all data from production
    console.log('📥 Fetching data from production...');
    
    const prodData: Record<string, any[]> = {};
    
    for (const table of TABLES_INSERT_ORDER) {
      const result = await prodPool.query(`SELECT * FROM ${table}`);
      prodData[table] = result.rows;
      console.log(`  📦 ${table}: ${result.rows.length} rows`);
    }

    // Create user email mapping
    console.log('\n🔒 Anonymizing user data...');
    const userMapping: Map<string, UserMapping> = new Map();
    
    prodData.users.forEach((user, index) => {
      const newEmail = `test${index + 1}@gmail.com`;
      userMapping.set(user.id, {
        oldId: user.id,
        newEmail,
        index: index + 1,
      });
      console.log(`  👤 ${user.email} → ${newEmail}`);
    });

    // Anonymize user records - only change email, keep everything else
    const anonymizedUsers = prodData.users.map((user, index) => ({
      ...user,
      email: `test${index + 1}@gmail.com`,
      // Keep original: name, phone_number, profile_picture
    }));

    // Anonymize email_queue records
    const anonymizedEmailQueue = prodData.email_queue.map((email) => {
      const mapping = email.user_id ? userMapping.get(email.user_id) : null;
      return {
        ...email,
        to_email: mapping ? mapping.newEmail : `anonymous@example.com`,
        to_name: mapping ? `Test User ${mapping.index}` : 'Anonymous',
        body_html: '<p>Content redacted for dev environment</p>',
      };
    });

      
    // prodData.payments.forEach(payment => {
    //     console.log(payment);
    //     console.log('--------------------------------');
    // });

    // return;
      
    // Clear dev database tables (in reverse order)
    console.log('\n🧹 Clearing dev database tables...');
    const devClient = await devPool.connect();
    
    try {
      await devClient.query('BEGIN');
      
      // Disable triggers temporarily for faster deletion
      await devClient.query('SET session_replication_role = replica');
      
      for (const table of [...TABLES_INSERT_ORDER].reverse()) {
        await devClient.query(`DELETE FROM ${table}`);
        console.log(`  🗑️  Cleared ${table}`);
      }
      
      // Re-enable triggers
      await devClient.query('SET session_replication_role = DEFAULT');
      
      await devClient.query('COMMIT');
    } catch (error) {
      await devClient.query('ROLLBACK');
      throw error;
    } finally {
      devClient.release();
    }

    // Insert data into dev database
    console.log('\n📤 Inserting data into dev database...');
    const insertClient = await devPool.connect();
    
    try {
      await insertClient.query('BEGIN');
      
      // Disable triggers for faster insertion
      await insertClient.query('SET session_replication_role = replica');

      // Insert users (anonymized)
      if (anonymizedUsers.length > 0) {
        for (const user of anonymizedUsers) {
          await insertClient.query(`
            INSERT INTO users (id, email, name, profile_picture, is_admin, phone_number, email_notifications, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            user.id,
            user.email,
            user.name,
            user.profile_picture,
            user.is_admin,
            user.phone_number,
            user.email_notifications ?? true,
            user.created_at,
            user.updated_at,
          ]);
        }
        console.log(`  ✅ users: ${anonymizedUsers.length} rows inserted`);
      }

      // Insert trips
      if (prodData.trips.length > 0) {
        for (const trip of prodData.trips) {
          await insertClient.query(`
            INSERT INTO trips (id, trip_title, trip_date, booking_start_time, booking_end_time, departure_time, prayer_time, end_time, amount_per_person, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            trip.id,
            trip.trip_title,
            trip.trip_date,
            trip.booking_start_time,
            trip.booking_end_time,
            trip.departure_time,
            trip.prayer_time,
            trip.end_time,
            trip.amount_per_person,
            trip.created_at,
            trip.updated_at,
          ]);
        }
        console.log(`  ✅ trips: ${prodData.trips.length} rows inserted`);
      }

      // Insert payments
      if (prodData.payments.length > 0) {
        for (const payment of prodData.payments) {
          await insertClient.query(`
            INSERT INTO payments (
              id, user_id, trip_id, payment_status, payment_amount, payment_date,
              payment_method, transaction_id, gateway, gateway_order_id, gateway_payment_id,
              gateway_signature, verified_at, webhook_verified, metadata, failure_reason,
              expires_at, hall, notification_sent, created_at, updated_at, gateway_fee, gateway_tax, net_amount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
          `, [
            payment.id,
            payment.user_id,
            payment.trip_id,
            payment.payment_status,
            payment.payment_amount,
            payment.payment_date,
            payment.payment_method,
            payment.transaction_id,
            payment.gateway ?? 'razorpay',
            payment.gateway_order_id,
            payment.gateway_payment_id,
            payment.gateway_signature,
            payment.verified_at,
            payment.webhook_verified ?? false,
            payment.metadata ?? {},
            payment.failure_reason,
            payment.expires_at,
            payment.hall,
            payment.notification_sent ?? false,
            payment.created_at,
            payment.updated_at,
            payment.gateway_fee ?? 0,
            payment.gateway_tax ?? 0,
            payment.net_amount ?? 0,
          ]);
        }
        console.log(`  ✅ payments: ${prodData.payments.length} rows inserted`);
      }

      // Insert trip_users
      if (prodData.trip_users.length > 0) {
        for (const tu of prodData.trip_users) {
          await insertClient.query(`
            INSERT INTO trip_users (id, trip_id, user_id, hall, payment_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            tu.id,
            tu.trip_id,
            tu.user_id,
            tu.hall,
            tu.payment_id,
            tu.created_at,
            tu.updated_at,
          ]);
        }
        console.log(`  ✅ trip_users: ${prodData.trip_users.length} rows inserted`);
      }

      // Insert cabs
      if (prodData.cabs.length > 0) {
        for (const cab of prodData.cabs) {
          await insertClient.query(`
            INSERT INTO cabs (id, trip_id, cab_number, cab_type, cab_capacity, cab_owner_name, cab_owner_phone, pickup_region, passkey, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            cab.id,
            cab.trip_id,
            cab.cab_number,
            cab.cab_type,
            cab.cab_capacity,
            cab.cab_owner_name,
            cab.cab_owner_phone,
            cab.pickup_region,
            cab.passkey,
            cab.created_at,
            cab.updated_at,
          ]);
        }
        console.log(`  ✅ cabs: ${prodData.cabs.length} rows inserted`);
      }

      // Insert cab_allocations
      if (prodData.cab_allocations.length > 0) {
        for (const ca of prodData.cab_allocations) {
          await insertClient.query(`
            INSERT INTO cab_allocations (id, trip_id, user_id, cab_id, notification_sent, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            ca.id,
            ca.trip_id,
            ca.user_id,
            ca.cab_id,
            ca.notification_sent ?? false,
            ca.created_at,
            ca.updated_at,
          ]);
        }
        console.log(`  ✅ cab_allocations: ${prodData.cab_allocations.length} rows inserted`);
      }

      // Insert journeys
      if (prodData.journeys.length > 0) {
        for (const journey of prodData.journeys) {
          await insertClient.query(`
            INSERT INTO journeys (id, trip_id, user_id, cab_id, journey_type, journey_date_time, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            journey.id,
            journey.trip_id,
            journey.user_id,
            journey.cab_id,
            journey.journey_type,
            journey.journey_date_time,
            journey.created_at,
            journey.updated_at,
          ]);
        }
        console.log(`  ✅ journeys: ${prodData.journeys.length} rows inserted`);
      }

      // Insert notifications
      if (prodData.notifications.length > 0) {
        for (const notif of prodData.notifications) {
          await insertClient.query(`
            INSERT INTO notifications (id, user_id, title, body, icon, action_url, category, priority, reference_type, reference_id, read_at, archived_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            notif.id,
            notif.user_id,
            notif.title,
            notif.body,
            notif.icon,
            notif.action_url,
            notif.category,
            notif.priority,
            notif.reference_type,
            notif.reference_id,
            notif.read_at,
            notif.archived_at,
            notif.created_at,
          ]);
        }
        console.log(`  ✅ notifications: ${prodData.notifications.length} rows inserted`);
      }

      // Insert email_queue (anonymized)
      if (anonymizedEmailQueue.length > 0) {
        for (const email of anonymizedEmailQueue) {
          await insertClient.query(`
            INSERT INTO email_queue (id, user_id, to_email, to_name, subject, body_html, template, template_data, category, priority, reference_type, reference_id, status, attempts, max_attempts, last_error, scheduled_for, sent_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          `, [
            email.id,
            email.user_id,
            email.to_email,
            email.to_name,
            email.subject,
            email.body_html,
            email.template,
            email.template_data,
            email.category,
            email.priority,
            email.reference_type,
            email.reference_id,
            email.status,
            email.attempts,
            email.max_attempts,
            email.last_error,
            email.scheduled_for,
            email.sent_at,
            email.created_at,
          ]);
        }
        console.log(`  ✅ email_queue: ${anonymizedEmailQueue.length} rows inserted`);
      }

      // Re-enable triggers
      await insertClient.query('SET session_replication_role = DEFAULT');
      
      await insertClient.query('COMMIT');
      
    } catch (error) {
      await insertClient.query('ROLLBACK');
      throw error;
    } finally {
      insertClient.release();
    }

    console.log('\n✅ Data copy complete!');
    console.log('\n📊 Summary:');
    console.log(`  👥 Users: ${anonymizedUsers.length} (anonymized)`);
    console.log(`  🚌 Trips: ${prodData.trips.length}`);
    console.log(`  💳 Payments: ${prodData.payments.length}`);
    console.log(`  📋 Bookings: ${prodData.trip_users.length}`);
    console.log(`  🚕 Cabs: ${prodData.cabs.length}`);
    console.log(`  🎫 Allocations: ${prodData.cab_allocations.length}`);
    console.log(`  🛣️  Journeys: ${prodData.journeys.length}`);
    console.log(`  🔔 Notifications: ${prodData.notifications.length}`);
    console.log(`  📧 Email Queue: ${anonymizedEmailQueue.length}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prodPool.end();
    await devPool.end();
  }
}

main();
