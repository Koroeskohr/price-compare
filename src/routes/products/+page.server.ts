import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import productRepository from '$lib/server/repositories/products';
import type { Product } from '$lib/models/product';
import { logger } from '$lib/server/logger';

const validators = {
  create: z.object({
    name: z.string().min(1).max(50)
  })
};

export async function load() {
  const form = await superValidate(zod(validators.create));

  const products: Product[] = await productRepository.getAll();

  return {
    form,
    products
  };
}

export const actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, zod(validators.create));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { name } = form.data;

    await productRepository.create(name);
    logger.info({ name }, 'Created product');

    return { form };
  },
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id');

    if (!id) {
      return fail(400, { message: 'bad id' });
    }

    await productRepository.del(String(id));
    logger.info({ id }, 'Deleted product');
  }
} satisfies Actions;
