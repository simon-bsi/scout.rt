/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.security.csp;

import jakarta.annotation.PostConstruct;

public class FallbackContentSecurityPolicy extends ContentSecurityPolicy {
  @PostConstruct
  protected void initBlockAll() {
    withBaseUri("'none'");
    withDefaultSrc("'none'"); // covers all sources including 'plugin-types'
    withFormAction("'none'");
    withFrameAncestors("'none'");
    withReportTo(CSP_REPORT_URL); // see also ContentSecurityPolicyReportHandler
  }
}
