export function buildLinkTag (origin:string):void {
  const linkEl:HTMLLinkElement = document.createElement("link");
  linkEl.href = origin;
  linkEl.rel = "dns-prefetch";

  document.head.appendChild(linkEl);
}
