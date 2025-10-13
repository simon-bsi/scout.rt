/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {keys, KeyStroke, ScoutKeyboardEvent, TabbableCoordinator, Widget} from '../../index';

export class FocusRightTabTargetKeyStroke extends KeyStroke {
  tabbableCoordinator: TabbableCoordinator;

  constructor(widget: Widget, tabbableCoordinator: TabbableCoordinator) {
    super();
    this.field = widget;
    this.which = [keys.RIGHT];
    this.renderingHints.render = false;
    this.stopPropagation = true;
    this.keyStrokeMode = KeyStroke.Mode.DOWN;
    this.inheritAccessibility = false;
    this.repeatable = true;
    this.tabbableCoordinator = tabbableCoordinator;
  }

  protected override _accept(event: ScoutKeyboardEvent): boolean {
    return super._accept(event) && !!this.tabbableCoordinator;
  }

  override handle(event: JQuery.KeyboardEventBase) {
    let tabbableItems = this.tabbableCoordinator.items;
    let $focusedItem = this.field.$container.find(':focus');
    let focusNext = false;

    for (const item of tabbableItems) {
      if (focusNext && item.isTabTarget()) {
        this.tabbableCoordinator.setCurrentItem(item);
        item.focus();
        break;
      }
      if ($focusedItem[0] === item.$container?.[0]) {
        focusNext = true;
      }
    }
  }
}
