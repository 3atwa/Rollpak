# Message Sending App - Setup Instructions

## Issues Fixed

### 1. Database Schema Issues
- ✅ Fixed table name mismatch (`profiles` → `users`)
- ✅ Fixed foreign key field names (`created_by` → `user_id`)
- ✅ Added proper `tags` field support for contacts
- ✅ Updated TypeScript types to match database schema

### 2. User Management Issues
- ✅ Fixed user creation using Supabase Admin API
- ✅ Fixed user role management
- ✅ Improved error handling and user feedback
- ✅ Added proper user activation/deactivation

### 3. Contact Management Issues
- ✅ Fixed contact creation with proper `user_id` association
- ✅ Added tags support for contacts
- ✅ Improved contact import functionality
- ✅ Added tags column to contact display

## Setup Steps

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the `DATABASE_SETUP.sql` script provided
4. This will create all necessary tables, policies, and triggers

### 2. Environment Variables

Make sure your `.env` file contains:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Admin User

1. Go to Supabase Auth in your dashboard
2. Create a new user with admin privileges
3. Run this SQL to make them admin:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm start
```

## Key Features Now Working

### User Management
- ✅ Create new users with admin API
- ✅ Assign roles (admin/user)
- ✅ Activate/deactivate users
- ✅ Bulk operations
- ✅ Search and filter users

### Contact Management
- ✅ Add/edit/delete contacts
- ✅ Tag support for organizing contacts
- ✅ Import contacts from CSV/Excel/JSON/TXT
- ✅ User-specific contact isolation (RLS)

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only see their own contacts
- ✅ Admins can manage all users
- ✅ Proper authentication flow

## Database Schema

### Users Table
```sql
- id (uuid, primary key, references auth.users)
- email (text, unique)
- full_name (text)
- role (text: 'admin' or 'user')
- created_at (timestamp)
- is_active (boolean)
```

### Contacts Table
```sql
- id (uuid, primary key)
- name (text, required)
- email (text, optional)
- phone (text, optional)
- tags (text array)
- user_id (uuid, foreign key to users)
- created_at (timestamp)
```

### Messages Table
```sql
- id (uuid, primary key)
- content (text, required)
- recipients_email (text array)
- recipients_phone (text array)
- user_id (uuid, foreign key to users)
- status (text: 'pending', 'sent', 'failed')
- sent_at (timestamp)
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**: Make sure RLS policies are set up correctly
2. **User creation fails**: Ensure you're using the admin API with proper permissions
3. **Contacts not showing**: Check that the user is properly authenticated and RLS is working
4. **Import fails**: Verify file format and ensure all required fields are present

### Testing the Setup

1. Create an admin user
2. Login as admin
3. Create a regular user
4. Login as regular user
5. Add some contacts with tags
6. Test contact import functionality

## Next Steps

The application is now ready for use! You can:
- Add messaging functionality
- Implement email/SMS sending
- Add more contact management features
- Enhance the UI/UX
