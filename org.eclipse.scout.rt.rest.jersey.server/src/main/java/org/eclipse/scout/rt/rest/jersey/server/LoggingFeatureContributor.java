/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.rest.jersey.server;

import java.util.Collections;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import jakarta.ws.rs.core.Feature;

import org.eclipse.scout.rt.rest.RestApplication.IRestApplicationSingletonsContributor;
import org.glassfish.jersey.logging.LoggingFeature;
import org.glassfish.jersey.logging.LoggingFeature.Verbosity;

public class LoggingFeatureContributor implements IRestApplicationSingletonsContributor {


  @Override
  public Set<Object> contribute() {
    Logger logger = Logger.getLogger(getClass().getName());
    Feature feature = new LoggingFeature(logger, Level.INFO, Verbosity.PAYLOAD_ANY, 1000 * 1000);
    return Collections.singleton(feature);
  }
}
