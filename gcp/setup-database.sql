-- =============================================================================
--  SeleEvent — Cloud SQL Database Setup
--
--  Run this from Cloud Shell after connecting:
--    gcloud sql connect eventku --user=postgres --database=postgres
--
--  Then paste this entire script or run:
--    \i /path/to/setup-database.sql
-- =============================================================================

-- Create the application database
CREATE DATABASE eventku;

-- Create the application user (change the password!)
CREATE USER eventku WITH ENCRYPTED PASSWORD 'CHANGE_ME_TO_YOUR_DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eventku TO eventku;

-- Connect to the eventku database and grant schema permissions
\c eventku

GRANT ALL ON SCHEMA public TO eventku;

-- Enable UUID extension (needed for our models)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify
\echo '✅ Database setup complete!'
\echo '   Database: eventku'
\echo '   User: eventku'
\echo '   Run: \\q to exit'
