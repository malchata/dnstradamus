function queryDOM(selectorString) {
    return Array.prototype.slice.call(document.querySelectorAll(selectorString));
}

function buildLinkTag(origin) {
    let linkEl = document.createElement("link");
    linkEl.href = origin;
    linkEl.rel = "dns-prefetch";
    document.head.appendChild(linkEl);
}

function getOriginFromHref(href) {
    const pathArray = href.split("/");
    return `${pathArray[0]}//${pathArray[2]}/`;
}

function includeOrigin(anchor, origin) {
    return true;
}

function dnstradamus(options = {}) {
    const context = options.context || "body";
    const include = options.include || includeOrigin;
    const observeChanges = options.observeChanges || false;
    console.dir(options);
    if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && !window.matchMedia("(prefers-reduced-data: reduce)").matches) {
        let resolvedOrigins = [];
        let intersectionListener = new IntersectionObserver((entries, observer) => {
            for (let entry of entries) {
                if (entry.intersectionRatio) {
                    let anchor = entry.target;
                    let anchorOrigin = getOriginFromHref(anchor.href);
                    if (resolvedOrigins.indexOf(anchorOrigin) < 0 && anchorOrigin.indexOf(`${document.location.protocol}//${document.location.host}`) < 0 && include(anchor, anchorOrigin)) {
                        if ("requestIdleCallback" in window) {
                            requestIdleCallback(() => {
                                buildLinkTag(anchorOrigin);
                            });
                        }
                        else {
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
            }
        });
        let anchors = queryDOM(`${context} a[href^="http://"],a[href^="https://"]`);
        for (let anchor of anchors) {
            intersectionListener.observe(anchor);
        }
        if ("MutationObserver" in window && observeChanges) {
            new MutationObserver(mutations => {
                for (let mutation of mutations) {
                    console.dir(mutation);
                    if (mutation.type === "childList") ;
                }
            }).observe(queryDOM(context)[0], {
                childList: true,
                subtree: true
            });
        }
    }
}

export { dnstradamus };
