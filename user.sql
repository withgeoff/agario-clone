-- Enable UUID extension (PostgreSQL specific)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE roles (
                       id SERIAL PRIMARY KEY,
                       name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
                            user_id INT REFERENCES users(id) ON DELETE CASCADE,
                            role_id INT REFERENCES roles(id) ON DELETE CASCADE,
                            PRIMARY KEY (user_id, role_id)
);

-- Create indexes
CREATE INDEX idx_user_username ON users (username);
CREATE INDEX idx_user_email ON users (email);

-- Data
INSERT INTO users VALUES (uuid_generate_v4(), 'geoffcox', 'dragon789', 'geoff@okay-fine');
INSERT INTO user_roles VALUES ('d13c3970-01f7-4bb1-9876-48849278803c', 'player');