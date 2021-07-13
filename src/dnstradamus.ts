// Interface declarations
import type { Options } from "./interfaces/Options";

// Constants
import { INTERSECTIONOBSERVER_SUPPORTED, REQUESTIDLECALLBACK_SUPPORTED, MUTATIONOBSERVER_SUPPORTED } from "./lib/constants";

// App-specific
import { queryDOM } from "./lib/query-dom";
import { buildLinkTag } from "./lib/build-link-tag";
import { getOriginFromHref } from "./lib/get-origin-from-href";
import { includeOrigin } from "./lib/include-origin";

export function dnstradamus (options: Options = {}):void {
  const context = options.context || "body";
  const include = options.include || includeOrigin;
  const observeChanges = options.observeChanges || false;

  if (INTERSECTIONOBSERVER_SUPPORTED) {
    const resolvedOrigins:Array<string> = [];
    let anchors = queryDOM(`${context} a[href^="http://"],a[href^="https://"]`);

    const intersectionListener = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.intersectionRatio) {
          const anchor = entry.target as HTMLAnchorElement;
          const origin = getOriginFromHref(anchor.href);

          if (resolvedOrigins.indexOf(origin) < 0 && origin.indexOf(`${document.location.protocol}//${document.location.host}`) < 0 && include(anchor, origin)) {
            if (REQUESTIDLECALLBACK_SUPPORTED) {
              requestIdleCallback(() => {
                buildLinkTag(origin);
              });
            } else {
              buildLinkTag(origin);
            }

            resolvedOrigins.push(origin);
          }

          observer.unobserve(anchor);
          anchors = anchors.filter(anchorElement => anchorElement !== anchor);

          if (!anchors.length && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      }
    });

    for (const anchor of anchors) {
      intersectionListener.observe(anchor);
    }

    if (MUTATIONOBSERVER_SUPPORTED && observeChanges) {
      new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            const newAnchors:Array<HTMLAnchorElement> = [].slice.call(mutation.addedNodes);

            for (const newAnchor of newAnchors) {
              if (resolvedOrigins.indexOf(getOriginFromHref(newAnchor.href)) < 0) {
                anchors.push(newAnchor);
                intersectionListener.observe(newAnchor);
              }
            }
          }
        }
      }).observe(queryDOM(context)[0], {
        childList: true,
        subtree: true
      });
    }
  }
}
