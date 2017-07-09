import { extent } from "d3-array";

/**
 * Strip hashes from filename strings
 * @param {string} string
 */
export function stripHashes(string) {
  const hashRegex = /[a-f0-9]{20,}/g;
  const match = string.match(hashRegex);
  if (!match) return string;

  const shortHash = match[0].slice(0, 7);
  return string.replace(hashRegex, `${shortHash}…`);
}

//ALL below adapted from @mbostock's fisheye plugin and rebind code in d3.v3
//https://github.com/d3/d3-plugins/tree/master/fisheye
function rebind(target, source) {
  var i = 1,
    n = arguments.length,
    method;
  while (++i < n)
    target[(method = arguments[i])] = d3_rebind(target, source, source[method]);
  return target;
}

// Method is assumed to be a standard D3 getter-setter:
// If passed with no arguments, gets the value.
// If passed with arguments, sets the value and returns the target.
function d3_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}

export function fisheye(scale, d = 3, a = 0) {
  function fisheye(_) {
    var x = scale(_),
      left = x < a,
      v,
      range = extent(scale.range()),
      min = range[0],
      max = range[1],
      m = left ? a - min : max - a;
    if (m == 0) m = max - min;
    return (left ? -1 : 1) * m * (d + 1) / (d + m / Math.abs(x - a)) + a;
  }

  fisheye.distortion = function(_) {
    if (!arguments.length) return d;
    d = +_;
    return fisheye;
  };

  fisheye.focus = function(_) {
    if (!arguments.length) return a;
    a = +_;
    return fisheye;
  };

  fisheye.nice = scale.nice;
  fisheye.ticks = scale.ticks;
  fisheye.tickFormat = scale.tickFormat;

  fisheye.domain = scale.domain;
  fisheye.range = scale.range;
  return rebind(fisheye, scale, "domain", "range");
}

export function deferWork(fn) {
  (window.requestIdleCallback || window.requestAnimationFrame)(
    () => {
      fn();
    },
    { timeout: 100 }
  );
}
