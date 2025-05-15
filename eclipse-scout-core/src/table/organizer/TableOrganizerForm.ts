/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {
  Action, arrays, Column, Event, Form, InitModelOf, MoveTableRowMenuHelper, scout, ShowInvisibleColumnsForm, Table, TableCompleteCellEditEvent, TableRow, TableRowModel, TableRowsCheckedEvent, TableRowsSelectedEvent, WidgetModel
} from '../../index';
import TableOrganizerFormModel, {ColumnsTable0, ProfilesTable, TableOrganizerFormWidgetMap} from './TableOrganizerFormModel';

export class TableOrganizerForm extends Form {
  declare widgetMap: TableOrganizerFormWidgetMap;
  table: Table;
  profilesTable: ProfilesTable;
  columnsTable: ColumnsTable0;
  keyColumn: Column<Column>;

  protected override _jsonModel(): WidgetModel {
    return TableOrganizerFormModel();
  }

  protected override _init(model: InitModelOf<this>) {
    super._init(model);
    this.table = this.findParent(Table);
    this.profilesTable = this.widget('ProfilesTable');
    this.columnsTable = this.widget('ColumnsTable');
    this.keyColumn = this.columnsTable.columnById('KeyColumn');

    this.widget('NewConfigMenu').on('action', event => this._addNewConfig());
    this.widget('DeleteConfigMenu').on('action', event => this._deleteConfigs());
    this.widget('RenameConfigMenu').on('action', event => this._renameConfig());
    this.profilesTable.on('rowsSelected', event => this._onProfilesTableRowsSelected(event));
    this.profilesTable.on('completeCellEdit', event => this._onProfilesTableCompleteCellEdit(event));

    this.widget('AddColumnMenu').on('action', event => this._onAddColumnMenuAction(event));
    this.widget('ModifyColumnMenu').on('action', event => this._onModifyColumnMenuAction(event));
    this.widget('RemoveColumnMenu').on('action', event => this._onRemoveColumnMenuAction(event));
    this.columnsTable.on('rowsChecked', event => this._onColumnsTableRowsChecked(event));
    this.columnsTable.on('rowsSelected', event => this._onColumnsTableRowsSelected(event));
    this._installColumnUpDownMenus();
  }

  protected override _load(): JQuery.Promise<any> {
    this._reloadProfilesTable();
    this._reloadColumnsTable();
    this._updateColumnMenus();
    return super._load();
  }

  protected _reloadProfilesTable() {
    const rows: TableRowModel[] = [{cells: [this.session.text('DefaultSettings'), true]}];
    this.profilesTable.replaceRows(rows);
  }

  protected _onProfilesTableRowsSelected(event: TableRowsSelectedEvent<ProfilesTable>) {
    this._updateProfileMenus();
  }

  protected _onProfilesTableCompleteCellEdit(event: TableCompleteCellEditEvent<ProfilesTable>) {
    event.cell.setEditable(false);
    this.profilesTable.updateRow(event.row);
  }

  protected _updateProfileMenus() {
    const defaultConfigSelected = this.profilesTable.columnById('DefaultConfigColumn').selectedCellValues().includes(true);
    this.widget('UpdateConfigMenu').setVisible(!defaultConfigSelected);
    this.widget('DeleteConfigMenu').setVisible(!defaultConfigSelected);
    this.widget('RenameConfigMenu').setVisible(!defaultConfigSelected);
  }

  protected _addNewConfig() {
    let row = scout.create(TableRow, {parent: this.profilesTable});
    this.profilesTable.columnById('ConfigNameColumn').setCellValue(row, this._newConfigName());
    this.profilesTable.columnById('DefaultConfigColumn').setCellValue(row, false);
    this.profilesTable.insertRow(row);
    this._renameConfig(row);
  }

  protected _newConfigName(): string {
    let profileNo = 1;
    const baseName = this.session.text('New');
    this.profilesTable.rows.map(row => this.profilesTable.columnById('ConfigNameColumn').cellValue(row));
    const profiles = this.profilesTable.columnById('ConfigNameColumn').cellValues();
    while (profiles.includes(`${baseName} ${profileNo}`)) {
      ++profileNo;
    }
    return `${baseName} ${profileNo}`;
  }

  protected _renameConfig(row?: TableRow) {
    row = scout.nvl(row, this.profilesTable.selectedRow());
    let column = this.profilesTable.columnById('ConfigNameColumn');
    column.cell(row).setEditable(true);
    this.profilesTable.updateRow(row);
    this.profilesTable.focusCell(column, row);
  }

  protected _deleteConfigs(rows?: TableRow[]) {
    rows = scout.nvl(rows, this.profilesTable.selectedRows);
    this.profilesTable.deleteRows(rows);
  }

