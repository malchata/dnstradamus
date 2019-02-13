export default function (origin) {
  let linkEl = document.createElement("link");
  linkEl.rel = "dns-prefetch";
  linkEl.href = origin;
  linkEl.crossOrigin = "anonymous";

  document.head.appendChild(linkEl);
}
