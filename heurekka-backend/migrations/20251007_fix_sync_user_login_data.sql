-- Fix sync_user_login_data to handle new users during signup
-- This prevents the trigger from causing errors when user_accounts doesn't exist yet

-- Drop and recreate the function to handle new users gracefully
DROP FUNCTION IF EXISTS sync_user_login_data() CASCADE;

CREATE OR REPLACE FUNCTION sync_user_login_data()
RETURNS TRIGGER AS $$
DECLARE
  user_account_exists BOOLEAN;
BEGIN
  -- Only process if last_sign_in_at has actually changed
  IF (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at) THEN
    -- Check if user_accounts record exists
    SELECT EXISTS(
      SELECT 1 FROM user_accounts WHERE user_id = NEW.id
    ) INTO user_account_exists;

    -- Only update if the record exists
    IF user_account_exists THEN
      UPDATE user_accounts
      SET
        last_login_at = NEW.last_sign_in_at,
        login_count = COALESCE(login_count, 0) + 1,
        last_active_at = NEW.last_sign_in_at
      WHERE user_id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users table
DROP TRIGGER IF EXISTS sync_login_on_auth ON auth.users;

CREATE TRIGGER sync_login_on_auth
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
EXECUTE FUNCTION sync_user_login_data();
