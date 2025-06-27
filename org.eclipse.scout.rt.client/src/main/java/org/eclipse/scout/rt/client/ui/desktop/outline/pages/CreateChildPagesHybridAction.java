/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.client.ui.desktop.outline.pages;

import java.util.List;

import org.eclipse.scout.rt.client.ui.desktop.hybrid.AbstractHybridAction;
import org.eclipse.scout.rt.client.ui.desktop.hybrid.HybridActionContextElements;
import org.eclipse.scout.rt.client.ui.desktop.hybrid.HybridActionType;
import org.eclipse.scout.rt.client.ui.desktop.outline.IOutline;
import org.eclipse.scout.rt.client.ui.desktop.outline.pages.js.IJsPage;
import org.eclipse.scout.rt.platform.BEANS;

@HybridActionType(CreateChildPagesHybridAction.TYPE)
public class CreateChildPagesHybridAction extends AbstractHybridAction<CreateChildPagesHybridActionDo> {

  protected static final String TYPE = "CreateChildPages";

  // TODO CGU this should probably be called ReloadJsPageHybridAction, because it also removes the nodes.
  // TODO CGU maybe move implementation to loadChildrenImpl on JsPage
  // TODO CGU maybe OutlineAdapter should send load and nodesDeletedEvents instead of using hybrid actions
  @Override
  public void execute(CreateChildPagesHybridActionDo data) {
    System.out.println("|\n| " + getClass().getSimpleName() + "\n|");
    HybridActionContextElements resultContextElements = BEANS.get(HybridActionContextElements.class);
    try {
      IJsPage jsPage = getContextElement("page").getElement(IJsPage.class);
      IOutline outline = jsPage.getOutline();

      outline.createDisplayParentRunContext().run(() -> {
        List<IPage<?>> childPages = jsPage.createChildPages(data);

        // Insert nodes
        // FIXME bsh [hybrid-page]: how to properly create and attach child nodes?
        // +++ IMPLEMENTATION SIMILAR TO AbstractPageWithTable#loadChildrenImpl +++
        try {
          outline.setTreeChanging(true);
          jsPage.setChildrenLoaded(false);
          // TODO - make accessible: jsPage.fireBeforeDataLoaded();
          try {
            outline.removeAllChildNodes(jsPage);
            outline.addChildNodes(jsPage, childPages);
          }
          finally {
            // TODO - make accessible: jsPage.fireAfterDataLoaded();
          }
          jsPage.setChildrenLoaded(true);
          jsPage.setChildrenDirty(false);
        }
        finally {
          outline.setTreeChanging(false);
        }
      });
    }
    finally { // always signal the end of the action to the UI, even in the case of an error on the server
      fireHybridActionEndEvent(resultContextElements);
    }
  }
}
