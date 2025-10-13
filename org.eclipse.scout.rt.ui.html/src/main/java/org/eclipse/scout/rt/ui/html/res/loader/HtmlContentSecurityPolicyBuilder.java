/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.ui.html.res.loader;

import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

import org.eclipse.scout.rt.platform.BEANS;
import org.eclipse.scout.rt.platform.Bean;
import org.eclipse.scout.rt.platform.util.CollectionUtility;
import org.eclipse.scout.rt.platform.util.StringUtility;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicy;
import org.eclipse.scout.rt.security.csp.DefaultContentSecurityPolicy;

// TODO: merge class with ContentSecurityPolicy?
@Bean
public class HtmlContentSecurityPolicyBuilder {

  public void applyCsp(String pathInfo, HtmlDocumentParser parser, HttpServletResponse response) {
    if (!BEANS.get(ContentSecurityPolicy.class).isEnabled(pathInfo)) {
      return;
    }
    response.setHeader(ContentSecurityPolicy.HTTP_HEADER, buildToken(parser));
  }

  public String buildToken(HtmlDocumentParser parser) {
    return build(parser).toToken();
  }

  public ContentSecurityPolicy build(HtmlDocumentParser parser) {
    ContentSecurityPolicy csp = BEANS.get(DefaultContentSecurityPolicy.class); // includes config.properties values
    configureCsp(parser, csp);
    return csp;
  }

  protected void configureCsp(HtmlDocumentParser parser, ContentSecurityPolicy csp) {
    addScriptHashes(parser, csp);
  }

  protected void addScriptHashes(HtmlDocumentParser parser, ContentSecurityPolicy csp) {
    List<String> nonces = parser.getUsedNonces();
    if (CollectionUtility.hasElements(nonces)) {
      appendScriptNonces(nonces, csp);
      removeSelf(csp, ContentSecurityPolicy.DIRECTIVE_SCRIPT_SRC);
    }
  }

  protected void removeSelf(ContentSecurityPolicy csp, String directive) {
    String expressions = csp.getDirectives().getOrDefault(directive, "");
    expressions = StringUtility.replace(expressions, "'self'", "").strip();
    csp.putOrRemove(directive, expressions);
  }

  protected void appendScriptNonces(List<String> scriptHashes, ContentSecurityPolicy csp) {
    scriptHashes.stream().map(s -> "'nonce-" + s + "'")
        .forEach(csp::appendScriptSrc);
  }
}
