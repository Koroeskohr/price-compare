<script lang="ts" generics="T">
  import type { Writable } from 'svelte/store';

  import { DataColumn, BodyRow } from 'svelte-headless-table';

  export let row: BodyRow<T>;
  export let column: DataColumn<T>;
  export let value: string;
  export let onUpdateValue: (rowDataId: string, columnId: string, newValue: string) => void;

  export let othersOpened: Writable<[string, string]>;

  // Whether or not to display the editing field
  let isEditing = false;

  // The temporary value storing the content of the cell
  let _value: string = value;

  let inputElement: HTMLInputElement | undefined;
  $: if (isEditing) {
    inputElement?.focus();
  }

  const handleEdit = () => {
    isEditing = true;
    if (row.isData()) {
      othersOpened.set([row.dataId, column.id]);
    }
  };

  const handleCancel = () => {
    _value = value;
    isEditing = false;
  };

  const handleSubmit = () => {
    value = _value;
    isEditing = false;
    if (row.isData()) {
      onUpdateValue(row.dataId, column.id, value);
    }
  };

  // Allows closing this cell if another is open
  othersOpened.subscribe((other) => {
    if (!other) {
      return;
    }
    const [rowId, colId] = other;
    if (row.isData()) {
      if (rowId === row.dataId && colId === column.id) {
        return;
      }
    }
    handleCancel();
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fill">
  {#if !isEditing}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fill cell" on:click={handleEdit}>
      {value}
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <input bind:this={inputElement} type="text" bind:value={_value} />
      <button type="submit">✅</button>
      <button on:click={handleCancel}>❌</button>
    </form>
  {/if}
</div>

<style>
  .fill {
    display: inline-block;
    height: 100%;
    width: 100%;
  }

  .cell::after {
    content: '\200b';
  }

  form {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0;
    border: none;
    background: transparent;
  }
</style>
