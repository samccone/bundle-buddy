const httpServer = require("http-server");
const openPort = require("openport");
import * as path from "path";
import * as opn from "opn";

export function launchServer(dataPath: string, visualizationPath: string) {
  openPort.find((err: Error, port: number) => {
    if (err != null) {
      console.log(err);
      process.exit(1);
    }
    httpServer
      .createServer({
        root: path.join(__dirname, visualizationPath)
      })
      .listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
        console.log(`Press Control+C to Quit`);
        opn(`http://localhost:${port}?file=${dataPath}`);
      });
  });
}
