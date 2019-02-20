export const getOriginFromHref = href => {
  const pathArray = href.split("/");

  return `${pathArray[0]}//${pathArray[2]}/`;
};

export const buildLinkTag = origin => {
  let linkEl = document.createElement("link");
  linkEl.rel = "dns-prefetch";
  linkEl.href = origin;

  document.head.appendChild(linkEl);
};
