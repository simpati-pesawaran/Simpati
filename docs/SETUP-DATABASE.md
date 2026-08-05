# Database Setup Instructions

## IMPORTANT: Run Migration First

Before the app works, you need to create the database tables.

### Steps:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/psgycwmheqveqifdsbcf

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the Migration**
   - Copy the contents of: `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click "Run"

4. **Verify**
   - Run this query to verify:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
   
   You should see: profiles, agenda, notifications, gallery, activity_logs, settings

### Quick Test

After running the migration, verify the superadmin exists:
```sql
SELECT * FROM profiles WHERE email = 'siagapesarawan@gmail.com';
```

---

## If Migration Fails

If you get permission errors, you may need to:

1. Go to Authentication > Users
2. Create a user manually, OR
3. Disable RLS temporarily:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```

Then re-run the migration.

---

## Next Steps

After database is ready:
1. Enable Google OAuth in Supabase Dashboard > Authentication > Providers > Google
2. Add your Google OAuth credentials
3. Restart the app
