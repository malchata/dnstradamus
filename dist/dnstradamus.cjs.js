'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src = {};

var dnstradamus$1 = {};

var queryDom = {};

Object.defineProperty(queryDom, "__esModule", { value: true });
queryDom.queryDOM = void 0;
function queryDOM(selectorString) {
    return Array.prototype.slice.call(document.querySelectorAll(selectorString));
}
queryDom.queryDOM = queryDOM;

var buildLinkTag$1 = {};

Object.defineProperty(buildLinkTag$1, "__esModule", { value: true });
buildLinkTag$1.buildLinkTag = void 0;
function buildLinkTag(origin) {
    var linkEl = document.createElement("link");
    linkEl.href = origin;
    linkEl.rel = "dns-prefetch";
    document.head.appendChild(linkEl);
}
buildLinkTag$1.buildLinkTag = buildLinkTag;

var getOriginFromHref$1 = {};

Object.defineProperty(getOriginFromHref$1, "__esModule", { value: true });
getOriginFromHref$1.getOriginFromHref = void 0;
function getOriginFromHref(href) {
    var pathArray = href.split("/");
    return pathArray[0] + "//" + pathArray[2] + "/";
}
getOriginFromHref$1.getOriginFromHref = getOriginFromHref;

var includeOrigin$1 = {};

Object.defineProperty(includeOrigin$1, "__esModule", { value: true });
includeOrigin$1.includeOrigin = void 0;
function includeOrigin(anchor, origin) {
    return true;
}
includeOrigin$1.includeOrigin = includeOrigin;

Object.defineProperty(dnstradamus$1, "__esModule", { value: true });
dnstradamus$1.dnstradamus = void 0;
var query_dom_1 = queryDom;
var build_link_tag_1 = buildLinkTag$1;
var get_origin_from_href_1 = getOriginFromHref$1;
var include_origin_1 = includeOrigin$1;
function dnstradamus(options) {
    if (options === void 0) { options = {}; }
    var context = options.context || "body";
    var include = options.include || include_origin_1.includeOrigin;
    var observeChanges = options.observeChanges || false;
    console.dir(options);
    if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && !window.matchMedia("(prefers-reduced-data: reduce)").matches) {
        var resolvedOrigins_1 = [];
        var intersectionListener_1 = new IntersectionObserver(function (entries, observer) {
            var _loop_1 = function (entry) {
                if (entry.intersectionRatio) {
                    var anchor_1 = entry.target;
                    var anchorOrigin_1 = get_origin_from_href_1.getOriginFromHref(anchor_1.href);
                    if (resolvedOrigins_1.indexOf(anchorOrigin_1) < 0 && anchorOrigin_1.indexOf(document.location.protocol + "//" + document.location.host) < 0 && include(anchor_1, anchorOrigin_1)) {
                        if ("requestIdleCallback" in window) {
                            requestIdleCallback(function () {
                                build_link_tag_1.buildLinkTag(anchorOrigin_1);
                            });
                        }
                        else {
                            build_link_tag_1.buildLinkTag(anchorOrigin_1);
                        }
                        resolvedOrigins_1.push(anchorOrigin_1);
                    }
                    observer.unobserve(anchor_1);
                    anchors_2 = anchors_2.filter(function (anchorElement) { return anchorElement != anchor_1; });
                    if (!anchors_2.length && !observeChanges) {
                        intersectionListener_1.disconnect();
                    }
                }
            };
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                _loop_1(entry);
            }
        });
        var anchors_2 = query_dom_1.queryDOM(context + " a[href^=\"http://\"],a[href^=\"https://\"]");
        for (var _i = 0, anchors_1 = anchors_2; _i < anchors_1.length; _i++) {
            var anchor = anchors_1[_i];
            intersectionListener_1.observe(anchor);
        }
        if ("MutationObserver" in window && observeChanges) {
            new MutationObserver(function (mutations) {
                for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
                    var mutation = mutations_1[_i];
                    console.dir(mutation);
                    if (mutation.type === "childList") ;
                }
            }).observe(query_dom_1.queryDOM(context)[0], {
                childList: true,
                subtree: true
            });
        }
    }
}
dnstradamus$1.dnstradamus = dnstradamus;

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.dnstradamus = void 0;
var dnstradamus_1 = dnstradamus$1;
Object.defineProperty(exports, "dnstradamus", { enumerable: true, get: function () { return dnstradamus_1.dnstradamus; } });

}(src));

var index = /*@__PURE__*/getDefaultExportFromCjs(src);

exports.default = index;
