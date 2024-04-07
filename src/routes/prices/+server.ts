import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import priceRepository from '$lib/server/repositories/prices';
import type { Price } from '$lib/models/price';
import { logger } from '$lib/server/logger';

const validators = {
  create: z.object({
    price: z.number().min(0.01),
    productId: z.string().min(1),
    storeId: z.string().min(1)
  })
};

export const PATCH: RequestHandler = async ({ request }) => {
  const data = await request.json();

  const id = data.price_id;
  const price = parseFloat(data.price);
  if (price <= 0) {
    return json('Negative price', { status: 400 });
  }

  await priceRepository.update(id, price);
  logger.info({ id, price }, 'Edited price');

  return new Response(null, { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();

  const req = await validators.create.safeParseAsync(data);
  if (!req.success) {
    return json(req.error.message, { status: 400 });
  }

  const { price, productId, storeId } = req.data;

  // FIXME:
  const userId = 'fe356b4f-09e0-4da7-afd5-1ea948110cc8';

  const newPrice: Price = await priceRepository.create(price, productId, storeId, userId);
  logger.info({ id: newPrice.id, productId, storeId, userId, price }, 'Edited price');

  return json({ price: newPrice });
};
