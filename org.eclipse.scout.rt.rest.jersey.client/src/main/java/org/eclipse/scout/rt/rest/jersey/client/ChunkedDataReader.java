/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.rest.jersey.client;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import jakarta.ws.rs.core.GenericType;
import jakarta.ws.rs.core.Response;

import org.eclipse.scout.rt.rest.client.chunked.IChunkedData;
import org.eclipse.scout.rt.rest.client.chunked.IChunkedDataReader;
import org.glassfish.jersey.client.ChunkParser;
import org.glassfish.jersey.client.ChunkedInput;

public class ChunkedDataReader<T> implements IChunkedDataReader<T> {

  @Override
  public IChunkedData<T> of(Response response, Class<T> type) {
    ChunkedInput<T> chunkedInput = response.readEntity(new GenericType<ChunkedInput<T>>(new ParameterizedType() {
      @Override
      public Type[] getActualTypeArguments() {
        return new Type[] {type};
      }

      @Override
      public Type getRawType() {
        return ChunkedInput.class;
      }

      @Override
      public Type getOwnerType() {
        return null;
      }
    }) {
    });

    ChunkParser p = ChunkedInput.createParser("\n\n");
    chunkedInput.setParser(p);

    return new IChunkedData<T>() {
      @Override
      public T read() {
        return chunkedInput.read();
      }

      @Override
      public boolean isClosed() {
        return chunkedInput.isClosed();
      }
    };
  }
}
