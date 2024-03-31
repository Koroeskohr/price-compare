import type { Sql } from 'postgres';
import type { Product } from '$lib/models/product';
import { sql } from '../database';

type ProductRow = {
  id: string;
  name: string;
  created_at: Date;
};

type ProductRepositoryOptions = {
  database: Sql;
};

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  };
}

export class ProductRepository {
  private sql: Sql<{}>;
  constructor({ database }: ProductRepositoryOptions) {
    this.sql = database;
  }

  async getAll(): Promise<Product[]> {
    const products = await this.sql<ProductRow[]>`
      SELECT id, name, created_at from app.products;
    `;

    return products.map(rowToProduct);
  }

  async create(name: string): Promise<void> {
    await this.sql`
      INSERT INTO app.products (name) VALUES (${name})
    `;
  }

  async del(id: string): Promise<void> {
    await this.sql`
      DELETE FROM app.products WHERE id = ${id}
    `;
  }
}

const productRepository = new ProductRepository({
  database: sql
});

export default productRepository;
