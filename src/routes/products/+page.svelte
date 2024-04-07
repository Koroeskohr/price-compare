<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { enhance as enhanceS } from '$app/forms';

  export let data;

  const { form, constraints, errors, message, enhance } = superForm(data.form);

  let idToDelete: string;

  let dialogElement: HTMLDialogElement;
</script>

<h1>Add a product</h1>
<form method="post" action="?/create" use:enhance>
  {#if $message}<h3>{$message}</h3>{/if}
  <label>
    Name
    <input
      name="name"
      type="text"
      class="add_product"
      bind:value={$form.name}
      aria-invalid={$errors.name ? 'true' : undefined}
      {...$constraints.name}
    />
  </label>
  <input type="submit" class="add_product_button" value="Add a product" />

  <dialog bind:this={dialogElement}>
    <form method="POST" action="?/delete" use:enhance>
      <input type="hidden" name="id" value={idToDelete} />

      <button class="primary-button" formmethod="dialog">Cancel</button>
      <button class="danger-button" on:click={() => dialogElement.close()}>Confirm</button>
    </form>
  </dialog>

  <h1>Products:</h1>
  <ul>
    {#each data.products as product}
      <li>
        <form
          action="?/delete"
          method="post"
          use:enhanceS={({ cancel }) => {
            idToDelete = product.id;
            dialogElement.show();
            cancel();
          }}
        >
          <span>{product.name}</span>
          <input type="submit" value="&times;" class="close_button" />
        </form>
      </li>
    {/each}
  </ul>
</form>

<style>
  ul li {
    margin-bottom: 0.5rem;
  }
  .close_button {
    line-height: 0rem;
    border: solid 0.5px black;
    width: 1rem;
    height: 1rem;
    border-radius: 0.5rem;
  }
  .add_product {
    border: solid 1px #555;
  }
  .add_product_button {
    border: solid 1px black;
    background-color: #eee;
  }
</style>
