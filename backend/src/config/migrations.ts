import db from './database';
import fs from 'fs';
import path from 'path';

interface MigrationRecord {
  id: number;
  name: string;
  executed_at: Date;
}

export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    // Create migrations tracking table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of already executed migrations
    const executedMigrations = await db.query<MigrationRecord>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedNames = new Set(executedMigrations.rows.map(row => row.name));

    // Read all migration files from migrations directory
    const migrationsDir = path.join(__dirname, '../../migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found. Creating it...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically (001_, 002_, etc.)

    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found.');
      return;
    }

    let executedCount = 0;

    // Execute pending migrations
    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');

      // Skip if already executed
      if (executedNames.has(migrationName)) {
        console.log(`✅ Migration already executed: ${migrationName}`);
        continue;
      }

      console.log(`🔄 Executing migration: ${migrationName}`);

      // Read SQL file
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Execute migration in a transaction
      try {
        await db.query('BEGIN');
        
        // Run the migration SQL
        await db.query(sql);
        
        // Record migration as executed
        await db.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migrationName]
        );
        
        await db.query('COMMIT');
        
        console.log(`✅ Migration completed: ${migrationName}`);
        executedCount++;
      } catch (error) {
        await db.query('ROLLBACK');
        console.error(`❌ Migration failed: ${migrationName}`);
        console.error(error);
        throw error; // Stop execution on error
      }
    }

    if (executedCount === 0) {
      console.log('✅ All migrations are up to date!');
    } else {
      console.log(`✅ Successfully executed ${executedCount} migration(s)!`);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

