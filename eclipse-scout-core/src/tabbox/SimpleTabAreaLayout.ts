/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {AbstractLayout, Dimension, graphics, PrefSizeOptions, scout, SimpleTabArea, SimpleTabOverflowMenu, styles, widgets} from '../index';
import $ from 'jquery';

export class SimpleTabAreaLayout extends AbstractLayout {
  tabArea: SimpleTabArea;
  tabWidth: number;
  tabMinWidth: number;
  overflowTabItemWidth: number;
  protected _overflowTab: SimpleTabOverflowMenu;
  protected _overflowTabsIndizes: number[];

  constructor(tabArea: SimpleTabArea) {
    super();
    this.tabArea = tabArea;
    this._overflowTabsIndizes = [];

    this.tabWidth = null;
    this.tabMinWidth = null;
    this.overflowTabItemWidth = null;
  }

  override layout($container: JQuery) {
    let htmlContainer = this.tabArea.htmlComp,
      containerSize = htmlContainer.size({
        exact: true
      }),
      $tabs = htmlContainer.$comp.children('.simple-tab'),
      numTabs = this.tabArea.getTabs().length,
      smallPrefSize = this.smallPrefSize();

    containerSize = containerSize.subtract(htmlContainer.insets());

    this._initSizes();

    // Reset tabs
    if (this._overflowTab) {
      this._overflowTab.destroy();
    }
    $tabs.setVisible(true);
    this._overflowTabsIndizes = [];
    widgets.updateFirstLastMarker(this.tabArea.getTabs());

    // All tabs fit in container -> no overflow menu necessary
    if (smallPrefSize.width <= containerSize.width) {
      $container.removeClass('overflown');
      this.tabArea._updateTabbableItems();
      return;
    }

    // Not all tabs fit in container -> put tabs into overflow menu
    $container.addClass('overflown');
    containerSize.width -= this.overflowTabItemWidth;

    // check how many tabs fit into remaining containerSize.width
    let numVisibleTabs = Math.floor(containerSize.width / this.tabMinWidth);

    let selectedIndex = 0;
    $tabs.each((i, tab) => {
      if ($(tab).hasClass('selected')) {
        selectedIndex = i;
      }
    });

    // determine visible range
    let rightEnd;
    let leftEnd = selectedIndex - Math.floor(numVisibleTabs / 2);
    if (leftEnd < 0) {
      leftEnd = 0;
      rightEnd = numVisibleTabs - 1;
    } else {
      rightEnd = leftEnd + numVisibleTabs - 1;
      if (rightEnd > numTabs - 1) {
        rightEnd = numTabs - 1;
        leftEnd = rightEnd - numVisibleTabs + 1;
      }
    }

    $tabs.each((i, tab) => {
      if (i < leftEnd || i > rightEnd) {
        $(tab).setVisible(false);
        this._overflowTabsIndizes.push(i);
      }
    });

    this._overflowTab = scout.create(SimpleTabOverflowMenu, {
      parent: this.tabArea,
      tooltipText: '${textKey:ui.MoreTabs}',
      overflowTabsIndizes: this._overflowTabsIndizes
    });
    this._overflowTab.render(htmlContainer.$comp);

    widgets.updateFirstLastMarker(this.tabArea.getVisibleTabs());
    this.tabArea._updateTabbableItems();
  }

  smallPrefSize(options: PrefSizeOptions & { minTabWidth?: number } = {}): Dimension {
    this._initSizes();
    options = $.extend({minTabWidth: this.tabMinWidth}, options);
    return this.preferredLayoutSize(this.tabArea.$container, options);
  }

  override preferredLayoutSize($container: JQuery, options?: PrefSizeOptions & { minTabWidth?: number }): Dimension {
    this._initSizes();
    let minTabWidth = scout.nvl(options.minTabWidth, 0) || scout.nvl(this.tabWidth, 0);
    let numTabs = this.tabArea.getTabs().length;
    let minWidth = numTabs * minTabWidth;
    options = $.extend({useCssSize: true}, options);
    let prefSize = graphics.prefSize(this.tabArea.$container, options);
    if (options.widthHint && this.tabArea.displayStyle === SimpleTabArea.DisplayStyle.SPREAD_EVEN) {
      minWidth = Math.max(options.widthHint, minWidth);
    }
    return new Dimension(minWidth, prefSize.height);
  }

  /**
   * Reads the default sizes from CSS -> the tabs need to specify a width and a min-width.
   * The layout expects all tabs to have the same width.
   */
  protected _initSizes() {
    if (this.tabWidth != null && this.tabMinWidth != null && this.overflowTabItemWidth != null) {
      return;
    }
    let $tab = this.tabArea.$container.children('.simple-tab').eq(0);
    if ($tab.length === 0) {
      return;
    }
    $tab = $tab.clone().addClass('selected'); // Non selected items have a margin, selected ones don't -> we need to get the width incl. margin
    let tabAreaClasses = this.tabArea.$container.attr('class');
    let tabItemClasses = $tab.attr('class');
    if (this.tabWidth === null) {
      this.tabWidth = styles.getSize([tabAreaClasses, tabItemClasses], 'width', 'width', 0);
    }
    if (this.tabMinWidth === null) {
      this.tabMinWidth = styles.getSize([tabAreaClasses, tabItemClasses], 'min-width', 'minWidth');
    }
    if (this.overflowTabItemWidth === null) {
      this.overflowTabItemWidth = styles.getSize([tabAreaClasses, 'simple-overflow-tab-item'], 'min-width', 'minWidth');
      this.overflowTabItemWidth += styles.getSize([tabAreaClasses, 'simple-overflow-tab-item'], 'margin-left', 'marginLeft');
      this.overflowTabItemWidth += styles.getSize([tabAreaClasses, 'simple-overflow-tab-item'], 'margin-right', 'marginRight');
    }
  }
}
