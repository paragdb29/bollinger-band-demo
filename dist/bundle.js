(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _bollingerBands = require("bollinger-bands");

var _bollingerBands2 = _interopRequireDefault(_bollingerBands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getData(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);

  xhr.onload = function () {
    if (xhr.status == 200) {
      callback(xhr.responseText);
    } else {
      callback(null);
    }
  };

  xhr.send();
}

function getGraphdata(data, bollData) {
  var dataToPlot = [];
  data.forEach(function (item, index, array) {
    var temp = [];
    var date = new Date(item.date);
    temp[0] = date.getTime();
    temp[1] = item.last;
    temp[2] = bollData.upper[index] ? bollData.upper[index] : null;
    temp[3] = bollData.lower[index] ? bollData.lower[index] : null;
    temp[4] = bollData.mid[index] ? bollData.mid[index] : null;
    dataToPlot.push(temp);
  });
  return dataToPlot;
}

function renderChart(data, container, id, company) {
  Highcharts.stockChart(container, {
    rangeSelector: {
      selected: 2
    },
    title: {
      text: company
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      series: {
        showInLegend: true
      }
    },
    series: [{
      type: 'line',
      id: id,
      name: company,
      data: data
    }, {
      type: 'bb',
      linkedTo: id
    }]
  });
}

document.addEventListener("DOMContentLoaded", function (event) {
  var stl = [];
  var abb = [];
  getData("data/Oslo_STL.json", function (dataSet) {
    var dataStl = JSON.parse(dataSet);

    if (dataStl) {
      dataStl.forEach(function (item, index, array) {
        stl.push(item.last);
      });
      stl = (0, _bollingerBands2.default)(stl, 20, 2);
      var graphData = getGraphdata(dataStl, stl);
      renderChart(graphData, "osloSTL", "osloSTL", "Oslo STL");
    }
  });
  getData("data/Stockholm_ABB.json", function (dataSet) {
    var dataAbb = JSON.parse(dataSet);

    if (dataAbb) {
      dataAbb.forEach(function (item, index, array) {
        abb.push(item.last);
      });
      abb = (0, _bollingerBands2.default)(abb, 20, 2);
      var graphData = getGraphdata(dataAbb, abb);
      renderChart(graphData, "stockholmABB", "stockholmABB", "Stockholm ABB");
    }
  });
});

},{"bollinger-bands":2}],2:[function(require,module,exports){
'use strict';

const isNumber = subject => typeof subject === 'number';

// Dynamic Weighted Moving Average

// @param {Number|Array.<Number>} alpha

// Smoothed moving average

// Exponential moving average with 86% total weight

// simple moving average

var ma = (data, size) => {
  const length = data.length;

  if (!size) {
    return data.reduce((a, b) => a + b) / length
  }

  if (size <= 1) {
    return data.slice()
  }

  if (size > length) {
    return Array(length)
  }

  const prepare = size - 1;
  const ret = [];
  let sum = 0;
  let i = 0;
  let counter = 0;
  let datum;

  for (; i < length && counter < prepare; i ++) {
    datum = data[i];

    if (isNumber(datum)) {
      sum += datum;
      counter ++;
    }
  }

  for (; i < length; i ++) {
    datum = data[i];

    if (isNumber(datum)) {
      sum += datum;
    }

    if (isNumber(data[i - size])) {
      sum -= data[i - size];
    }

    ret[i] = sum / size;
  }

  return ret
};

// Weighted moving average

var deviation = (data, size) => {
  const length = data.length;
  const avg = ma(data, size);
  const ret = [];

  let i = size - 1;
  let j;
  let sum;

  for (; i < length; i ++) {
    sum = 0;
    j = i - size + 1;

    for (; j <= i; j ++) {
      sum += Math.pow(data[j] - avg[i], 2);
    }

    ret[i] = Math.sqrt(sum / size);
  }

  return ret
};

const error = (
  message
  // code
) => {
  const e = new Error(message);

  // if (code) {
  //   e.code = code
  // }

  throw e
};


const manipulate2Array = (a, b, mutator) => {
  if (a.length !== b.length) {
    error('the length of arrays not match');
  }

  return a.map((x, i) => mutator(x, b[i]))
};


const manipulateArray = (a, b, mutator) => {
  return a.map(x => mutator(x, b))
};


const isArray$1 = (a, b) => [a, b].map(Array.isArray);

const cleanArray = (array) => {
  array.forEach((item, i) => {
    if (item !== item) {
      delete array[i];
    }
  });
};

const orderUnaware = (
  a, b, mutator, mutatorReverse,
  ensureNumber
) => {
  const [A, B] = isArray$1(a, b);

  const ret = A
    ? B
      ? manipulate2Array(a, b, mutator)
      : manipulateArray(a, b, mutator)
    : B
      ? manipulateArray(b, a, mutatorReverse)
      : error('at least one array is required');

  if (ensureNumber) {
    cleanArray(ret);
  }

  return ret
};


const orderAware = (
  a, b, mutator,
  ensureNumber
) => {
  const [A, B] = isArray$1(a, b);

  const ret = A
    ? B
      ? manipulate2Array(a, b, mutator)
      : manipulateArray(a, b, mutator)
    : error('the first argument must be an array');

  if (ensureNumber) {
    cleanArray(ret);
  }

  return ret
};

const add = (a, b) => a + b;
const addReverse = (a, b) => b + a;

var add$1 = (a, b, n) =>
  orderUnaware(a, b, add, addReverse, n);

const sub = (a, b) => a - b;

var sub$1 = (a, b, n) => orderAware(a, b, sub, n);

const mul = (a, b) => a * b;

var mul$1 = (a, b, n) => orderUnaware(a, b, mul, mul, n);

var index = ((datum, size = 20, times = 2, {
  ma: avg,
  sd
} = {}) => {

  avg = avg || ma(datum, size);
  sd = sd || deviation(datum, size);

  const timesSd = mul$1(sd, times);

  return {
    upper: add$1(avg, timesSd),
    mid: avg,
    lower: sub$1(avg, timesSd)
  };
});

module.exports = index;

},{}]},{},[1]);
