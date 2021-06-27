// Type declarations
import type { Dnstradamus } from "../types/Dnstradamus.d";

// Functions
import { queryDOM } from "./query-dom";
import { buildLinkTag } from "./build-link-tag";
import { getOriginFromHref } from "./get-origin-from-href";
import { includeOrigin } from "./include-origin";

export function dnstradamus (options: Dnstradamus = {}) {
  // Option assignments
  const context = options.context || "body";
  const include = options.include || includeOrigin;
  const observeChanges = options.observeChanges || false;
  console.dir(options);

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && !window.matchMedia("(prefers-reduced-data: reduce)").matches) {
    let resolvedOrigins:Array<string> = [];

    let intersectionListener = new IntersectionObserver((entries, observer) => {
      for (let entry of entries) {
        if (entry.intersectionRatio) {
          let anchor = entry.target as HTMLAnchorElement;
          let anchorOrigin = getOriginFromHref(anchor.href);

          if (resolvedOrigins.indexOf(anchorOrigin) < 0 && anchorOrigin.indexOf(`${document.location.protocol}//${document.location.host}`) < 0 && include(anchor, anchorOrigin)) {
            if ("requestIdleCallback" in window) {
              requestIdleCallback(() => {
                buildLinkTag(anchorOrigin);
              });
            } else {
              buildLinkTag(anchorOrigin);
            }

            resolvedOrigins.push(anchorOrigin);
          }

          observer.unobserve(anchor);
          anchors = anchors.filter(anchorElement => anchorElement != anchor);

          if (!anchors.length && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      };
    });

    let anchors = queryDOM(`${context} a[href^="http://"],a[href^="https://"]`);

    for (let anchor of anchors) {
      intersectionListener.observe(anchor);
    }

    if ("MutationObserver" in window && observeChanges) {
      new MutationObserver(mutations => {
        for (let mutation of mutations) {
          if (mutation.type === "childList") {
            const anchors = [].slice.call(mutation.addedNodes);

            for (let anchor of anchors) {
              if (anchors.indexOf(anchor) < 0 && resolvedOrigins.indexOf(getOriginFromHref(anchor.href)) < 0) {
                anchors.push(anchor);
                intersectionListener.observe(anchor);
              }
            }
          }
        };
      }).observe(queryDOM(context)[0], {
        childList: true,
        subtree: true
      });
    }
  }
}
