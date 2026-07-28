import React, { forwardRef, useId } from 'react';
import '@dhcw/sr-web/src/table/table.css';
import '@dhcw/sr-web/src/checkbox/checkbox.css';
import Icon from '../icon/Icon.jsx';
import Checkbox from '../checkbox/Checkbox.jsx';

/**
 * Table — DHCW Single Record Design System (React)
 *
 * Declarative wrapper over the shared `@dhcw/sr-web` table.css class contract.
 * Matched to the Figma Table sets: building blocks (1122:14469), composed
 * vertical layout (1363:22599).
 *
 * Columns describe the data; rows are plain objects. Selection and sorting are
 * *controlled* — this component renders state and reports intent, it does not
 * own either. That keeps it usable for server-side sorting and paging, where
 * the data does not live in the component.
 *
 * Columns:
 *   { key, header, numeric?, sortable?, width?, render?(row, index) }
 *
 * Selection (optional): pass `selectable` plus `selectedIds` and `onSelectionChange`.
 * `getRowId` defaults to `row.id`.
 *
 * Sorting (optional): pass `sort` ({ key, direction }) and `onSortChange`.
 * The component sets aria-sort on the active header and calls back with the
 * next direction; it never reorders `rows` itself.
 */
const Table = forwardRef(function Table(
  {
    columns = [],
    rows = [],
    caption,
    getRowId = (row) => row.id,
    // selection
    selectable = false,
    selectedIds,
    onSelectionChange,
    selectAllLabel = 'Select all rows',
    getRowLabel,
    // sorting
    sort,
    onSortChange,
    // presentation
    stickyHead = false,
    layout,
    rowActions,
    // Figma's default table layout is `kebab-left` (components/table/spec.md),
    // so row actions lead unless the caller asks for a trailing column.
    rowActionsPosition = 'leading',
    actionsLabel = 'Actions',
    className,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const selected = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);

  const allIds = rows.map(getRowId);
  const allSelected = rows.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = allIds.some((id) => selected.has(id)) && !allSelected;

  const emit = (next) => onSelectionChange && onSelectionChange(next);

  const toggleAll = () => emit(allSelected ? new Set() : new Set(allIds));

  const toggleRow = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    emit(next);
  };

  const nextDirection = (key) => {
    if (!sort || sort.key !== key) return 'ascending';
    return sort.direction === 'ascending' ? 'descending' : 'ascending';
  };

  const sortIconFor = (key) => {
    if (!sort || sort.key !== key) return 'nav/sort';
    return sort.direction === 'ascending' ? 'nav/chevron-up' : 'nav/chevron-down';
  };

  const tableClasses = [
    'sr-table',
    layout && `sr-table--${layout}`,
    stickyHead && 'sr-table--sticky-head',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const actionsTrailing = rowActionsPosition === 'trailing';

  const actionsHeader = rowActions ? (
    <th scope="col" className="sr-table__head--actions">
      <span className="sr-visually-hidden">{actionsLabel}</span>
    </th>
  ) : null;

  const actionsCell = (row, index) =>
    rowActions ? (
      <td
        className={['sr-table__actions', actionsTrailing && 'sr-table__actions--trailing']
          .filter(Boolean)
          .join(' ')}
      >
        {rowActions(row, index)}
      </td>
    ) : null;

  return (
    <div className="sr-table-wrap">
      <table ref={ref} className={tableClasses} {...rest}>
        {caption && <caption>{caption}</caption>}

        <thead className="sr-table__head">
          <tr>
            {selectable && (
              <th scope="col" className="sr-table__select">
                <Checkbox
                  className="sr-checkbox--bare"
                  aria-label={selectAllLabel}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </th>
            )}

            {!actionsTrailing && actionsHeader}

            {columns.map((col) => {
              const isSorted = sort && sort.key === col.key;
              const thClasses = [
                col.numeric && 'sr-table__head--numeric',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={thClasses || undefined}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={col.sortable ? (isSorted ? sort.direction : 'none') : undefined}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      className="sr-table__sort"
                      onClick={() => onSortChange({ key: col.key, direction: nextDirection(col.key) })}
                    >
                      <span>{col.header}</span>
                      <span className="sr-table__sort-icon">
                        <Icon name={sortIconFor(col.key)} size="xs" color="inherit" />
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}

            {actionsTrailing && actionsHeader}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const id = getRowId(row);
            const isSelected = selected.has(id);
            const rowClasses = ['sr-table__row', isSelected && 'sr-table__row--selected']
              .filter(Boolean)
              .join(' ');

            return (
              <tr key={id ?? index} className={rowClasses}>
                {selectable && (
                  <td className="sr-table__select">
                    <Checkbox
                      className="sr-checkbox--bare"
                      id={`sr-table-select-${reactId}-${id}`}
                      aria-label={getRowLabel ? getRowLabel(row) : `Select row ${index + 1}`}
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                    />
                  </td>
                )}

                {!actionsTrailing && actionsCell(row, index)}

                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={['sr-table__cell', col.numeric && 'sr-table__cell--numeric']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}

                {actionsTrailing && actionsCell(row, index)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default Table;
