/*
 * Copyright (c) 2010, 2025 BSI Business Systems Integration AG
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.scout.rt.security.csp;

import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.eclipse.scout.rt.platform.BEANS;
import org.eclipse.scout.rt.platform.config.AbstractBooleanConfigProperty;
import org.eclipse.scout.rt.platform.config.AbstractConfigProperty;
import org.eclipse.scout.rt.platform.config.AbstractMapConfigProperty;
import org.eclipse.scout.rt.platform.config.ConfigUtility;

public final class ContentSecurityPolicyConfigProperties {

  private ContentSecurityPolicyConfigProperties() {
  }

  public static class CspEnabledProperty extends AbstractBooleanConfigProperty {

    @Override
    public Boolean getDefaultValue() {
      return true;
    }

    @Override
    public String description() {
      return String.format("Enable or disable Content Security Policy (CSP) headers. The headers can be modified by replacing the bean '%s' or using the property '%s'.",
          ContentSecurityPolicy.class.getName(), BEANS.get(CspDirectiveProperty.class).getKey());
    }

    @Override
    public String getKey() {
      return "scout.cspEnabled";
    }
  }

  public static class CspDirectiveProperty extends AbstractMapConfigProperty {

    @Override
    public String getKey() {
      return "scout.cspDirective";
    }

    @Override
    @SuppressWarnings("findbugs:VA_FORMAT_STRING_USES_NEWLINE")
    public String description() {
      return String.format("Configures individual Content Security Policy (CSP) directives.\n"
              + "See https://www.w3.org/TR/CSP2/ and the Bean '%s' for more details.\n"
              + "The value must be provided as a Map.\n"
              + "Example: scout.cspDirective[img-src]='self' data: https://media.example.com",
          ContentSecurityPolicy.class.getName());
    }
  }

  public static class CspExclusionsProperty extends AbstractConfigProperty<List<Pattern>, List<String>> {

    @Override
    public String getKey() {
      return "scout.cspExclusions";
    }

    @Override
    public List<String> readFromSource(String namespace) {
      return ConfigUtility.getPropertyList(getKey(), null, namespace);
    }

    @Override
    protected List<Pattern> parse(List<String> value) {
      if (value == null) {
        return null;
      }
      return value.stream()
          .filter(Objects::nonNull)
          .map(Pattern::compile)
          .collect(Collectors.toList());
    }

    @Override
    public String description() {
      return String.format("A list of regex strings. If the pathInfo of the request matches one of these strings the csp headers won't be set. This property only has an effect if csp is enabled, see '%s'.",
          BEANS.get(CspEnabledProperty.class).getKey());
    }
  }
}
