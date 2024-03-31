import { sql } from '$lib/server/database';
import type { Product } from '$lib/models/product';
import type { Store } from '$lib/models/store';
import priceRepository from '$lib/server/repositories/prices';
import productRepository from '$lib/server/repositories/products';
import storeRepository from '$lib/server/repositories/stores';

type User = {
  name: string;
  id: string;
};

export async function load() {
  const prices = await priceRepository.getAll();

  const users = await sql<User[]>`
    SELECT id, name FROM app.users
  `;

  const products: Product[] = await productRepository.getAll();

  const stores: Store[] = await storeRepository.getAll();

  return {
    prices,
    users,
    products,
    stores
  };
}
