/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.rest.chunked;

import java.io.IOException;

import jakarta.ws.rs.core.GenericType;

import org.eclipse.scout.rt.platform.BEANS;
import org.eclipse.scout.rt.platform.Bean;

@Bean
public interface IChunkedDataWriter<T> {

  static <T> IChunkedDataWriter<T> create(Class<T> clazz) {
    //noinspection unchecked
    return BEANS.get(IChunkedDataWriter.class).init(clazz);
  }

  IChunkedDataWriter<T> init(Class<T> clazz);

  GenericType<T> getResponse();

  void write(T chunk) throws IOException;

  void close() throws IOException;
}
