/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Action, InitModelOf, keys, KeyStrokeContext, scout, TabbableCoordinator, TabbableItem, Widget} from "../../../src";
import {JQueryTesting} from '../../../src/testing';

describe('TabbableCoordinator', () => {
  let session: SandboxSession;

  beforeEach(() => {
    setFixtures(sandbox());
    session = sandboxSession();
  });

  function createActions(): Action[] {
    let actions: Action[] = [];
    for (let i = 0; i < 3; i++) {
      actions.push(scout.create(Action, {parent: session.desktop, text: `Action ${i}`}));
    }
    return actions;
  }

  class ActionBar extends Widget {
    actions: Action[];
    tabbableCoordinator = scout.create(TabbableCoordinator, {parent: this});

    protected override _createKeyStrokeContext(): KeyStrokeContext {
      return new KeyStrokeContext();
    }

    protected override _init(model: InitModelOf<this>) {
      super._init(model);
      this.tabbableCoordinator.setItems(this.actions);
    }

    protected override _initKeyStrokeContext() {
      super._initKeyStrokeContext();
      this.tabbableCoordinator.registerKeyStrokes(this);
    }

    protected override _render() {
      this.$container = this.$parent.appendDiv();
      this.actions.forEach(action => action.render(this.$container));
    }
  }

  describe('currentItem', () => {
    it('is initially set to the first item that is a tab target', () => {
      let actions = createActions();
      actions[0].setEnabled(false);
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]);
    });

    it('is initially set to the item provided by initial item provider', () => {
      let actions = createActions();
      actions[0].setEnabled(false);
      let tabbableCoordinator = scout.create(TabbableCoordinator, {
        parent: session.desktop,
        initialItemProvider: () => actions[2]
      });
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[2]);
    });

    it('is initially set to the item provided by initial item provider but only if it is a tab target', () => {
      let actions = createActions();
      actions[0].setEnabled(false);
      actions[2].setEnabled(false);
      let tabbableCoordinator = scout.create(TabbableCoordinator, {
        parent: session.desktop,
        initialItemProvider: () => actions[2]
      });
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]);
    });

    it('is the only tabbable element', () => {
      let actions = createActions();
      actions[1].setTabbable(true); // Should be set to false when passed to the coordinator
      actions.forEach(action => action.render());

      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[0]);
      expect(actions[0].$container).toHaveAttr('tabindex', '0');
      expect(actions[1].$container).not.toHaveAttr('tabindex');
      expect(actions[2].$container).not.toHaveAttr('tabindex');

      tabbableCoordinator.setCurrentItem(actions[1]);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]);
      expect(actions[0].$container).not.toHaveAttr('tabindex');
      expect(actions[1].$container).toHaveAttr('tabindex', '0');
      expect(actions[2].$container).not.toHaveAttr('tabindex');

      tabbableCoordinator.setCurrentItem(null);
      expect(actions[0].$container).not.toHaveAttr('tabindex');
      expect(actions[1].$container).not.toHaveAttr('tabindex');
      expect(actions[2].$container).not.toHaveAttr('tabindex');

      actions.forEach(action => action.remove());
      tabbableCoordinator.setCurrentItem(actions[1]);
      expect(actions[0].tabbable).toBe(false);
      expect(actions[1].tabbable).toBe(true);
      expect(actions[0].tabbable).toBe(false);

      actions.forEach(action => action.render());
      expect(actions[0].$container).not.toHaveAttr('tabindex');
      expect(actions[1].$container).toHaveAttr('tabindex', '0');
      expect(actions[2].$container).not.toHaveAttr('tabindex');
    });

    it('is reset if a tab target relevant property change happens on the currentItem', () => {
      let actions = createActions();
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[0]);

      actions[0].setEnabled(false);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]);

      actions[1].setVisible(false);
      expect(tabbableCoordinator.currentItem).toBe(actions[2]);

      actions[2].setVisible(false);
      expect(tabbableCoordinator.currentItem).toBe(undefined); // There is no tab target anymore
    });

    it('is reset if the initial item turns into a tab target', () => {
      let actions = createActions();
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      actions[0].setEnabled(false);
      actions[2].setEnabled(false);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]);

      actions[2].setEnabled(true);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]); // Nothing happens, initial item not affected

      actions[0].setEnabled(true);
      expect(tabbableCoordinator.currentItem).toBe(actions[0]);
    });

    it('is set to the initial tab target on property change if no current item has been set yet', () => {
      let actions = createActions();
      actions.forEach(action => action.setEnabled(false));
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(undefined);

      actions[2].setEnabled(true);
      expect(tabbableCoordinator.currentItem).toBe(actions[2]);
    });

    it('is reset if items change', () => {
      let actions = createActions();
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[0]);

      tabbableCoordinator.setItems([actions[1], actions[2]]);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]);

      tabbableCoordinator.setItems([actions[1], actions[2]]);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]); // Still 1 because items did not change

      tabbableCoordinator.setItems([]);
      expect(tabbableCoordinator.currentItem).toBe(undefined);
    });

    it('is not reset if items change but current item is focused', () => {
      // Use case: focus is in a menu box which adds ellipsis menu dynamically while the user resizes the screen
      // This should not change current item because it is focused
      let actions = createActions();
      actions.forEach(action => action.render());
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems([actions[0], actions[1]]);
      expect(tabbableCoordinator.currentItem).toBe(actions[0]);

      tabbableCoordinator.setCurrentItem(actions[1]);
      actions[1].focus();
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[1]); // Don't change to action0 because action1 is focused
    });
  });

  describe('setCurrentItem', () => {
    it('focuses the new current item if it was focused before', () => {
      // Use case: if the currently focused item is removed or not a tab target anymore, the focus should stay in the tabbable group and not reset to another widget or event the body
      let actions = createActions();
      actions.forEach(action => action.render());
      let tabbableCoordinator = scout.create(TabbableCoordinator, {parent: session.desktop});
      tabbableCoordinator.setItems(actions);
      expect(tabbableCoordinator.currentItem).toBe(actions[0]);
      expect(actions[0].isFocused()).toBe(false);

      actions[0].focus();
      expect(actions[0].isFocused()).toBe(true);

      tabbableCoordinator.setCurrentItem(actions[1]);
      expect(actions[1].isFocused()).toBe(true);

      // Use case: a toggle menu that is not a tab target anymore if it is selected.
      // In this spec, enabled is used instead of selected.
      // property change calls resetCurrentItem
      actions[1].setEnabled(false);
      expect(actions[0].isFocused()).toBe(true);

      // The same should happen if the item is removed completely
      // Use case: focus is on ellipsis menu in menu box and ellipsis menu removed because user resizes the screen
      // setItems calls resetCurrentItem
      tabbableCoordinator.setCurrentItem(actions[2]);
      expect(actions[2].isFocused()).toBe(true);
      actions[2].remove();
      tabbableCoordinator.setItems([actions[0], actions[1]]);
      expect(actions[0].isFocused()).toBe(true);

      tabbableCoordinator.setCurrentItem(null);
      expect(actions[0].isFocused()).toBe(false);
    });
  });

  describe('left/right keystrokes', () => {

    it('change currentItem and focus', () => {
      let actionBar = scout.create(ActionBar, {parent: session.desktop, actions: createActions()});
      actionBar.render();
      session.focusManager.validateFocus();
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[0]);
      expect(actionBar.actions[0].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.RIGHT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[1]);
      expect(actionBar.actions[1].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.RIGHT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[2]);
      expect(actionBar.actions[2].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.RIGHT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[2]);
      expect(actionBar.actions[2].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.LEFT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[1]);
      expect(actionBar.actions[1].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.LEFT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[0]);
      expect(actionBar.actions[0].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.LEFT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[0]);
      expect(actionBar.actions[0].$container).toBeFocused();
    });

    it('consider tab targets', () => {
      let actionBar = scout.create(ActionBar, {parent: session.desktop, actions: createActions()});
      actionBar.render();
      session.focusManager.validateFocus();
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[0]);
      expect(actionBar.actions[0].$container).toBeFocused();

      actionBar.actions[1].setEnabled(false);
      JQueryTesting.triggerKeyDown(actionBar.$container, keys.RIGHT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[2]);
      expect(actionBar.actions[2].$container).toBeFocused();

      JQueryTesting.triggerKeyDown(actionBar.$container, keys.LEFT);
      expect(actionBar.tabbableCoordinator.currentItem).toBe(actionBar.actions[0]);
      expect(actionBar.actions[0].$container).toBeFocused();
    });
  });

  it('removes listeners if widget is destroyed', () => {
    let actions = createActions();
    let initialEventCount = actions[0].events.count();

    let actionBar = scout.create(ActionBar, {parent: session.desktop, actions: actions});
    expect(actions[0].events.count()).toBeGreaterThan(initialEventCount);

    actionBar.destroy();
    expect(actions[0].events.count()).toBe(initialEventCount);
  });
});
