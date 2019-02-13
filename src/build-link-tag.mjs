export default function (origin) {
  let linkEl = document.createElement("link");
  linkEl.setAttribute("rel", "dns-prefetch");
  linkEl.setAttribute("href", origin);
  linkEl.setAttribute("crossorigin", "anonymous");

  document.head.appendChild(linkEl);
}
