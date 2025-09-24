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
//import java.util.Set;
//
//import org.eclipse.scout.rt.rest.RestApplication.IRestApplicationSingletonsContributor;
//import org.glassfish.jersey.server.ChunkedResponseWriter;
//
//public class ChunkedRestApplicationSingletonsContributor implements IRestApplicationSingletonsContributor {
//  @Override
//  public Set<Object> contribute() {
//    //return Set.of(ChunkedResponseWriter.class);
//    return Set.of(new ChunkedResponseWriter());
//  }
//}
