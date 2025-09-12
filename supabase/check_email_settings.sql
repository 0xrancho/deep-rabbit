-- Check email confirmation settings in auth config

-- View auth configuration
SELECT * FROM auth.config;

-- Check if there are unconfirmed users
SELECT 
    email,
    created_at,
    email_confirmed_at,
    confirmation_sent_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'NOT CONFIRMED'
        ELSE 'CONFIRMED'
    END as status
FROM auth.users
ORDER BY created_at DESC;

-- Force confirm all existing users (this will let them log in)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Check the results
SELECT 
    email,
    email_confirmed_at,
    'Should be able to login now' as note
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;