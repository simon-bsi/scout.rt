/*
 * Copyright (c) 2010, 2023 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.ui.html.json.form.fields.browserfield;

import java.net.URI;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.eclipse.scout.rt.platform.BEANS;
import org.eclipse.scout.rt.platform.util.StringUtility;
import org.eclipse.scout.rt.platform.util.UriUtility;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicy;
import org.eclipse.scout.rt.security.csp.DefaultContentSecurityPolicy;
import org.eclipse.scout.rt.server.commons.servlet.HttpClientInfo;
import org.eclipse.scout.rt.server.commons.servlet.cache.IHttpResponseInterceptor;
import org.eclipse.scout.rt.ui.html.IUiSession;

public class BrowserFieldContentHttpResponseInterceptor implements IHttpResponseInterceptor {
  private static final long serialVersionUID = 1L;

  private final URI m_browserUri;

  public BrowserFieldContentHttpResponseInterceptor(IUiSession uiSession) {
    m_browserUri = uiSession.getClientSession().getBrowserURI();
  }

  @Override
  public void intercept(HttpServletRequest req, HttpServletResponse resp) {
    String cspToken = getContentSecurityPolicy(req).toToken();
    resp.setHeader(ContentSecurityPolicy.HTTP_HEADER, cspToken);
  }

  protected ContentSecurityPolicy getContentSecurityPolicy(HttpServletRequest req) {
    // TODO use custom property for BrowserField iframes?
    ContentSecurityPolicy csp = BEANS.get(DefaultContentSecurityPolicy.class);

    String baseUri = UriUtility.toBaseUri(m_browserUri);
    if (baseUri != null) {
      // Normally, the csp report url is relative. Because documents inside the browser field are
      // loaded from a "/dynamic/..." URL, the relative url has to be converted to an absolute url.
      csp.withReportTo(baseUri + ContentSecurityPolicy.CSP_REPORT_URL);

      // Bug in Chrome: CSP 'self' is not interpreted correctly in sandboxed iframes, see https://bugs.chromium.org/p/chromium/issues/detail?id=443444
      // Workaround: Add resolved URI to image and style CSP directive to allow loading of images and styles from same origin as nested iframe in browser field
      if (HttpClientInfo.get(req).isWebkit()) {
        if (StringUtility.containsString(csp.getDirectives().get(ContentSecurityPolicy.DIRECTIVE_IMG_SRC), "'self'")) {
          csp.appendImgSrc(baseUri);
        }
        if (StringUtility.containsString(csp.getDirectives().get(ContentSecurityPolicy.DIRECTIVE_STYLE_SRC), "'self'")) {
          csp.appendStyleSrc(baseUri);
        }
      }
    }

    return csp;
  }
}
