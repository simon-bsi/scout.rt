/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {KeyStroke, menus, ScoutKeyboardEvent, Widget} from '../index';

export class MenuNavigationKeyStroke extends KeyStroke {
  declare field: ContextMenuContainer;

  protected _menuItemClass: string;

  constructor(popup: ContextMenuContainer) {
    super();
    this.field = popup;
    this.inheritAccessibility = false;
  }

  protected override _accept(event: ScoutKeyboardEvent): boolean {
    let accepted = super._accept(event);
    if (!accepted || this.field.bodyAnimating) {
      return false;
    }
    return accepted;
  }

  protected _changeSelection($oldItem: JQuery, $newItem: JQuery) {
    if ($newItem.length === 0) {
      // do not change selection
      return;
    }
    $newItem.setSelected(true).focus();
    menus.updateAriaActiveDescendant(this.field.$container, this.field.$body || this.field.$container, this._menuItemClass, $newItem);
    if ($oldItem.length > 0) {
      $oldItem.setSelected(false);
    }
  }
}

export interface ContextMenuContainer extends Widget {
  $body?: JQuery;
  bodyAnimating?: boolean;
}
