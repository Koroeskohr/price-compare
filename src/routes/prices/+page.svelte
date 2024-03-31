<script lang="ts">
  import { groupBy } from 'ramda';
  import {
    createTable,
    Subscribe,
    Render,
    type DataLabel,
    createRender
  } from 'svelte-headless-table';
  import type { AnyPlugins } from 'svelte-headless-table/plugins';
  import { writable, type Writable } from 'svelte/store';
  import EditableCell from '$lib/components/EditableCell.svelte';
  import type { Price } from '$lib/models/price.js';
  import type { ComponentProps } from 'svelte';

  export let data;

  const { prices, products, stores } = data;

  type CellType = {
    product: {
      id: string;
      name: string;
    };
    prices: Price[];
  };

  const byProduct = groupBy((p: Price) => p.productId, prices);
  const withProductName: CellType[] = (Object.entries(byProduct) as [string, Price[]][]).map(
    ([productId, prices]) => ({
      product: {
        id: productId,
        name: products.find((p) => p.id == productId)!.name
      },
      prices
    })
  );

  const productsWithPrices = Object.keys(byProduct);
  const missingProducts = products.filter((p) => !productsWithPrices.includes(p.id));
  const withMissingProducts: CellType[] = [
    ...withProductName,
    ...missingProducts.map((p) => ({
      product: {
        id: p.id,
        name: p.name
      },
      prices: []
    }))
  ];

  const tableData = writable(withMissingProducts);

  const table = createTable(tableData);

  const updateData = async (rowDataId: string, columnId: string, newValue: string) => {
    let newAsNumber: number;
    try {
      newAsNumber = parseFloat(newValue);
    } catch {
      return;
    }
    // In this case, the dataId of each item is its index in $data.
    // You can also handle any server-synchronization necessary here.
    const idx = parseInt(rowDataId);
    const currentItem = $tableData[idx];

    // if we know such a store
    // FIXME: this is susceptible to client desync, we could find/not find one with by mistake
    if (currentItem.prices.find((p) => p.storeId === columnId)) {
      const newItem = {
        ...currentItem,
        prices: currentItem.prices.map((p) =>
          p.storeId === columnId ? { ...p, price: newAsNumber } : p
        )
      };

      // Edit an existing price
      const res = await fetch('/prices', {
        method: 'PATCH',
        body: JSON.stringify({
          price_id: newItem.prices.find((p) => p.storeId === columnId)!.id,
          price: newAsNumber
        })
      });

      // Update the view if the change has been persisted
      if (res.ok) {
        $tableData[idx] = newItem;
      }

      $tableData = $tableData;
    } else {
      // Add a new price
      const res = await fetch('/prices', {
        method: 'POST',
        body: JSON.stringify({
          price: newAsNumber,
          productId: currentItem.product.id,
          storeId: columnId
        })
      });

      if (res.ok) {
        const { price } = await res.json();

        const withDate: Price = { ...price, createdAt: new Date(price.createdAt) };

        const newItem: CellType = {
          ...currentItem,
          prices: [...currentItem.prices, withDate]
        };
        $tableData[idx] = newItem;
      }
      $tableData = $tableData;
    }
  };

  let othersOpened: Writable<[string, string]> = writable();

  const EditableCellLabel: DataLabel<CellType, AnyPlugins, string> = ({ row, column, value }) => {
    const props: ComponentProps<EditableCell<CellType>> = {
      row,
      column,
      value,
      onUpdateValue: updateData,
      othersOpened
    };
    return createRender<EditableCell<CellType>>(EditableCell, props);
  };

  const nameColumn = table.column({
    header: '',
    accessor: (p) => p.product.name
  });

  const dataColumns = stores.map((st) =>
    table.column({
      header: st.name,
      accessor: (p) => p.prices.find((p) => p.storeId === st.id)?.price.toString() ?? '',
      cell: EditableCellLabel,
      id: st.id
    })
  );

  const columns = table.createColumns([nameColumn, ...dataColumns]);

  const { headerRows, rows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<h1>Prices</h1>

<div class="container">
  <table {...$tableAttrs}>
    <thead>
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
          <tr {...rowAttrs}>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <th {...attrs}>
                  <Render of={cell.render()} />
                </th>
              </Subscribe>
            {/each}
          </tr>
        </Subscribe>
      {/each}
    </thead>
    <tbody {...$tableBodyAttrs}>
      {#each $rows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <tr {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <td {...attrs}>
                  <Render of={cell.render()} />
                </td>
              </Subscribe>
            {/each}
          </tr>
        </Subscribe>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .container {
    overflow-x: auto;
  }

  table {
    border: solid 1px #ddeeee;
    border-collapse: collapse;
    border-spacing: 0;
    font:
      normal 13px Arial,
      sans-serif;
  }
  thead th {
    background-color: #ddefef;
    border: solid 1px #ddeeee;
    color: #336b6b;
    padding: 10px;
    text-align: left;
    text-shadow: 1px 1px 1px #fff;
  }
  tbody td {
    border: solid 1px #ddeeee;
    color: #333;
    padding: 10px;
    text-shadow: 1px 1px 1px #fff;
  }
</style>
