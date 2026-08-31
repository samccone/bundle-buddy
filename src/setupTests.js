const { TextEncoder, TextDecoder } = require("util");

// React 19's `act` refuses to run unless the environment opts in.
global.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom 16 (what jest 27 ships with) predates the global text encoding APIs
// that react-router and the import pipeline both reach for.
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}
