# DNStradamus

<p align="center">
  <picture>
    <source srcset="https://jlwagner.net/ext/images/dnstradamus.webp" type="image/webp">
    <img src="https://jlwagner.net/ext/images/dnstradamus.jpg" alt="DNStradamus" width="800" height="400">
  </picture>
</p>

<p align="center">
  ![](https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.js?label=Uncompressed) ![](https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.js?compression=gzip&label=gzip) ![](https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.js?compression=brotli&label=brotli)
</div>

## Who&mdash;er, _what_&mdash;is DNStradamus?

DNStradamus is a very small prognosticating script that uses [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to find external links to other origins as they are scrolled into the viewport. As it discovers such links, it uses [`dns-prefetch`](https://www.w3.org/TR/resource-hints/#dfn-dns-prefetch) to perform an early DNS lookup for those links. Its design and function is inspired by [quicklink](https://github.com/GoogleChromeLabs/quicklink), which does something similar, except it performs [link prefetching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ) instead.

## Bah, why bother with DNS prefetching?

DNS lookup times are no doubt largely reduced by many redundant layers of DNS caches starting in your browser, your operating system, sometimes at your router, and many potential layers beyond. Public DNS servers such as Cloudflare's [1.1.1.1](https://1.1.1.1/) and [Google's DNS](https://developers.google.com/speed/public-dns/) also offer very fast, highly available public DNS resolution services that help to make the internet faster for people everywhere. That said, sometimes DNS lookups can still take longer than we'd like.

<p align="center">
  <picture>
    <source srcset="https://jlwagner.net/ext/images/nslookup.webp" type="image/webp">
    <img src="https://jlwagner.net/ext/images/nslookup.png" alt="A breakdown of DNS timings as shown in Chrome DevTools." width="846" height="158">
  </picture>
</p>

Furthermore, the `dns-prefetch` hint gives us a great fault-tolerant way to mitigate delays in DNS resolution. Unfortunately, it's not practical to add tons of these hints in your page's `<head>` tag to cover every single external link on your site. It's something we tend to do for external resources we _know_ we'll need at page load time (i.e., page resources from CDNs), but not for external links. This means we're leaving a large opportunity on the table to improve perceived performance for page navigations.

## Why not just prefetch pages, though?

Page prefetching is an excellent solution that goes a _long_ way in improving perceived performance of page navigations. The biggest problem with it, however, is that it can be very wasteful, which is not always acceptable for people on metered data plans. quicklink mitigates this somewhat by checking to see if users have [data saver mode](https://support.google.com/chrome/answer/2392284) enabled on Chrome for Android, as well as checking the [effective connection type](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType) via `navigator.connection.effectiveType`. Despite these mitigations, however, these signals are only available in Chrome.

DNS lookups, on the other hand, are low risk because of the relative cheapness of them compared to prefetching entire documents. Even so, DNStradamus is configured to check for the same signals quicklink does to avoid any DNS prefetches for users who want to save data or have a slow effective connection type.

## How to use DNStradamus

If you're the `npm` type, you can install it:

```shell
npm install dnstradamus
```

From there, it's not much trouble to get it up and running:

```javascript
import dnstradamus from "dnstradamus";

document.addEventListener("DOMContentLoaded", function() {
  dnstradamus();
});
```

If you'd just prefer to use a script, there are scripts in both ES6 and ES5 flavors available in the dist folder in the repo with `.mjs` and `.js` extensions, respectively.

## Options

Despite its small size, DNStradamus is highly configurable. Let's step through the available options:

### `context`

_Default: `"body"`_

The context in which links are selected. This option accepts any valid CSS selector. It's useful for helping you to narrow down where DNStradamus looks for links. For example, let's say you only wanted to do DNS prefetching for external links within an element with an ID of `content`:

```javascript
dnstradamus({
  context: "#content"
});
```

### `include`

_Default: `(anchor, origin) => true`_

Under the hood and apart from this, DNStradamus won't prefetch DNS for the primary origin (since it has already so that by the time DNStradamus kicks in). `include` helps you to take things further by providing a callback with an interface that provides the anchor DOM node and the origin it points to. From here, you can create your own filtering mechanism to determine what links should be considered for prefetching. Returning any expression that evaluates to `true` ensures DNStradamus will consider the link a candidate for DNS prefetching. For example, let's say you wanted to include only link elements without a class of `nonslookup`:

```javascript
dnstradamus({
  include: (anchor, origin) => anchor.classList.contains("nonslookup") === false
});
```

Or, you could include only links that match a certain regex for certain domains:

```javascript
dnstradamus({
  include: (anchor, origin) => /^https?:\/\/(www\.)?(alistapart\.com|css-tricks\.com)/i.test(origin) === true
});
```

Whatever filtering mechanism you can come up with is up to you. The interface `include` provides is lax enough to let you figure out what's best for your application.

### `threshold`

_Default: `200`_

The threshold, in CSS pixels, by which links outside of the viewport will be observed. Increasing this value means DNStradamus will attempt to prefetch DNS information for external links when they're further away from the viewport.

### `timeout`

_Default: `4000`_

DNStradamus uses [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) to take advantage of the browser's idle time. This is helpful in reducing jank on the main thread. If set to `0`, the browser won't attempt to use `requestIdleCallback`. If `requestIdleCallback` isn't supported, DNStradamus will perform DNS prefetching immediately.

### `effectiveTypes`

_Default: `["3g", "4g"]`_

This option is used to filter against the effective connection types offered by `navigator.connection.effectiveType`, which includes the values `"2g-slow"`, `"2g"`, `"3g"`, and `"4g"`. Whatever values _aren't_ in this array will cause DNStradamus to _not_ prefetch DNS information.

### `observeChanges`

_Default: `false`_

Flipping this to `true` will invoke `MutationObserver` to look for new links in the DOM. This is useful for single page applications where large swaths of the DOM change. If in doubt, don't set this to `true`.

### `observeRoot`

_Default: `"body"`_

This is only consequential if `observeChanges` is set to `true`. `MutationObserver` can be set to only observe changes on a certain portion of the DOM. You can use any valid CSS selector, but in most cases, you probably won't want to change this.

### `bailIfSlow`

_Default: true_

By default, if users have data saver enabled in Chrome for Android, or if their effective connection type is `2g` or `2g-slow`, DNStradamus won't do anything. If you're a devil-may-care type, you can set this to `false` and DNStradamus will do its thing regardless.

## Contributing

Please view [`CONTRIBUTING.md`](https://github.com/malchata/dnstradamus/blob/master/CONTRIBUTING.md) for details on contributing code to this project.
