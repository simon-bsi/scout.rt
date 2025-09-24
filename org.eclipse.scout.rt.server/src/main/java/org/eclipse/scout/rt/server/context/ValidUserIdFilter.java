/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.server.context;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;

import org.eclipse.scout.rt.platform.context.RunContext;
import org.eclipse.scout.rt.platform.util.StringUtility;
import org.eclipse.scout.rt.shared.user.Users;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Validates that a userId is provided via {@link Users#CURRENT}.
 * <p>
 * Precondition: must be invoked within a {@link RunContext} where the {@link Users#CURRENT} has been assigned.
 *
 * @see ServerRunContext#getUserId()
 */
public class ValidUserIdFilter implements Filter {

  private static final Logger LOG = LoggerFactory.getLogger(ValidUserIdFilter.class);

  @Override
  public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
    final HttpServletResponse resp = (HttpServletResponse) response;

    if (StringUtility.isNullOrEmpty(Users.CURRENT.get())) {
      LOG.error("Security: userId is null or empty", new SecurityException("access denied"));
      resp.sendError(HttpServletResponse.SC_FORBIDDEN);
    }
    else {
      chain.doFilter(request, response);
    }
  }
}
