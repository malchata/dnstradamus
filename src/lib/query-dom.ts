export function queryDOM (selectorString:string): Array<HTMLAnchorElement> {
  return Array.prototype.slice.call(document.querySelectorAll(selectorString));
};
