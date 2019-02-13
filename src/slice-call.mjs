// A little abstraction used to turn a NodeList into an array. This is useful
// for older browsers where NodeLists don't have a forEach method.
export default arr => [].slice.call(arr);
