# dnstradamus

<p align="center">
  <picture>
    <source srcset="https://jlwagner.net/ext/images/dnstradamus.webp" type="image/webp">
    <img src="https://jlwagner.net/ext/images/dnstradamus.jpg" alt="dnstradamus" width="800" height="400" style="height: auto; max-width: 100%;">
  </picture>
</p>
<p align="center">(graphic by <a href="https://github.com/flipty" rel="noopener">@flipty</a>)</p>
<p align="center">
  <strong>ES5 (.js) version</strong>
</p>
<p align="center">
  <img src="https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.js?label=Uncompressed" alt="Uncompressed">&nbsp;<img src="https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.js?compression=gzip&label=gzip" alt="gzip">&nbsp;<img src="https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.js?compression=brotli&label=brotli" alt="Brotli">
</p>
<p align="center">
  <strong>ES6 (.mjs) version</strong>
</p>
<p align="center">
  <img src="https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.mjs?label=Uncompressed" alt="Uncompressed">&nbsp;<img src="https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.mjs?compression=gzip&label=gzip" alt="gzip">&nbsp;<img src="https://img.badgesize.io/malchata/dnstradamus/master/dist/dnstradamus.min.mjs?compression=brotli&label=brotli" alt="Brotli">
</p>

## Who&mdash;er, _what_&mdash;is dnstradamus?

dnstradamus is a very small script that uses [`dns-prefetch`](https://www.w3.org/TR/resource-hints/#dfn-dns-prefetch) to perform early DNS lookups links to external sites. It uses [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to monitor `<a>` elements as they are scrolled into the viewport, as well as [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) to take advantage of idle browser time to minimize jank. dnstradamus is inspired by [quicklink](https://github.com/GoogleChromeLabs/quicklink), which performs [link prefetching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ) rather than DNS lookups.

## Bah, why bother with DNS prefetching?

DNS lookup times are undoubtedly reduced by redundant DNS caches in your browser, operating system, and many layers beyond. Public DNS servers such as Cloudflare's [1.1.1.1](https://1.1.1.1/) and [Google's public DNS](https://developers.google.com/speed/public-dns/) also offer very fast resolution that help to make the internet snappier for everyone everywhere. That said, sometimes DNS lookups can still take longer than we'd like.

<p align="center">
  <picture>
    <source srcset="https://jlwagner.net/ext/images/nslookup.webp" type="image/webp">
    <img src="https://jlwagner.net/ext/images/nslookup.png" alt="A breakdown of response timings as shown in Chrome DevTools, with DNS lookup taking 92.27 ms in this example." width="846" height="158" style="height: auto; max-width: 100%;">
  </picture>
</p>

`dns-prefetch` gives us a resilient and fault-tolerant way to mask the latency of DNS lookups. Unfortunately, it may not be practical to manually add tons of these hints in your page's `<head>` to cover every single external link on your site. This is especially true for sites with lots dynamic or user-generated content. This means we're leaving an opportunity on the table to improve perceived navigation performance for outbound links.

## Why not just prefetch pages, though?

Page prefetching goes a _long_ way toward improving perceived performance. Yet, link prefetching _can_ be wasteful, which is not always acceptable for people on metered data plans. quicklink mitigates this somewhat by checking to see if users have [data saver mode](https://support.google.com/chrome/answer/2392284) enabled on Chrome for Android, as well as checking the Network Information API's [effective connection type](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType). Despite these mitigations, however, these signals are only available in Chrome.

On the other hand, speculative DNS lookups are low risk because of the relative cheapness of them compared to prefetching documents. Even so, dnstradamus is configured to check if data saver mode is enabled to avoid any DNS prefetching for those who explicitly want to minimize data usage.

## How to use dnstradamus

If you're the `npm` sort, you can install it:

```
npm install dnstradamus
```

From there, it's not much trouble to get up and running:

```javascript
import dnstradamus from "dnstradamus";

document.addEventListener("DOMContentLoaded", function() {
  // Read below for more options
  dnstradamus({
    observeChanges: true
  });
});
```

If you'd prefer _not_ to install with `npm`, there are scripts in both ES6 and ES5 flavors in the `dist` folder available in this repo as `dnstradamus.min.mjs` and `dnstradamus.min.js`, respectively.

However you use dnstradamus, you need to be aware that it depends on `IntersectionObserver` to work. If used in a browser that doesn't support `IntersectionObserver`, you can polyfill it conditionally with this script:

```html
<script defer src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>
```

If you don't load a polyfill for `IntersectionObserver`, dnstradamus will fail silently. This ensures that an unpolyfilled feature won't brick your website.

## Options

Despite its small size, dnstradamus is highly configurable. Let's step through the available options:

### `context`

_Default: `"body"`_

The context in which links are selected. This option accepts any valid CSS selector. It's useful for helping you to narrow down where dnstradamus looks for links. For example, let's say you only wanted to do DNS prefetching for external links within an element with an ID of `content`:

```javascript
dnstradamus({
  context: "#content"
});
```

This context should point to a unique element. If you're not sure what you're doing, the default works just fine.

### `include`

_Default: `(anchor, origin) => true`_

If you want to restrict what `<a>` elements dnstradamus prefetches DNS info for, `include` helps you to do that by providing a callback. This callback's interface includes the anchor element itself, as well as the origin it points to. From here, you can create your own filtering mechanism to determine what links should be considered for prefetching. Returning any expression that evaluates to `true` will include the link's origin for DNS prefetching. For example, let's say you wanted to exclude anchor elements with a class of `nolookup` from DNS prefetching:

```javascript
dnstradamus({
  include: (anchor, origin) => !anchor.classList.contains("nolookup")
});
```

Or, let's say you only wanted to include links that match a regex for specific domains:

```javascript
dnstradamus({
  include: (anchor, origin) => /^https?:\/\/(www\.)?(alistapart\.com|css-tricks\.com)/i.test(origin)
});
```

The interface `include` provides should be flexible enough to let you figure out what's best for your application.

### `timeout`

_Default: `4000`_

dnstradamus uses `requestIdleCallback` to take advantage of the browser's idle time. The `timeout` value is the deadline (in milliseconds) by which the browser _must_ perform a DNS prefetch for a matching link. If set to `0` or if `requestIdleCallback` isn't supported, dnstradamus will perform DNS prefetching immediately when a link enters the viewport.

### `observeChanges`

_Default: `false`_

Flipping this to `true` will invoke a `MutationObserver` to look for new links added to the DOM after initialization. This is useful for single page applications where large swaths of the DOM can change. When in doubt, or in settings where client-side routing isn't used, don't set this to `true`.

_**Note:** The `context` option also restricts the scope of the mutation observer!_

## Contributing

Please view [`CONTRIBUTING.md`](https://github.com/malchata/dnstradamus/blob/master/CONTRIBUTING.md) for details on contributing code to this project.

## Special thanks

Thank you to [BrowserStack](https://www.browserstack.com/) for graciously providing free cross-platform browser testing services!
[![BrowserStack](https://res.cloudinary.com/drp9iwjqz/image/upload/f_auto,q_auto/v1527175969/browserstack_txnmf8.png)](https://www.browserstack.com/)
