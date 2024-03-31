import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { sql } from '$lib/server/database';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import storeRepository from '$lib/server/repositories/stores';

const validators = {
  create: z.object({
    name: z.string().min(1).max(30)
  })
};

export async function load() {
  const form = await superValidate(zod(validators.create));

  const stores = await storeRepository.getAll();

  return {
    form,
    stores
  };
}

export const actions = {
  create: async ({ request }) => {
    const form = await superValidate(request, zod(validators.create));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { name } = form.data;

    await storeRepository.create(name);

    return { form };
  },
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id');

    if (!id) {
      return fail(400, { message: 'bad id' });
    }

    await storeRepository.del(String(id));
  }
} satisfies Actions;