  protected _reloadColumnsTable() {
    let columns = this.columnsTable.checkableColumn ? this.table.displayableColumns(false) : this.table.visibleColumns(false);
    const rows = columns.map(column => {
      return {
        cells: [
          column,
          ShowInvisibleColumnsForm.createColumnTitleCell(column)
        ],
        checked: column.visible,
        enabled: this.columnsTable.checkableColumn ? !column.fixedPosition : true
      } as TableRowModel;
    });
    this.columnsTable.replaceRows(rows);
  }

  protected _updateColumnMenus() {
    let columnRemovable = false;
    let columnModifiable = false;
    let columnMovableToLeft = false;
    let columnMovableToRight = false;
    let considerColumnVisibility = !this.columnsTable.checkable;
    for (const column of this.keyColumn.selectedCellValues()) {
      if (this.table.organizer.isColumnModifiable(column)) {
        columnModifiable = true;
      }
      if (this._isColumnRemovable(column)) {
        columnRemovable = true;
      }
      if (this.table.organizer.isColumnMovableToLeft(column)) {
        columnMovableToLeft = true;
      }
      if (this.table.organizer.isColumnMovableToRight(column)) {
        columnMovableToRight = true;
      }
    }
    // Add and remove menus are either used to add / remove custom columns or to show / hide invisible columns
    // If table is checkable, these menus are only used for custom columns
    let customizable = this.table.isCustomizable();
    this.widget('AddColumnMenu').setVisible(considerColumnVisibility || (customizable && this.table.columnAddable));
    this.widget('AddColumnMenu').setEnabled(this.table.organizer.isColumnAddable(null, considerColumnVisibility));
    this.widget('ModifyColumnMenu').setVisible(columnModifiable);
    this.widget('ModifyColumnMenu').setEnabled(columnModifiable);
    this.widget('RemoveColumnMenu').setVisible(considerColumnVisibility || customizable);
    this.widget('RemoveColumnMenu').setEnabled(columnRemovable);
    this.widget('MoveColumnUpMenu').setEnabled(columnMovableToLeft);
    this.widget('MoveColumnDownMenu').setEnabled(columnMovableToRight);
  }

  protected _isColumnRemovable(column: Column<any>) {
    let considerColumnVisibility = !this.columnsTable.checkable;
    return this.table.organizer.isColumnRemovable(column, considerColumnVisibility, true);
  }

  protected async _onAddColumnMenuAction(event: Event<Action>): Promise<void> {
    let previousColumns = this.table.visibleColumns();

    await this.table.organizer.addColumn(arrays.last(this.keyColumn.selectedCellValues()));
    this._reloadColumnsTable();

    // Select inserted columns
    let insertedColumns = arrays.diff(this.table.visibleColumns(), previousColumns);
    this.columnsTable.selectRows(this.columnsTable.rows.filter(row => insertedColumns.includes(this.keyColumn.cellValue(row))));
    this.columnsTable.focus();
  }

  protected _onModifyColumnMenuAction(event: Event<Action>) {
    this.table.organizer.modifyColumn(this.keyColumn.selectedCellValue());
  }

  protected _onRemoveColumnMenuAction(event: Event<Action>) {
    this.table.organizer.removeColumns(this.keyColumn.selectedCellValues().filter(column => this._isColumnRemovable(column)));
    this._reloadColumnsTable();
  }

  protected _onColumnsTableRowsChecked(event: TableRowsCheckedEvent) {
    let checkedColumns = [];
    let uncheckedColumns = [];
    for (const row of event.rows) {
      const column = this.keyColumn.cellValue(row);
      if (row.checked) {
        checkedColumns.push(column);
      } else {
        uncheckedColumns.push(column);
      }
    }
    this.table.organizer.showColumns(checkedColumns);
    this.table.organizer.hideColumns(uncheckedColumns);
    this._updateColumnMenus();
  }

  protected _onColumnsTableRowsSelected(event: TableRowsSelectedEvent) {
    this._updateColumnMenus();
  }

  protected _installColumnUpDownMenus() {
    const moveRowUpMenu = this.widget('MoveColumnUpMenu');
    const moveRowDownMenu = this.widget('MoveColumnDownMenu');
    let moveRowHelper = scout.create(MoveTableRowMenuHelper);
    moveRowHelper.install({
      table: this.columnsTable,
      moveRowUpMenu,
      moveRowDownMenu,
      selectedRowsFilter: (row, direction) => {
        let column = this.keyColumn.cellValue(row);
        if (direction === 'up') {
          return this.table.organizer.isColumnMovableToLeft(column);
        }
        return this.table.organizer.isColumnMovableToRight(column);
      }
    });
    this.columnsTable.on('rowOrderChanged', event => {
      let newVisibleColumns = this.columnsTable.checkable ? this.keyColumn.checkedCellValues() : this.keyColumn.cellValues();
      this.table.organizer.moveColumns(newVisibleColumns);
      this._updateColumnMenus();
    });
  }
}
