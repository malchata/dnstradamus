export function buildLinkTag (origin:string):void {
  let linkEl:HTMLLinkElement = document.createElement("link");
  linkEl.href = origin;
  linkEl.rel = "dns-prefetch";

  document.head.appendChild(linkEl);
}
