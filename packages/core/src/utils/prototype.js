/**
 * @access private
 * @param Class Derived
 * @param Class Parent
 * @return {boolean}
 */
export const isDerivedOf = (Derived, Parent) => {
  let prototype = Object.getPrototypeOf(Derived);
  let is = false;
  while (!(is || prototype === null)) {
    is = prototype === Parent;
    prototype = Object.getPrototypeOf(prototype);
  }
  return is;
};
