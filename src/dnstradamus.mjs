export default function (options) {
  options = options || {};

  // Option assignments
  const context = options.context || "body";
  const include = options.include || ((anchor, origin) => true);
  const timeout = "timeout" in options ? options.timeout : 4000;
  const observeChanges = options.observeChanges || false;

  // Shorthands (these uglify a bit better)
  const doc = document;
  const win = window;
  const nav = navigator;
  const io = "IntersectionObserver";
  const mo = "MutationObserver";
  const ric = "requestIdleCallback";

  // App specific stuff
  const arr = [];
  const queryDOM = selectorString => arr.slice.call(doc.querySelectorAll(selectorString || `${context} a[href^="http://"],a[href^="https://"]`));

  const buildLinkTag = origin => {
    let linkEl = doc.createElement("link");
    linkEl.href = origin;
    linkEl.rel = "dns-prefetch";

    doc.head.appendChild(linkEl);
  };

  const getOriginFromHref = href => {
    const pathArray = href.split("/");

    return `${pathArray[0]}//${pathArray[2]}/`;
  };

  if (io in win && `${io}Entry` in win && ("connection" in nav ? nav.connection.saveData : false) == false) {
    let resolvedOrigins = [];

    let intersectionListener = new win[io]((entries, observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio) {
          let anchor = entry.target;
          let anchorOrigin = getOriginFromHref(anchor.href);

          if (resolvedOrigins.indexOf(anchorOrigin) < 0 && anchorOrigin.indexOf(`${doc.location.protocol}//${doc.location.host}`) < 0 && include(anchor, anchorOrigin)) {
            if (timeout && ric in win) {
              win[ric](() => {
                buildLinkTag(anchorOrigin);
              }, {
                timeout
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
      });
    });

    let anchors = queryDOM();

    for (let anchorIndex in anchors) {
      intersectionListener.observe(anchors[anchorIndex]);
    }

    if (mo in win && observeChanges) {
      new win[mo](mutations => {
        queryDOM().forEach(anchor => {
          if (anchors.indexOf(anchor) < 0 && resolvedOrigins.indexOf(getOriginFromHref(anchor.href)) < 0) {
            anchors.push(anchor);
            intersectionListener.observe(anchor);
          }
        });
      }).observe(queryDOM(context)[0], {
        childList: true,
        subtree: true
      });
    }
  }
}
