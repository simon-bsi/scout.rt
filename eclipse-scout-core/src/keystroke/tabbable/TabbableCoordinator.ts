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
  Action, arrays, Event, EventHandler, FocusLeftTabTargetKeyStroke, FocusOptions, FocusRightTabTargetKeyStroke, focusUtils, InitModelOf, KeyStrokeContext, PropertyChangeEvent, PropertyEventEmitter, PropertyEventMap, scout, scrollbars,
  SomeRequired,
  Widget
} from '../..';

export class TabbableCoordinator extends PropertyEventEmitter implements TabbableCoordinatorModel {
  declare initModel: SomeRequired<this['model'], 'parent'>;
  declare model: TabbableCoordinatorModel;
  declare eventMap: TabbableCoordinatorEventMap;
  declare self: TabbableCoordinator;

  parent: Widget;
  items: TabbableItem[] = [];
  currentItem: TabbableItem;
  focusedItem: TabbableItem;
  initialItemProvider: () => TabbableItem;
  protected _actionItemPropertyChangeHandler: EventHandler<PropertyChangeEvent>;
  protected _parentRenderHandler: EventHandler;

  constructor() {
    super();
    this._actionItemPropertyChangeHandler = this._onActionItemPropertyChange.bind(this);
    this._parentRenderHandler = this._onParentRender.bind(this);
  }

  protected override _init(model: InitModelOf<this>) {
    super._init(model);
    this._setItems(this.items);

    if (this.parent.rendered) {
      this._attachParentFocusInHandler();
    } else {
      this.parent.one('render', this._parentRenderHandler);
    }
    this.parent.one('destroy', () => this.destroy());
  }

  protected _onParentRender() {
    this._attachParentFocusInHandler();
  }

  destroy() {
    this.parent.off('render', this._parentRenderHandler);

    // The items may not belong to the widget that owns the tabbable coordinator and may therefore still be used after the widget itself is destroyed
    // -> ensure listeners are removed
    this.setItems([]);
  }

  setItems(items: TabbableItem[]) {
    this.setProperty('items', items);
  }

  protected _setItems(items: TabbableItem[]) {
    if (arrays.equals(this.items, items)) {
      return;
    }
    for (const item of this.items) {
      if (item instanceof Action) {
        item.off('propertyChange', this._actionItemPropertyChangeHandler);
      }
    }
    this._setProperty('items', items);
    if (!this.currentItem || !this.items.includes(this.currentItem) || !this.currentItem.isFocused()) {
      this.resetCurrentItem();
    }
    for (const item of this.items) {
      if (item !== this.currentItem) {
        item.setTabbable(false);
      }
      if (item instanceof Action) {
        item.on('propertyChange', this._actionItemPropertyChangeHandler);
      }
    }
  }

  /**
   * Sets the current item to the given item which makes it tabbable so it can be focused.
   * The former current item won't be tabbable anymore.
   */
  setCurrentItem(currentItem: TabbableItem): boolean {
    if (currentItem === this.currentItem) {
      return false;
    }

    currentItem?.setTabbable(true);

    let oldItem = this.currentItem;
    let wasFocused = oldItem && oldItem === this.focusedItem; // Cannot use isFocused() because item may be removed from DOM already

    this.setProperty('currentItem', currentItem);

    if (wasFocused) {
      // If former currentItem was focused, set the focus to the new one to keep it inside the container
      currentItem?.focus();
    }

    // Remove tabindex from old item _after_ the new current item gets it, otherwise the focus would be temporarily moved to the body if the old item was focused.
    oldItem?.setTabbable(false);

    return true;
  }

  get initialItem(): TabbableItem {
    let initialItem = this.initialItemProvider?.();
    if (initialItem?.isTabTarget()) {
      return initialItem;
    }
    return this.items.find(item => item.isTabTarget());
  }

  /**
   * Sets the current item to the {@link initialItem}.
   */
  resetCurrentItem() {
    this.setCurrentItem(this.initialItem);
  }

  protected _isResetItemNecessary(newItem: TabbableItem) {
    if (!this.currentItem) {
      return true;
    }
    if (newItem === this.currentItem && !this.currentItem.isTabTarget()) {
      // If a property changes on the currentItem and turns it into a non-tab target, a new currentItem needs to be set.
      return true;
    }
    if (newItem === this.initialItem && !this.currentItem?.isFocused()) {
      // If a property changes on the initialItem and turns it into a tab target, use it as new currentItem.
      // Don't do it if the currentItem is focused because it would be confusing if the focus changes suddenly.
      return true;
    }
    return false;
  }

  /**
   * @returns the {@link TabbableItem} that contains the given `$item`.
   */
  findItemFor($item: JQuery): TabbableItem {
    if (!$item) {
      return null;
    }
    return this.items.find(item => item.$container?.[0] === $item[0]);
  }

  protected _onCurrentItemFocus() {
    this.focusedItem = this.currentItem;
    this.trigger('itemFocus', {item: this.currentItem});
  }

  protected _attachParentFocusInHandler() {
    this.parent.$container.on('focusin', event => this._onParentFocusIn(event));
  }

  protected _onParentFocusIn(event: JQuery.FocusInEvent) {
    let target = event.target;
    if (target === this.currentItem?.$container?.[0]) {
      this._onCurrentItemFocus();
    }
  }

  protected _onActionItemPropertyChange(event: PropertyChangeEvent<any, Action>) {
    // Listen to properties which could potentially influence the result of item.isTabTarget()
    if (scout.isOneOf(event.propertyName, 'overflown', 'enabledComputed', 'visible', 'selected', 'hidden')) { // 'hidden' belongs to the EllipsisMenu
      if (this._isResetItemNecessary(event.source)) {
        this.resetCurrentItem();
      }
    }
  }

  registerKeyStrokes(target: Widget, keyStrokeContext?: KeyStrokeContext) {
    keyStrokeContext = scout.nvl(keyStrokeContext, target.keyStrokeContext);
    keyStrokeContext.registerKeyStrokes([
      new FocusLeftTabTargetKeyStroke(target, this),
      new FocusRightTabTargetKeyStroke(target, this)
    ]);
  }
}

export class TabbableItem {
  $container: JQuery;

  constructor($item: JQuery) {
    this.$container = $item;
  }

  setTabbable(tabbable: boolean) {
    this.$container.setTabbable(tabbable);
  }

  isTabTarget(): boolean {
    return this.$container.isVisible() && this.$container.isEnabled();
  }

  focus(options?: FocusOptions): void {
    this.$container[0].focus(options);
  }

  reveal() {
    scrollbars.reveal(this.$container);
  }

  isFocused(): boolean {
    return focusUtils.isActiveElement(this.$container);
  }
}

export interface TabbableCoordinatorModel {
  parent?: Widget;
  items?: TabbableItem[];
  initialItemProvider?: () => TabbableItem;
}

export interface ItemFocusEvent extends Event<TabbableCoordinator> {
  item: TabbableItem;
}

export interface TabbableCoordinatorEventMap extends PropertyEventMap {
  'itemFocus': ItemFocusEvent;
  'propertyChange:currentItem': PropertyChangeEvent<TabbableItem>;
  'propertyChange:items': PropertyChangeEvent<TabbableItem[]>;
}
