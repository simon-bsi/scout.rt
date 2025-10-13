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

import static java.util.Collections.unmodifiableMap;
import static java.util.stream.Collectors.joining;
import static org.eclipse.scout.rt.platform.util.StringUtility.join;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import org.eclipse.scout.rt.platform.Bean;
import org.eclipse.scout.rt.platform.config.CONFIG;
import org.eclipse.scout.rt.platform.util.CollectionUtility;
import org.eclipse.scout.rt.platform.util.StringUtility;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicyConfigProperties.CspDirectiveProperty;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicyConfigProperties.CspEnabledProperty;
import org.eclipse.scout.rt.security.csp.ContentSecurityPolicyConfigProperties.CspExclusionsProperty;

/**
 * This bean holds a modifiable set of Content Security Policy (CSP) directives.
 * A "CSP token" to use in an HTTP header can be retrieved with the method {@link #toToken()}.
 *
 * @see <a href="https://www.w3.org/TR/CSP2/">https://www.w3.org/TR/CSP2/</a>
 * @see CspDirectiveProperty
 */
@Bean
public class ContentSecurityPolicy {

  public static final String HTTP_HEADER = "Content-Security-Policy";
  public static final String CSP_REPORT_URL = "csp-report";

  public static final String DIRECTIVE_SEPARATOR = "; ";
  public static final String SOURCE_SEPARATOR = " ";

  // fetch directives
  public static final String DIRECTIVE_CHILD_SRC = "child-src";
  public static final String DIRECTIVE_CONNECT_SRC = "connect-src";
  public static final String DIRECTIVE_DEFAULT_SRC = "default-src";
  public static final String DIRECTIVE_FONT_SRC = "font-src";
  public static final String DIRECTIVE_FRAME_SRC = "frame-src";
  public static final String DIRECTIVE_IMG_SRC = "img-src";
  public static final String DIRECTIVE_MANIFEST_SRC = "manifest-src";
  public static final String DIRECTIVE_MEDIA_SRC = "media-src";
  public static final String DIRECTIVE_OBJECT_SRC = "object-src";
  public static final String DIRECTIVE_SCRIPT_SRC = "script-src";
  public static final String DIRECTIVE_STYLE_SRC = "style-src";
  public static final String DIRECTIVE_WORKER_SRC = "worker-src";

  // document directives
  public static final String DIRECTIVE_BASE_URI = "base-uri";
  public static final String DIRECTIVE_SANDBOX = "sandbox";

  // navigation directives
  public static final String DIRECTIVE_FORM_ACTION = "form-action";
  public static final String DIRECTIVE_FRAME_ANCESTORS = "frame-ancestors";

  // reporting directives
  @Deprecated
  @SuppressWarnings("DeprecatedIsStillUsed")
  public static final String DIRECTIVE_REPORT_URI = "report-uri"; // CSP2
  public static final String DIRECTIVE_REPORT_TO = "report-to"; // CSP3

  private final Map<String, String> m_directives = new LinkedHashMap<>();

  /**
   * @return unmodifiable {@link Map} of all CSP directives.
   */
  public final Map<String, String> getDirectives() {
    return unmodifiableMap(m_directives);
  }

