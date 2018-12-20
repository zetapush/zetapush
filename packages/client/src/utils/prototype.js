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

/**
 * @access private
 * @param Object object
 * @param String method
 * @return {boolean}
 */
export const hasMethod = (object, method) => {
  const descriptor = Object.getOwnPropertyDescriptor(object, method);
  return !!descriptor && typeof descriptor.value === 'function';
};

/**
 * @access private
 * @param Object instance
 * @param String stop
 * @return {String[]}
 */
export const getInstanceMethodNames = (instance, stop = Object.prototype) => {
  const methods = [];
  let prototype = Object.getPrototypeOf(instance);
  while (prototype && prototype !== stop) {
    Object.getOwnPropertyNames(prototype).forEach((method) => {
      if (method !== 'constructor') {
        if (hasMethod(prototype, method)) {
          methods.push(method);
        }
      }
    });
    prototype = Object.getPrototypeOf(prototype);
  }
  return methods;
};
