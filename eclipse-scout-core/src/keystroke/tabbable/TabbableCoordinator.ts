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
  Action, Event, EventHandler, FocusLeftTabTargetKeyStroke, FocusOptions, FocusRightTabTargetKeyStroke, focusUtils, InitModelOf, KeyStrokeContext, PropertyChangeEvent, PropertyEventEmitter, PropertyEventMap, scout, scrollbars, Widget
} from '../..';

export class TabbableCoordinator extends PropertyEventEmitter {
  declare model: TabbableCoordinatorModel;
  declare eventMap: TabbableCoordinatorEventMap;
  declare self: TabbableCoordinator;

  items: TabbableItem[] = [];
  currentItem: TabbableItem;
  initialItemProvider: () => TabbableItem;
  protected _actionItemPropertyChangeHandler: EventHandler<PropertyChangeEvent>;
  protected _focusHandler: (event: JQuery.FocusEvent) => void;

  constructor() {
    super();
    this._actionItemPropertyChangeHandler = this._onActionItemPropertyChange.bind(this);
    this._focusHandler = this._onItemFocus.bind(this);
  }

  protected override _init(model: InitModelOf<this>) {
    super._init(model);
    this._setItems(this.items);
  }

  setItems(items: TabbableItem[]) {
    this.setProperty('items', items);
  }

  protected _setItems(items: TabbableItem[]) {
    for (const item of this.items) {
      if (item instanceof Action) {
        item.off('propertyChange', this._actionItemPropertyChangeHandler);
      }
    }
    this._setProperty('items', items);
    if (!this._includes$Item(this.currentItem?.$container)) {
      this.resetCurrentItem();
    }
    for (const item of this.items) {
      if (item instanceof Action) {
        item.on('propertyChange', this._actionItemPropertyChangeHandler);
      }
    }
  }

  protected _includes$Item($item: JQuery): boolean {
    if (!$item) {
      return false;
    }
    return this.items.some(item => item.$container?.[0] === $item[0]);
  }

  /**
   * Sets the current item to the given item which makes it tabbable so it can be focused.
   * The former current item won't be tabbable anymore.
   */
  setCurrentItem(currentItem: TabbableItem) {
    if (currentItem === this.currentItem) {
      return;
    }

    if (this.currentItem) {
      this.currentItem.setTabbable(false);
      this.currentItem.$container?.off('focus', this._focusHandler);
    }

    this.setProperty('currentItem', currentItem);
    if (currentItem) {
      currentItem.setTabbable(true);
      if (currentItem.$container) {
        currentItem.$container.on('focus', this._focusHandler);
      } else if (currentItem instanceof Widget) {
        currentItem.on('render', () => {
          currentItem.$container.on('focus', this._focusHandler);
        });
      }
    }
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
    let wasFocused = this.currentItem?.isFocused();
    this.setCurrentItem(this.initialItem);
    if (wasFocused) {
      // If former currentItem was focused, set the focus to the new one to keep it inside the container
      this.currentItem?.focus();
    }
  }

  protected _onItemFocus(event: JQuery.FocusEvent) {
    this.trigger('itemFocus', {item: this.currentItem});
  }

  protected _onActionItemPropertyChange(event: PropertyChangeEvent<any, Action>) {
    if (scout.isOneOf(event.propertyName, 'overflown', 'enabledComputed', 'visible', 'selected', 'hidden')) { // 'hidden' belongs to the EllipsisMenu
      if (!this.currentItem || event.source === this.currentItem && !this.currentItem.isTabTarget()) {
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
