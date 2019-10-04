import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";
import { VIZ_PATH, STANDALONE_PATH } from "./utils";

export const makeStandaloneFile = (
  graphData: string, // String returned by process.ts/processSourceMaps
  contextPath: string = __dirname
) => {
  const templatePath = path.join(contextPath, VIZ_PATH, "index.html");
  const basicDom = fs.readFileSync(templatePath, "utf8");

  // Then, let's modify the dom and write the result back out
  // Need to interpolate at runtime rather than build time because we don't want to rerun the CRA build setup.
  const modifiedDom = new JSDOM(basicDom);

  // Create script element to push into the page.
  const script = modifiedDom.window.document.createElement("script");
  script.innerHTML = `window.DATA = ${graphData};`;
  const body = modifiedDom.window.document.querySelector("body");
  // Insert as first child to ensure it's available before the React app can check the global window
  body.prepend(script, body.firstChild);

  // Write modified directory to the "standalone" folder to avoid colliding with "regular" app.
  const writePath = path.join(contextPath, STANDALONE_PATH, "index.html");
  fs.writeFileSync(writePath, modifiedDom.serialize());
};
