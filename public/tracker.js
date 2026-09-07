(function () {
  'use strict';

  // SaaSReels Lightweight Real-Time Attribution Tracker (1.8 KB)
  var scriptTag = document.currentScript || document.querySelector('script[data-site]');
  var siteId = (scriptTag && scriptTag.getAttribute('data-site')) || window.location.hostname;
  var endpoint = (scriptTag && scriptTag.getAttribute('data-endpoint')) || '/api/track';

  // Helper to extract UTM parameters from current URL or stored session
  function getParams() {
    var search = window.location.search;
    var params = new URLSearchParams(search);
    var utmSource = params.get('utm_source');
    var utmMedium = params.get('utm_medium');
    var utmCampaign = params.get('utm_campaign');
    var utmContent = params.get('utm_content');
    var utmTerm = params.get('utm_term');

    // Persist attribution in sessionStorage so multi-page funnel signups retain attribution
    if (utmSource) {
      try {
        var utmBundle = {
          source: utmSource,
          medium: utmMedium || 'social',
          campaign: utmCampaign || 'direct',
          content: utmContent || 'ugc_reel',
          term: utmTerm || '',
          timestamp: Date.now()
        };
        sessionStorage.setItem('__saasreels_utm', JSON.stringify(utmBundle));
      } catch (e) {}
    }

    try {
      var cached = sessionStorage.getItem('__saasreels_utm');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}

    return {
      source: utmSource || 'organic',
      medium: utmMedium || 'web',
      campaign: utmCampaign || 'organic_direct',
      content: utmContent || 'landing_page',
      term: utmTerm || '',
      timestamp: Date.now()
    };
  }

  // Dispatch event to SaaSReels Telemetry Engine
  function sendEvent(eventType, meta) {
    var utmData = getParams();
    var payload = {
      siteId: siteId,
      eventType: eventType || 'pageview', // 'pageview' | 'trial_click' | 'signup' | 'subscription'
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || '',
      utm: utmData,
      meta: meta || {},
      timestamp: new Date().toISOString(),
      screen: window.innerWidth + 'x' + window.innerHeight
    };

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(payload));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
      }
    } catch (err) {
      // Graceful silent fallback
    }
  }

  // 1. Automatically fire pageview on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    sendEvent('pageview');
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      sendEvent('pageview');
    });
  }

  // 2. Automatically listen to trial / signup CTA button clicks
  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target) return;
    var el = target.closest('a, button');
    if (!el) return;

    var text = (el.innerText || el.textContent || '').toLowerCase();
    var href = (el.getAttribute('href') || '').toLowerCase();

    if (
      text.includes('sign up') ||
      text.includes('free trial') ||
      text.includes('get started') ||
      text.includes('try free') ||
      text.includes('start now') ||
      href.includes('signup') ||
      href.includes('register') ||
      href.includes('app.')
    ) {
      sendEvent('trial_click', {
        buttonText: (el.innerText || '').trim().slice(0, 50),
        destination: href || 'internal_action'
      });
    }
  }, true);

  // 3. Expose global helper for custom conversion tracking: window.saasreels.track('signup', { value: 29 })
  window.saasreels = {
    track: function (eventType, customMeta) {
      sendEvent(eventType, customMeta);
    },
    getUtm: getParams
  };
})();
