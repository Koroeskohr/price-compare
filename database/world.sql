-- CREATE DATABASE IF NOT EXISTS price_compare;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.users(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  name varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS app.products(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  name varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS app.stores(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  name varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS app.prices(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES app.products(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES app.stores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES app.users(id) ON DELETE RESTRICT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  price NUMERIC NOT NULL CHECK (price > 0)
);
