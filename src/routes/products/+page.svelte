<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { enhance as enhanceS } from '$app/forms';
  import TrashCan from '$lib/components/TrashCan.svelte';

  export let data;

  const { form, constraints, errors, message, enhance } = superForm(data.form);

  let idToDelete: string;

  let dialogElement: HTMLDialogElement;
</script>

<div class="container">
  <form method="post" action="?/create" use:enhance>
    {#if $message}<h3>{$message}</h3>{/if}
    <div class="mb-8 flex md:max-w-96">
      <input
        name="name"
        type="text"
        class="w-full rounded-l-md border-r-0 border-slate-300"
        placeholder="Add a product"
        bind:value={$form.name}
        aria-invalid={$errors.name ? 'true' : undefined}
        {...$constraints.name}
      />
      <button
        type="submit"
        class="rounded-r-md bg-green-500 px-6 py-2 font-bold text-white hover:bg-green-600"
      >
        Save
      </button>
    </div>

    <ul class="flex w-full flex-col rounded-lg bg-slate-50 shadow md:w-1/2">
      {#each data.products as product}
        <li class="border-b-2 px-4 py-2">
          <form
            action="?/delete"
            method="post"
            use:enhanceS={({ cancel }) => {
              idToDelete = product.id;
              dialogElement.show();
              cancel();
            }}
            class="flex items-center justify-between"
          >
            <span>{product.name}</span>
            <button
              type="submit"
              class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-500 transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              <TrashCan />
            </button>
          </form>
        </li>
      {/each}
    </ul>
    <dialog bind:this={dialogElement}>
      <form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={idToDelete} />

        <button class="primary-button" formmethod="dialog">Cancel</button>
        <button class="danger-button" on:click={() => dialogElement.close()}>Confirm</button>
      </form>
    </dialog>
  </form>
</div>
