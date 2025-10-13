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

import java.util.Map;

import jakarta.annotation.PostConstruct;

import org.eclipse.scout.rt.platform.config.CONFIG;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicyConfigProperties.CspDirectiveProperty;

/**
 * Use the 'scout.cspDirective' config property to configure individual CSP directives in the Scout application.
 */
public class DefaultContentSecurityPolicy extends ContentSecurityPolicy {

  /**
   * Default rules for content security policy (CSP):
   * <ul>
   * <li><b>default-src 'none'</b><br>
   * Disable fallback handling, directives should be set explicitly.</li>
   * <li><b>base-uri 'self' child-src 'self' font-src 'self' form-action 'self' manifest-src 'self' media-src 'self' object-src 'self' script-src 'self' worker-src 'self' connect-src 'self' img-src 'self'</b><br>
   * Only accept resources from the same origin.</li>
   * <li><b>style-src 'self' 'unsafe-inline'</b><br>
   * Without inline styling many widgets would not work as expected.</li>
   * <li><b>frame-src *</b><br>
   * Everything is allowed because the iframes created by the browser field run in the sandbox mode and therefore handle the security policy by their own.</li>
   * <li><b>report-uri {@link #CSP_REPORT_URL}</b><br>
   * Report CSP violations to server, see ContentSecurityPolicyReportHandler</li>
   * </ul>
   */
  @PostConstruct
  @SuppressWarnings("deprecation")
  protected void initFromConfig() {
    // fetch directives
    withChildSrc(getConfiguredDefault(DIRECTIVE_CHILD_SRC, "'self'"));
    withConnectSrc(getConfiguredDefault(DIRECTIVE_CONNECT_SRC, "'self'"));
    withDefaultSrc(getConfiguredDefault(DIRECTIVE_DEFAULT_SRC, "'none'"));
    withFontSrc(getConfiguredDefault(DIRECTIVE_FONT_SRC, "'self'"));
    withFrameSrc(getConfiguredDefault(DIRECTIVE_FRAME_SRC, "*"));
    withImgSrc(getConfiguredDefault(DIRECTIVE_IMG_SRC, "'self'"));
    withManifestSrc(getConfiguredDefault(DIRECTIVE_MANIFEST_SRC, "'self'"));
    withMediaSrc(getConfiguredDefault(DIRECTIVE_MEDIA_SRC, "'self'"));
    withObjectSrc(getConfiguredDefault(DIRECTIVE_OBJECT_SRC, "'self'"));
    withScriptSrc(getConfiguredDefault(DIRECTIVE_SCRIPT_SRC, "'self'"));
    withStyleSrc(getConfiguredDefault(DIRECTIVE_STYLE_SRC, "'self' 'unsafe-inline'"));
    withWorkerSrc(getConfiguredDefault(DIRECTIVE_WORKER_SRC, "'self'"));

    // document directives
    withBaseUri(getConfiguredDefault(DIRECTIVE_BASE_URI, "'self'"));
    withSandbox(getConfiguredDefault(DIRECTIVE_SANDBOX, null /* not configured by default */));

    // navigation directives
    withFormAction(getConfiguredDefault(DIRECTIVE_FORM_ACTION, "'self'"));
    withFrameAncestors(getConfiguredDefault(DIRECTIVE_FRAME_ANCESTORS, null /* not configured by default */));

    // reporting directives
    withReportTo(getConfiguredDefault(DIRECTIVE_REPORT_TO, CSP_REPORT_URL)); // see also ContentSecurityPolicyReportHandler
    appendReportTo(getConfiguredDefault(DIRECTIVE_REPORT_URI, null)); // append legacy if configured in older config.properties
  }

  protected String getConfiguredDefault(String directiveKey, String fallbackValue) {
    Map<String, String> mapProperty = CONFIG.getPropertyValue(CspDirectiveProperty.class);
    if (mapProperty == null) {
      return fallbackValue;
    }
    String configValue = mapProperty.get(lower(directiveKey));
    if (configValue == null) {
      return fallbackValue;
    }
    return configValue;
  }
}
