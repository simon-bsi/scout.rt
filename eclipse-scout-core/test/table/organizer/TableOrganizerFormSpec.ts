/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {TableSpecHelper} from '../../../src/testing';
import {scout, Table, TableOrganizerForm, TableOrganizerMenu} from '../../../src';

describe('TableOrganizerForm', () => {
  let session: SandboxSession;
  let helper: TableSpecHelper;

  beforeEach(() => {
    setFixtures(sandbox());
    session = sandboxSession();
    helper = new TableSpecHelper(session);
  });

  afterEach(() => {
    session = null;
  });

  function createTable(numColumns: number) {
    let table = helper.createTable(helper.createModelFixture(numColumns));
    let menu = scout.create(TableOrganizerMenu, {parent: table});
    table.insertMenus([menu]);
    return table;
  }

  async function openOrganizerForm(table: Table, checkable = true): Promise<TableOrganizerForm> {
    let menu = table.menus[0] as TableOrganizerMenu;
    menu.setSelected(true);
    await menu.form.when('load');
    if (!checkable) {
      menu.form.columnsTable.setCheckable(false);
      await menu.form.load();
    }
    return menu.form;
  }

  describe('columns table', () => {
    it('shows rows for each column', async () => {
      let table = createTable(3);
      let form = await openOrganizerForm(table);
      expect(form.columnsTable.columnById('KeyColumn').cellValues()).toEqual(table.columns);
      expect(form.columnsTable.columnById('TitleColumn').cellValues()).toEqual(table.columns.map(column => column.text));
    });

    it('does not show guiOnly columns', async () => {
      let table = createTable(1);
      table.setCheckable(true);
      table.setRowIconVisible(true);
      let form = await openOrganizerForm(table);
      expect(form.columnsTable.columnById('KeyColumn').cellValues()).toEqual([table.columns[2]]);
      expect(form.columnsTable.columnById('TitleColumn').cellValues()).toEqual([table.columns[2].text]);
    });

    it('checks visible columns if table is checkable', async () => {
      let table = createTable(3);
      table.columns[0].setDisplayable(false); // Not displayed at all
      table.columns[1].setVisible(false);
      let form = await openOrganizerForm(table);
      expect(form.columnsTable.columnById('KeyColumn').cellValues()).toEqual([table.columns[1], table.columns[2]]);
      expect(form.columnsTable.rows[0].checked).toBe(false);
      expect(form.columnsTable.rows[1].checked).toBe(true);
    });

    it('disables rows with fixed position if table is checkable', async () => {
      let table = createTable(3);
      table.columns[0].setFixedPosition(true);
      let form = await openOrganizerForm(table);

      let columnsTable = form.columnsTable;
      expect(columnsTable.rows[0].enabled).toBe(false);
      expect(columnsTable.rows[1].enabled).toBe(true);
      expect(columnsTable.rows[0].checked).toBe(true);
      expect(columnsTable.rows[1].checked).toBe(true);

      columnsTable.uncheckRows([columnsTable.rows[0], columnsTable.rows[1]]);
      expect(columnsTable.rows[0].enabled).toBe(false);
      expect(columnsTable.rows[1].enabled).toBe(true);
      expect(columnsTable.rows[0].checked).toBe(true);
      expect(columnsTable.rows[1].checked).toBe(false);
    });

    it('only adds visible columns if table is not checkable', async () => {
      let table = createTable(3);
      table.columns[0].setDisplayable(false); // Not displayed at all
      table.columns[1].setVisible(false);
      let form = await openOrganizerForm(table, false);
      expect(form.columnsTable.columnById('KeyColumn').cellValues()).toEqual([table.columns[2]]);
    });

    it('uses tooltipText if text is empty', async () => {
      let table = createTable(3);
      table.columns[0].setText(null);
      table.columns[0].setHeaderTooltipText('tooltip');
      let form = await openOrganizerForm(table, false);
      expect(form.columnsTable.columnById('TitleColumn').cellValues()[0]).toBe('tooltip');
    });
  });

  describe('move menus', () => {
    it('are not enabled when column on top or bottom is fixed', async () => {
      let table = createTable(7);
      table.columns[1].setFixedPosition(true);
      table.columns[5].setFixedPosition(true);

      let form = await openOrganizerForm(table);
      let columnsTable = form.columnsTable;
      let moveUpMenu = form.widget('MoveColumnUpMenu');
      let moveDownMenu = form.widget('MoveColumnDownMenu');

      // column before is fixed
      columnsTable.selectRow(columnsTable.rows[2]);
      expect(moveUpMenu.enabledComputed).toBe(false);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // column after is fixed
      columnsTable.selectRow(columnsTable.rows[4]);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(false);

      // no column before, column after is fixed
      columnsTable.selectRow(columnsTable.rows[0]);
      expect(moveUpMenu.enabledComputed).toBe(false);
      expect(moveDownMenu.enabledComputed).toBe(false);

      // no column after, column before is fixed
      columnsTable.selectRow(columnsTable.rows[6]);
      expect(moveUpMenu.enabledComputed).toBe(false);
      expect(moveDownMenu.enabledComputed).toBe(false);

      // neither before nor after is fixed
      columnsTable.selectRow(columnsTable.rows[3]);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // move up, now column before is fixed
      moveUpMenu.doAction();
      expect(moveUpMenu.enabledComputed).toBe(false);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // move down, neither is fixed
      moveDownMenu.doAction();
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // move down, now column after is fixed
      moveDownMenu.doAction();
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(false);
    });

    it('are not enabled when column not visible', async () => {
      // Reason: table.moveColumn only supports visible columns. It is the same behavior as for Scout Classic.
      let table = createTable(5);
      table.columns[2].setVisible(false);

      let form = await openOrganizerForm(table);
      let columnsTable = form.columnsTable;
      let moveUpMenu = form.widget('MoveColumnUpMenu');
      let moveDownMenu = form.widget('MoveColumnDownMenu');
      let column1 = table.columns[1];
      let column2 = table.columns[2];
      let column3 = table.columns[3];
      let column4 = table.columns[4];

      // column is invisible
      columnsTable.selectRow(columnsTable.rows[2]);
      expect(moveUpMenu.enabledComputed).toBe(false);
      expect(moveDownMenu.enabledComputed).toBe(false);

      // column2 is invisible but column3 is not
      columnsTable.selectRows([columnsTable.rows[2], columnsTable.rows[3]]);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // invisible column stays, other one is moved down
      moveDownMenu.doAction();
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[2])).toBe(column2);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[3])).toBe(column4);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[4])).toBe(column3);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(false);

      // Move up again
      moveUpMenu.doAction();
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[2])).toBe(column2);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[3])).toBe(column3);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[4])).toBe(column4);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // Move up one more, column will be moved before invisible column
      moveUpMenu.doAction();
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[2])).toBe(column3);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[3])).toBe(column2);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(true);

      // Move up one more, invisible column stays
      moveUpMenu.doAction();
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[1])).toBe(column3);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[2])).toBe(column1);
      expect(columnsTable.columnById('KeyColumn').cellValue(columnsTable.rows[3])).toBe(column2);
      expect(moveUpMenu.enabledComputed).toBe(true);
      expect(moveDownMenu.enabledComputed).toBe(true);
    });
  });

  describe('add / remove menus', () => {
    describe('with checkable columns table', () => {
      it('are visible if table is customizable and columnAddable is true', async () => {
        let table = createTable(3);
        let spy = spyOn(table, 'isCustomizable');
        spy.and.returnValue(true);
        let form = await openOrganizerForm(table);
        let addColumnMenu = form.widget('AddColumnMenu');
        let removeColumnMenu = form.widget('RemoveColumnMenu');
        expect(addColumnMenu.visible).toBe(true);
        expect(removeColumnMenu.visible).toBe(true);

        // invisible if not customizable
        spy.and.returnValue(false);
        await form.load();
        expect(addColumnMenu.visible).toBe(false);
        expect(removeColumnMenu.visible).toBe(false);

        spy.and.returnValue(true);
        await form.load();
        expect(addColumnMenu.visible).toBe(true);
        expect(removeColumnMenu.visible).toBe(true);

        // add menu is invisible if columnAddable is false
        table.columnAddable = false;
        await form.load();
        expect(addColumnMenu.visible).toBe(false);
        expect(removeColumnMenu.visible).toBe(true);
      });
    });

    describe('with non-checkable columns table', () => {
      it('are always visible', async () => {
        let table = createTable(3);
        let spy = spyOn(table, 'isCustomizable');
        spy.and.returnValue(true);
        let form = await openOrganizerForm(table, false);
        let addColumnMenu = form.widget('AddColumnMenu');
        let removeColumnMenu = form.widget('RemoveColumnMenu');
        expect(addColumnMenu.visible).toBe(true);
        expect(removeColumnMenu.visible).toBe(true);

        spy.and.returnValue(false);
        await form.load();
        expect(addColumnMenu.visible).toBe(true);
        expect(removeColumnMenu.visible).toBe(true);

        table.columnAddable = false;
        await form.load();
        expect(addColumnMenu.visible).toBe(true);
        expect(removeColumnMenu.visible).toBe(true);
      });

      it('are enabled depending on the visible columns', async () => {
        let table = createTable(2);
        let spy = spyOn(table, 'isCustomizable');
        // not customizable
        spy.and.returnValue(false);
        let form = await openOrganizerForm(table, false);
        let addColumnMenu = form.widget('AddColumnMenu');
        let removeColumnMenu = form.widget('RemoveColumnMenu');
        let columnsTable = form.columnsTable;

        // all columns visible, none selected
        expect(addColumnMenu.enabledComputed).toBe(false);
        expect(removeColumnMenu.enabledComputed).toBe(false);

        // one row selected
        columnsTable.selectRow(columnsTable.rows[0]);
        expect(addColumnMenu.enabledComputed).toBe(false);
        expect(removeColumnMenu.enabledComputed).toBe(true);

        // one column invisible
        table.columns[0].setVisible(false);
        await form.load();
        columnsTable.selectRow(columnsTable.rows[0]);
        expect(addColumnMenu.enabledComputed).toBe(true);
        expect(removeColumnMenu.enabledComputed).toBe(true);

        // all columns invisible
        table.columns[1].setVisible(false);
        await form.load();
        expect(columnsTable.rows.length).toBe(0);
        expect(addColumnMenu.enabledComputed).toBe(true);
        expect(removeColumnMenu.enabledComputed).toBe(false);
      });
    });
  });

  describe('remove menu', () => {

    it('does not remove fixedPosition columns', async () => {
      let table = createTable(3);
      table.columns[0].setFixedPosition(true);
      let spy = spyOn(table, 'isCustomizable');
      // not customizable
      spy.and.returnValue(false);
      let form = await openOrganizerForm(table, false);
      let removeColumnMenu = form.widget('RemoveColumnMenu');
      let columnsTable = form.columnsTable;

      columnsTable.selectRows(columnsTable.rows[0]);
      expect(removeColumnMenu.enabledComputed).toBe(false);

      columnsTable.selectRows([columnsTable.rows[0], columnsTable.rows[1]]);
      expect(removeColumnMenu.enabledComputed).toBe(true);

      // fixed column stays, second column was removed
      removeColumnMenu.doAction();
      expect(columnsTable.columnById('KeyColumn').cellValues()).toEqual([table.columns[0], table.columns[2]]);
    });
  });
});
