# Database Migrations

## How It Works

Migrations run automatically on server startup. The system:
1. Creates a `migrations` table to track executed migrations
2. Reads all `.sql` files from this directory
3. Executes them in alphabetical order
4. Skips migrations that have already been run
5. Stops if any migration fails

## Naming Convention

Use numbered prefixes for ordering:
```
001_create_users_table.sql
002_create_trips_table.sql
003_create_payments_table.sql
004_add_user_phone_column.sql
```

## Creating New Migrations

1. Create a new `.sql` file with the next number
2. Write your SQL (CREATE TABLE, ALTER TABLE, etc.)
3. Save the file
4. Restart the server - migration runs automatically!

## Example Migration

```sql
-- 002_create_trips_table.sql

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_title VARCHAR(255) NOT NULL,
  trip_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(trip_date);
```

## Best Practices

✅ **DO:**
- Use `IF NOT EXISTS` for idempotency
- Name files clearly (e.g., `005_add_payment_status_column.sql`)
- Keep migrations small and focused
- Test migrations locally first
- Use transactions (already handled automatically)

❌ **DON'T:**
- Don't modify existing migration files after they've been run
- Don't delete migration files
- Don't skip numbers in the sequence
- Don't include `DROP TABLE` without `IF EXISTS`

## Checking Migration Status

Migrations are tracked in the `migrations` table:

```sql
SELECT * FROM migrations ORDER BY id;
```

## Troubleshooting

### Migration Failed?
1. Check server logs for error details
2. Fix the SQL in the migration file
3. Delete the failed entry from `migrations` table:
   ```sql
   DELETE FROM migrations WHERE name = 'xxx_failed_migration';
   ```
4. Restart the server

### Need to Rollback?
Migrations don't auto-rollback. If needed:
1. Manually write the reverse SQL
2. Execute it in Supabase SQL editor
3. Remove the entry from `migrations` table

## Production Deployment

Migrations run automatically on server startup, so:
1. Deploy new code with migration files
2. Start the server
3. Migrations run before accepting requests
4. Server starts only if all migrations succeed

---

**Current Migrations:**
- ✅ `001_create_users_table.sql` - User authentication table

