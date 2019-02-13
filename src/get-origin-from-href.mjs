export default function (href) {
  const pathArray = href.split("/");

  return `${pathArray[0]}//${pathArray[2]}/`;
}
