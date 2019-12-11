import isPlainObject from "is-plain-object";

function concat(array1, array2) {
  const finalArray = [];

  each(array1, value => {
    finalArray.push(value);
  });

  each(array2, value => {
    finalArray.push(value);
  });

  return finalArray;
}

// Copied from lodash
function isArray(value) {
  return Object.prototype.toString.call(value) === "[object Array]";
}

function each(value, fn) {
  if (isArray(value)) {
    for (let i = 0, len = value.length; i < len; i++) {
      fn(value[i], i);
    }
  } else if (isPlainObject(value)) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        fn(value[key], key);
      }
    }
  } else {
    throw new Error("Don't know how to iterate over value");
  }
}

function mergeObjects(object1, object2) {
  const final = {};

  each(object1, (value, key) => {
    final[key] = value;
  });

  each(object2, (value, key) => {
    final[key] = value;
  });

  return final;
}

/*
function sliceObject(object, keys) {
  const newObject = {};

  each(keys, key => {
    newObject[key] = object[key];
  });

  return newObject;
}
*/

export { concat, each, isArray, isPlainObject, mergeObjects };
