# Admin Setup Instructions

## Issue: User Management Not Appearing

The user management features are not appearing because your current user doesn't have admin role in the database.

## Solution: Set Up Admin User

### Option 1: Update Existing User to Admin

Run this SQL query in your Supabase SQL editor:

```sql
-- Update your current user to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID_HERE';

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find your user ID in the auth.users table or in the browser console
```

### Option 2: Create New Admin User

1. **Sign up a new user** with email: `admin@example.com`
2. **Run this SQL query** in Supabase:

```sql
-- Update the new user to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Option 3: Direct Database Update

1. Go to your **Supabase Dashboard**
2. Navigate to **Table Editor** → **profiles**
3. Find your user record
4. Change the **role** column from `'user'` to `'admin'`
5. Save the changes

## Verification

After updating the role:

1. **Refresh the page** or **log out and log back in**
2. Check the **browser console** for debug messages showing your role
3. The **User Management** and **User Controller** menu items should now appear in the sidebar

## Debug Information

The app will show debug information in the browser console:
- Current user role
- Is admin status
- User email

## Temporary Access

For testing purposes, the app temporarily shows admin features if your email is `admin@example.com`.

## Logo Added

✅ **Logo file created**: `/public/logo.svg`
✅ **Logo integrated**: Shows in sidebar header and main app bar
✅ **Responsive design**: Logo hidden on mobile, visible on desktop

---

**Note**: After setting up the admin user, you can remove the temporary debug code and email check from the AppLayout component.
