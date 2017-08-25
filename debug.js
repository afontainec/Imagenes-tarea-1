const solve = require('ndarray-linear-solve');
const ndarray = require('ndarray');
const show = require('ndarray-show');
const math = require('mathjs');

// // const A = ndarray([123, 0, 1, 0, 0, 0,
// //   0, 0, 0, 123, 0, 1,
// //   73, 323, 1, 0, 0, 0,
// //   0, 0, 0, 1, 0, 0,
// //   0, 0, 0, 0, 1, 0,
// //   0, 0, 0, 0, 0, 1,
// // ], [6, 6], [1, 6]);
// // const B = ndarray([0, 98, 98, 196, 0, 98]);
// // let  X = ndarray(new Float64Array(6));
// let A = ndarray([123, 0, 1, 73, 323, 1, 0, 191, 1], [3, 3], [1, 3]);
// let B = ndarray([0, 98, 0]);
// let X = ndarray(new Float64Array(3));
// console.log(show(A));
// console.log(show(B));
// let r = solve(X, A, B);
// console.log(r);
// console.log(X.data);
// A = ndarray([123, 0, 1, 73, 323, 1, 0, 191, 1], [3, 3], [1, 3]);
// B = ndarray([0, 196, 98]);
// X = ndarray(new Float64Array(3));
// console.log(show(A));
// console.log(show(B));
// r = solve(X, A, B);
// console.log(r);
// console.log(X.data);

const T = math.matrix([[2, 0, 0], [0, 2, 0], [0, 0, 8]]);
const I = math.matrix([1, 3, 4]);

console.log(math.multiply(T, I));