  /**
   * Clear all directives from this rule set
   */
  public ContentSecurityPolicy empty() {
    m_directives.clear();
    return this;
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/base-uri">MDN</a> for more details.
   */
  public ContentSecurityPolicy withBaseUri(String baseUri) {
    return putOrRemove(DIRECTIVE_BASE_URI, baseUri);
  }

  /**
   * Appends {@code baseUri} to existing base URI directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/base-uri">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendBaseUri(String baseUri) {
    return putOrAppend(DIRECTIVE_BASE_URI, baseUri);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/child-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withChildSrc(String childSrc) {
    return putOrRemove(DIRECTIVE_CHILD_SRC, childSrc);
  }

  /**
   * Appends {@code childSrc} to existing child source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/child-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendChildSrc(String childSrc) {
    return putOrAppend(DIRECTIVE_CHILD_SRC, childSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withConnectSrc(String connectSrc) {
    return putOrRemove(DIRECTIVE_CONNECT_SRC, connectSrc);
  }

  /**
   * Appends {@code connectSrc} to existing connect source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendConnectSrc(String connectSrc) {
    return putOrAppend(DIRECTIVE_CONNECT_SRC, connectSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/default-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withDefaultSrc(String defaultSrc) {
    return putOrRemove(DIRECTIVE_DEFAULT_SRC, defaultSrc);
  }

  /**
   * Appends {@code defaultSrc} to existing default source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/default-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendDefaultSrc(String defaultSrc) {
    return putOrAppend(DIRECTIVE_DEFAULT_SRC, defaultSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/font-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withFontSrc(String fontSrc) {
    return putOrRemove(DIRECTIVE_FONT_SRC, fontSrc);
  }

  /**
   * Appends {@code fontSrc} to existing default font directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/font-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendFontSrc(String fontSrc) {
    return putOrAppend(DIRECTIVE_FONT_SRC, fontSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/form-action">MDN</a> for more details.
   */
  public ContentSecurityPolicy withFormAction(String formAction) {
    return putOrRemove(DIRECTIVE_FORM_ACTION, formAction);
  }

  /**
   * Appends {@code formAction} to existing form action directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/form-action">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendFormAction(String formAction) {
    return putOrAppend(DIRECTIVE_FORM_ACTION, formAction);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withFrameSrc(String frameSrc) {
    return putOrRemove(DIRECTIVE_FRAME_SRC, frameSrc);
  }

  /**
   * Appends {@code frameSrc} to existing frame source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendFrameSrc(String frameSrc) {
    return putOrAppend(DIRECTIVE_FRAME_SRC, frameSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors">MDN</a> for more details.
   */
  public ContentSecurityPolicy withFrameAncestors(String frameAncestors) {
    return putOrRemove(DIRECTIVE_FRAME_ANCESTORS, frameAncestors);
  }

  /**
   * Appends {@code frameAncestors} to existing frame ancestors directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendFrameAncestors(String frameAncestors) {
    return putOrAppend(DIRECTIVE_FRAME_ANCESTORS, frameAncestors);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/img-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withImgSrc(String imgSrc) {
    return putOrRemove(DIRECTIVE_IMG_SRC, imgSrc);
  }

  /**
   * Appends {@code imgSrc} to existing image source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/img-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendImgSrc(String imgSrc) {
    return putOrAppend(DIRECTIVE_IMG_SRC, imgSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/manifest-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withManifestSrc(String manifestSrc) {
    return putOrRemove(DIRECTIVE_MANIFEST_SRC, manifestSrc);
  }

  /**
   * Appends {@code manifestSrc} to existing manifest source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/manifest-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendManifestSrc(String manifestSrc) {
    return putOrAppend(DIRECTIVE_MANIFEST_SRC, manifestSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/media-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withMediaSrc(String mediaSrc) {
    return putOrRemove(DIRECTIVE_MEDIA_SRC, mediaSrc);
  }

  /**
   * Appends {@code mediaSrc} to existing media source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/media-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendMediaSrc(String mediaSrc) {
    return putOrAppend(DIRECTIVE_MEDIA_SRC, mediaSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/object-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withObjectSrc(String objectSrc) {
    return putOrRemove(DIRECTIVE_OBJECT_SRC, objectSrc);
  }

  /**
   * Appends {@code objectSrc} to existing object source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/object-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendObjectSrc(String objectSrc) {
    return putOrAppend(DIRECTIVE_OBJECT_SRC, objectSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-uri">MDN</a> for more details.
   *
   * @deprecated Use {@link #withReportTo(String)} instead.
   */
  @Deprecated
  @SuppressWarnings("DeprecatedIsStillUsed")
  public ContentSecurityPolicy withReportUri(String reportUri) {
    return withReportTo(reportUri);
  }

  /**
   * Appends {@code reportUri} to existing report URI directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-uri">MDN</a> for more details.
   *
   * @deprecated Use {@link #appendReportTo(String)} instead.
   */
  @Deprecated
  @SuppressWarnings("DeprecatedIsStillUsed")
  public ContentSecurityPolicy appendReportUri(String reportUri) {
    return appendReportTo(reportUri);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to">MDN</a> for more details.
   */
  public ContentSecurityPolicy withReportTo(String reportTo) {
    putOrRemove(DIRECTIVE_REPORT_URI, reportTo); // deprecated but keep it for now to also support older browsers
    return putOrRemove(DIRECTIVE_REPORT_TO, reportTo);
  }

  /**
   * Appends {@code reportTo} to existing report URI directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendReportTo(String reportTo) {
    putOrAppend(DIRECTIVE_REPORT_URI, reportTo); // deprecated but keep it for now to also support older browsers
    return putOrAppend(DIRECTIVE_REPORT_TO, reportTo);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox">MDN</a> for more details.
   */
  public ContentSecurityPolicy withSandbox(String sandbox) {
    return putOrRemove(DIRECTIVE_SANDBOX, sandbox);
  }

  /**
   * Appends {@code sandbox} to existing sandbox directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendSandbox(String sandbox) {
    return putOrAppend(DIRECTIVE_SANDBOX, sandbox);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withScriptSrc(String scriptSrc) {
    return putOrRemove(DIRECTIVE_SCRIPT_SRC, scriptSrc);
  }

  /**
   * Appends {@code scriptSrc} to existing script source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendScriptSrc(String scriptSrc) {
    return putOrAppend(DIRECTIVE_SCRIPT_SRC, scriptSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withStyleSrc(String styleSrc) {
    return putOrRemove(DIRECTIVE_STYLE_SRC, styleSrc);
  }

  /**
   * Appends {@code styleSrc} to existing style source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendStyleSrc(String styleSrc) {
    return putOrAppend(DIRECTIVE_STYLE_SRC, styleSrc);
  }

  /**
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/worker-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy withWorkerSrc(String workerSrc) {
    return putOrRemove(DIRECTIVE_WORKER_SRC, workerSrc);
  }

  /**
   * Appends {@code workerSrc} to existing worker source directive or creates new directive if it not already exists.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/worker-src">MDN</a> for more details.
   */
  public ContentSecurityPolicy appendWorkerSrc(String workerSrc) {
    return putOrAppend(DIRECTIVE_WORKER_SRC, workerSrc);
  }

  /**
   * Overwrites the given directive or removes it.
   *
   * @param directive
   *     The required directive to modify.
   * @param expressions
   *     The new expressions. If it is {@code null}, the directive is removed, otherwise it is set to the given expressions (existing are replaced).
   * @return this
   */
  public ContentSecurityPolicy putOrRemove(String directive, String expressions) {
    if (!StringUtility.hasText(directive)) {
      return this;
    }

    String key = lower(directive);
    if (expressions == null) {
      m_directives.remove(key);
    }
    else {
      m_directives.put(key, expressions);
    }
    return this;
  }

  protected String lower(String s) {
    if (s == null) {
      return null;
    }
    return s.toLowerCase(Locale.ENGLISH);
  }

  /**
   * Appends the given expression to the given directive. If the directive does not exist yet, it is created.
   *
   * @param directive
   *     The required directive to modify.
   * @param expression
   *     The expression to add. If {@code null}, nothing is appended. If it already exists, nothing is appended.
   * @return this.
   */
  public ContentSecurityPolicy putOrAppend(String directive, String expression) {
    if (expression == null) {
      return this;
    }
    if (!StringUtility.hasText(directive)) {
      return this;
    }

    String key = lower(directive);
    String existingSource = m_directives.get(key);
    if (StringUtility.hasText(existingSource)) {
      // Check for duplicates and do not add new expression, if expression already is part of the existing source
      if (!existingSource.contains(expression)) {
        m_directives.put(key, join(SOURCE_SEPARATOR, existingSource, expression));
      }
    }
    else {
      m_directives.put(key, expression);
    }
    return this;
  }

  /**
   * @return a string describing all directives in this rule set, suitable as value for the {@link #HTTP_HEADER Content-Security-Policy HTTP header}.
   * See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy">MDN</a>.
   */
  public String toToken() {
    return m_directives.entrySet().stream()
        .map(entry -> join(SOURCE_SEPARATOR, entry.getKey(), entry.getValue()))
        .collect(joining(DIRECTIVE_SEPARATOR));
  }

  @Override
  public String toString() {
    return toToken();
  }

  /**
   * @param pathInfo
   *     The URL pathInfo to check.
   * @return if the CSP is enabled for the given path.
   */
  public boolean isEnabled(String pathInfo) {
    if (!CONFIG.getPropertyValue(CspEnabledProperty.class)) {
      return false;
    }
    List<Pattern> exclusions = CONFIG.getPropertyValue(CspExclusionsProperty.class);
    if (CollectionUtility.isEmpty(exclusions) || pathInfo == null) {
      return true;
    }
    for (Pattern exclusion : exclusions) {
      if (exclusion.matcher(pathInfo).matches()) {
        return false;
      }
    }
    return true;
  }
}
