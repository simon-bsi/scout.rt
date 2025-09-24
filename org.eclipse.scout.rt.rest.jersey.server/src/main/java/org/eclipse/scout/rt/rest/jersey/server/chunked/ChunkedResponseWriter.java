///*
// * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
// *
// * This program and the accompanying materials are made
// * available under the terms of the Eclipse Public License 2.0
// * which is available at https://www.eclipse.org/legal/epl-2.0/
// *
// * SPDX-License-Identifier: EPL-2.0
// */
//package org.eclipse.scout.rt.rest.jersey.server.chunked;
//
//import java.io.IOException;
//import java.io.OutputStream;
//import java.lang.reflect.Type;
//import java.lang.annotation.Annotation;
//
//import jakarta.ws.rs.WebApplicationException;
//import jakarta.ws.rs.core.MediaType;
//import jakarta.ws.rs.core.MultivaluedMap;
//import jakarta.ws.rs.ext.MessageBodyWriter;
//
//import org.eclipse.scout.rt.rest.chunked.IChunkedResponse;
//import org.glassfish.jersey.server.ChunkedOutput;
//
//public final class ChunkedResponseWriter implements MessageBodyWriter<IChunkedResponse<?>> {
//
//    @Override
//    public boolean isWriteable(final Class<?> type, final Type genericType, final Annotation[] annotations,
//                               final MediaType mediaType) {
//        return IChunkedResponse.class.isAssignableFrom(type);
//    }
//
//  @Override
//  public void writeTo(IChunkedResponse<?> iChunkedResponse, Class<?> type, Type genericType, Annotation[] annotations,
//      MediaType mediaType, MultivaluedMap<String, Object> httpHeaders, OutputStream entityStream) throws IOException, WebApplicationException {
//
//  }
//
////  @Override
////    public long getSize(final ChunkedOutput<?> chunkedOutput, final Class<?> type, final Type genericType,
////                        final Annotation[] annotations, final MediaType mediaType) {
////        return -1;
////    }
////
////    @Override
////    public void writeTo(final ChunkedOutput<?> chunkedOutput, final Class<?> type, final Type genericType,
////                        final Annotation[] annotations, final MediaType mediaType,
////                        final MultivaluedMap<String, Object> httpHeaders, final OutputStream entityStream)
////            throws IOException, WebApplicationException {
////        // do nothing.
////    }
//}
