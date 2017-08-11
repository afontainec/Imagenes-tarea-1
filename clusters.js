exports.get = function (array, n) {
  n -= 1;
  array = array.sort((a, b) => {
    return a - b;
  });

  const distances = getDistances(array);

  const partitions = getPartitions(array, distances, n);
  return partitions;
};


function getDistances(array) {
  const distances = [];
  for (let i = 0; i < array.length - 1; i++) {
    distances.push(Math.abs(array[i] - array[i + 1]));
  }

  distances.sort((a, b) => {
    return a - b;
  });

  return distances;
}

function getPartitions(array, distances, n) {
  const index = [0, array.length];
  for (let i = 0; i < n; i++) {
    const salto = distances[distances.length - i - 1];
    for (let j = 0; j < array.length - 1; j++) {
      const jump = Math.abs(array[j] - array[j + 1]);
      if (jump === salto && index.indexOf(j + 1) === -1) { // if its the same jump and it hasent been registered (duplicated cases)
        index.push(j + 1);
        break;
      }
    }
  }
  index.sort((a, b) => {
    return a - b;
  });
  const partitions = [];
  for (let i = 1; i < index.length; i++) {
    const start = array[index[i - 1]];
    let finish = array[index[i] - 1];

    if (start === finish) {
      finish++;
    }
    partitions.push([start, finish]);
    // const start = index[i - 1];
    // const finish = index[i];
    // partitions.push([array[start], array[finish - 1]]);
  }

  return partitions;
}

/*
const start = array[index[i - 1]];
const finish = array[index[i] - 1];
partitions.push([start, finish]);
*/
