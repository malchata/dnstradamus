export function getOriginFromHref (href:string):string {
  const pathArray:Array<string> = href.split("/");

  return `${pathArray[0]}//${pathArray[2]}/`;
}
