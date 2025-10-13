/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.rest.csp;

import java.io.IOException;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;

import org.eclipse.scout.rt.platform.BEANS;
import org.eclipse.scout.rt.platform.util.StringUtility;
import org.eclipse.scout.rt.rest.container.IRestContainerResponseFilter;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicy;
import org.eclipse.scout.rt.security.csp.FallbackContentSecurityPolicy;

public class CspRestContainerFilter implements IRestContainerResponseFilter {
  @Override
  public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
    String csp = BEANS.get(FallbackContentSecurityPolicy.class).toToken();
    String header = responseContext.getHeaderString(ContentSecurityPolicy.HTTP_HEADER);
    if (!StringUtility.hasText(header)) {
      // append defaults CSP header (in case a REST response is text/html which might be interpreted by the Browser)
      responseContext.getHeaders().putSingle(ContentSecurityPolicy.HTTP_HEADER, csp);
    }
  }
}
