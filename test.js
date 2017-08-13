const util = require('util');

const setTimeoutPromise = util.promisify(setTimeout);

(async function asyncIIFE() {
  const array = [1000, 50, 300, 100];
  for (arr of array) {
    console.log('procesing', arr);
    const value = await setTimeoutPromise(arr, arr);
    console.log(value, 'done');
  }
}());
