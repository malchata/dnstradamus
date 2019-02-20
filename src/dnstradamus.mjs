import { getOriginFromHref, buildLinkTag } from "./helpers";

export default function (userOptions) {
  // Default options merged with user supplied ones
  const options = {
    context: "body",
    include: (anchor, origin) => true,
    timeout: 4000,
    observeChanges: false,
    observeRoot: "body",
    bailIfSlow: false,
    ...userOptions
  };

  const selectorString = `${options.context} a[href^="http://"],a[href^="https://"]`;

  if (("IntersectionObserver" in window && "IntersectionObserverEntry" in window) && ("connection" in navigator ? navigator.connection.saveData : false || /^(3|4)g$/i.test("connection" in navigator ? navigator.connection.effectiveType : "4g") === false) === false) {
    let resolvedOrigins = [];

    let intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting === true) {
          let anchor = entry.target;
          let anchorOrigin = getOriginFromHref(anchor.href);

          if (resolvedOrigins.indexOf(anchorOrigin) === -1 && anchorOrigin.indexOf(`${document.location.protocol}//${document.location.host}`) === -1 && options.include(anchor, anchorOrigin) === true) {
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
    });

    let anchors = [].slice.call(document.querySelectorAll(selectorString));
    anchors.forEach(anchor => intersectionListener.observe(anchor));

    if ("MutationObserver" in window && options.observeChanges === true) {
      new MutationObserver(mutations => mutations.forEach(() => {
        [].slice.call(document.querySelectorAll(selectorString)).forEach(anchor => {
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
