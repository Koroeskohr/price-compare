import type { Sql } from 'postgres';
import type { Price } from '../../models/price';
import { sql } from '$lib/server/database';

export type PriceRow = {
  id: string;
  price: string; // numeric issues, see https://github.com/porsager/postgres#numbers-bigint-numeric
  created_at: Date;
  product_id: string;
  store_id: string;
  user_id: string;
};

type PriceRepositoryOptions = {
  database: Sql;
};

function rowToPrice(row: PriceRow): Price {
  return {
    id: row.id,
    price: parseFloat(row.price),
    createdAt: row.created_at,
    userId: row.user_id,
    productId: row.product_id,
    storeId: row.store_id
  };
}

export class PriceRepository {
  private sql: Sql<{}>;
  constructor({ database }: PriceRepositoryOptions) {
    this.sql = database;
  }

  async getAll(): Promise<Price[]> {
    const prices = await this.sql<PriceRow[]>`
      SELECT
        id,
        price,
        created_at,
        product_id,
        store_id,
        user_id
      FROM app.prices price
    `;

    return prices.map(rowToPrice);
  }

  async create(price: number, productId: string, storeId: string, userId: string): Promise<Price> {
    const res = await this.sql<PriceRow[]>`
    INSERT INTO app.prices (price, product_id, store_id, user_id) VALUES (${price}, ${productId}, ${storeId}, ${userId})
    RETURNING id, price, created_at, product_id, store_id, user_id
    `;

    if (res.length !== 1) {
      throw new Error('Not exactly one price returned');
    }

    return res.map(rowToPrice)[0];
  }

  async update(id: string, price: number): Promise<void> {
    await this.sql`
      UPDATE app.prices SET price = ${price} WHERE id = ${id}
    `;
  }
}

const priceRepository = new PriceRepository({
  database: sql
});

export default priceRepository;
