/* DNStradamus v1.0.0 */
import sliceCall from "./slice-call";
import getOriginFromHref from "./get-origin-from-href";
import buildLinkTag from "./build-link-tag";

export default function (userOptions) {
  // Default options merged with user supplied ones
  const options = {
    context: "body",
    include: (anchor, origin) => true,
    threshold: 200,
    timeout: 4000,
    effectiveTypes: ["3g", "4g"],
    observeChanges: false,
    observeRoot: "body",
    bailIfSlow: true,
    ...userOptions
  };

  const selectorString = `${options.context} a[href^="http://"],a[href^="https://"]`;
  const saveData = "connection" in navigator ? navigator.connection.saveData : false;
  const effectiveType = "connection" in navigator ? navigator.connection.effectiveType : "4g";

  let resolvedOrigins = [];
  let bail = options.bailIfSlow === true && (saveData === true || options.effectiveTypes.indexOf(effectiveType) === -1);

  if (("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) && bail === false) {
    let intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting === true || entry.intersectionRatio > 0) {
          let anchor = entry.target;
          let anchorOrigin = getOriginFromHref(anchor.href);

          if (
            resolvedOrigins.indexOf(anchorOrigin) === -1 && anchorOrigin.indexOf(`${document.location.protocol}//${document.location.host}`) === -1 && options.include(anchor, anchorOrigin) === true) {
            if (options.timeout > 0 && "requestIdleCallback" in window) {
              requestIdleCallback(() => buildLinkTag(anchorOrigin), {
                timeout: options.timeout
              });
            } else {
              buildLinkTag(anchorOrigin);
            }

            resolvedOrigins.push(anchorOrigin);
          }

          observer.unobserve(anchor);
          anchors = anchors.filter(anchorElement => anchorElement !== anchor);
        }
      });
    }, {
      rootMargin: `${options.threshold}px 0%`
    });

    sliceCall(document.querySelectorAll(selectorString)).forEach(anchor => intersectionListener.observe(anchor));

    if ("MutationObserver" in window && options.observeChanges === true) {
      new MutationObserver(mutations => mutations.forEach(() => {
        sliceCall(document.querySelectorAll(selectorString)).forEach(anchor => {
          if (anchors.indexOf(anchor) === -1 && resolvedOrigins.indexOf(getOriginFromHref(anchor.href)) === -1) {
            anchors.push(anchor);
            intersectionListener.observe(anchor);
          }
        });
      })).observe(document.querySelector(options.observeRoot), {
        childList: true,
        subtree: true
      });
    }
  }
}
