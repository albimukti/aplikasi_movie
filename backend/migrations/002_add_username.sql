ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL OR username = '';
