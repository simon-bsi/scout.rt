/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.rest.client.chunked;

import jakarta.ws.rs.core.Response;

import org.eclipse.scout.rt.platform.BEANS;

public interface IChunkedData<T> {

  static <T> IChunkedData<T> of(Response response, Class<T> type) {
    //noinspection unchecked
    return BEANS.get(IChunkedDataReader.class).of(response, type);
  }

  T read();

  boolean isClosed();
}
