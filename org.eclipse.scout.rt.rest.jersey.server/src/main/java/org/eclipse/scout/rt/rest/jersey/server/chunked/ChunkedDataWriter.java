/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.rest.jersey.server.chunked;

import java.io.IOException;

import jakarta.ws.rs.core.GenericType;

import org.eclipse.scout.rt.rest.chunked.IChunkedDataWriter;
import org.glassfish.jersey.server.ChunkedOutput;

public class ChunkedDataWriter<T> implements IChunkedDataWriter<T> {
  ChunkedOutput<T> output;

  @Override
  public ChunkedDataWriter<T> init(Class<T> clazz) {
    output = new ChunkedOutput<T>(clazz, "\n\n");
    return this;
  }

  //  @Override
  //  public <T> IChunkedResponse<T> newResponse(Class<T> clazz) {
  //    return new IChunkedResponse<T>() {
  //
  //      final ChunkedOutput<T> output = new ChunkedOutput<T>(clazz, "\n\n");
  //
  //      @Override
  //      public void write(T chunk) throws IOException {
  //        output.write(chunk);
  //      }
  //
  //      @Override
  //      public void close() throws IOException {
  //        output.close();
  //      }
  //    };
  //  }

  //  @Override
  //  public Object newResponse(Class<T> clazz) {
  //    //return new ChunkedOutput<T>(clazz, "\n\n");
  //    return output;
  //  }

  @Override
  public GenericType<T> getResponse() {
    return output;
  }

  @Override
  public void write(T chunk) throws IOException {
    output.write(chunk);
  }

  @Override
  public void close() throws IOException {
    output.close();
  }
}
