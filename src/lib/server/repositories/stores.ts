import type { Sql } from 'postgres';
import type { Store } from '../../models/store';
import { sql } from '../database';

type StoreRow = {
  id: string;
  name: string;
  created_at: Date;
};

type StoreRepositoryOptions = {
  database: Sql;
};

export function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  };
}

export class StoreRepository {
  private sql: Sql<{}>;
  constructor({ database }: StoreRepositoryOptions) {
    this.sql = database;
  }

  async getAll(): Promise<Store[]> {
    const stores = await this.sql<StoreRow[]>`
      SELECT id, name, created_at from app.stores;
    `;

    return stores.map(rowToStore);
  }

  async create(name: string): Promise<void> {
    await this.sql`
      INSERT INTO app.stores (name) VALUES (${name})
    `;
  }

  async del(id: string): Promise<void> {
    await this.sql`
      DELETE FROM app.stores WHERE id = ${id}
    `;
  }
}

const storeRepository = new StoreRepository({
  database: sql
});

export default storeRepository;
