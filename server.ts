import * as express from "express";
import * as portfinder from "portfinder";
import { VIZ_PATH } from "./utils";
import * as path from "path";
import * as opn from "opn";

/**
 * @export
 * @param {string} dataPath Filename of data generated for graph
 * @param {string} [contextPath=__dirname] Path to be passed in when function is not consumed by bundle-buddy cli process
 */
export function launchServer(
  dataPath: string,
  contextPath: string = __dirname
) {
  portfinder.getPort((err: Error, port: number) => {
    if (err != null) {
      console.log(err);
      process.exit(1);
    }
    const app = express();
    app.use(express.static(path.join(contextPath, VIZ_PATH)));
    console.log(path.join(contextPath, VIZ_PATH));
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
      console.log(`Press Control+C to Quit`);
      opn(`http://localhost:${port}/?file=${dataPath}`);
    });
  });
}
