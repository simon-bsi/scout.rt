/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {DesktopTab, DesktopTabArea, keys, KeyStroke} from "../..";

export class DesktopTabExecKeyStroke extends KeyStroke {
  declare field: DesktopTab;

  constructor(tab: DesktopTab) {
    super();
    this.field = tab;
    this.which = [keys.SPACE, keys.ENTER];
    this.stopPropagation = true;
  }

  override handle(event: JQuery.KeyboardEventBase) {
    this.field.findParent(DesktopTabArea).selectTab(this.field);
  }
}
