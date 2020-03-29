import { statsToGraph } from "../stats_to_graph";
import { readFileAsText, readFilesAsText } from "../file_reader";
import { toClipboard } from "../clipboard";
import { processImports, buildImportErrorReport } from "../process_imports";
import { ImportProps, ImportResolveState, ImportState } from "../../types";

import React, { Component } from "react";
import { ProcessedSourceMap } from "../process_sourcemaps";
// noopener noreferrer

const IGNORE_FILES = [
  // https://twitter.com/samccone/status/1137776153148583936
  'webpack/bootstrap',
];

function removeWebpackMagicFiles(v: ProcessedSourceMap) {
  const ret: ProcessedSourceMap = {}
  for (const k of Object.keys(v)) {
    let skip = false;
    for (const i of IGNORE_FILES) {
      if (k.endsWith(i)) {
        skip = true;
      }
    }
    if (!skip) {
      ret[k] = v[k];
    }
  }

  return ret;
}


class WebpackImport extends Component<ImportProps, ImportState> {
  sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
  statsInput?: React.RefObject<HTMLInputElement & { files: FileList }>;

  constructor(props: ImportProps) {
    super(props);
    this.sourceMapInput = React.createRef();
    this.statsInput = React.createRef();
  }

  state: ImportState = {};

  hasStatsFile(f: File | undefined) {
    return f != null;
  }

  hasSourceMapFile(f: File[] | undefined) {
    return f != null && f.length > 0;
  }

  canProcess(statsFiles: File[] | undefined, sourceMapFile: File | undefined) {
    return statsFiles != null && sourceMapFile != null;
  }

  private async processFiles() {
    if (this.state.graphFile == null || this.state.sourceMapFiles == null) {
      return;
    }

    const statsFileContents = await readFileAsText(this.state.graphFile);
    const sourceMapContents = await readFilesAsText(this.state.sourceMapFiles);

    const processed = await processImports({
      sourceMapContents,
      graphNodes: statsFileContents,
      graphPreProcessFn: statsToGraph
    });

    if (processed.proccessedSourcemap != null) {
      processed.proccessedSourcemap = removeWebpackMagicFiles(processed.proccessedSourcemap);
    }

    const { importError, importErrorUri } = buildImportErrorReport(processed, {
      graphFile: this.state.graphFile,
      sourceMapFiles: this.state.sourceMapFiles
    });

    this.setState({
      importError,
      importErrorUri
    });

    // We only want to go to the resolve screen if there are no errors.
    if (this.props.history != null && this.state.importError == null) {
      const state: ImportResolveState = {
        graphNodes: processed.processedGraph!,
        processedSourceMap: processed.proccessedSourcemap!
      };

      this.props.history.push("/webpack/resolve", state);
    }
  }

  protected onStatsInput() {
    if (
      this.statsInput != null &&
      this.statsInput.current != null &&
      this.statsInput.current.files.length
    ) {
      this.setState({
        graphFile: this.statsInput.current.files[0]
      });
    } else {
      this.setState({
        graphFile: undefined
      });
    }
  }

  protected onSourceMapInput() {
    if (
      this.sourceMapInput != null &&
      this.sourceMapInput.current != null &&
      this.sourceMapInput.current.files.length
    ) {
      this.setState({
        sourceMapFiles: Array.from(this.sourceMapInput.current.files)
      });
    } else {
      this.setState({
        sourceMapFiles: undefined
      });
    }
  }

  render() {
    const resolve = window.location.pathname.indexOf("resolve") !== -1;

    return (
      <div>
        {this.state.importError != null ? (
          <div className="error">
            <h2>Import error</h2>
            <code>
              <pre>{`${this.state.importError}`}</pre>
            </code>
            <a href={this.state.importErrorUri || ""} target="_blank">
              File a bug
            </a>
          </div>
        ) : null}
        <h5>Upload assets</h5>
        <div className="upload-files-container flex">
         
          <div>
            <button tabIndex={-1}>
              <img height="20px" width="20px" className="attach-icon" src="/img/attach_icon.svg" />
              stats.json
              <input
                id="stats"
                type="file"
                ref={this.statsInput}
                accept=".json"
                onInput={() => this.onStatsInput()}
              />
            </button>
            <img
              src={
                this.hasStatsFile(this.state.graphFile) || this.props.imported 
                  ? "/img/ok_icon.svg"
                  : "/img/warn_icon.svg"
              }
              height="24px"
              width="24px"
              className="status-icon"
            />
          </div>
          <div>
            <button tabIndex={-1}>
              <img height="20px" width="20px" className="attach-icon" src="/img/attach_icon.svg" />
              sourcemaps
              <input
                id="sourcemap"
                type="file"
                multiple
                accept=".map"
                ref={this.sourceMapInput}
                onInput={() => this.onSourceMapInput()}
              />
            </button>
            <img
              src={
                this.hasSourceMapFile(this.state.sourceMapFiles) || this.props.imported 
                  ? "/img/ok_icon.svg"
                  : "/img/warn_icon.svg"
              }
              height="24px"
              width="24px"
              className="status-icon"
            />
          </div>
          <div>
            <button
              disabled={
                !this.canProcess(
                  this.state.sourceMapFiles,
                  this.state.graphFile
                )
              }
              onClick={() => this.processFiles()}
            >
              Import
            </button>
          </div>
        </div>
        {!resolve && (
          <div className="col-container">
            <div className="import-instruction">
              <h3>How to create assets from Webpack:</h3>
              <div className="col-container">
                <div>
                  <h5>{this.props.graphFileName}</h5>
                  <p>via command line</p>
                  <code>
                    <pre>
                      <span className="add-diff">
                        webpack --profile --json > stats.json
                      </span>
                    </pre>
                    <button
                      onClick={() =>
                        toClipboard("webpack --profile --json > stats.json")
                      }
                      className="copy-button"
                      aria-label="Copy stats.json CLI command to clipboard"
                    />
                  </code>
                  <p>via programatic compilation </p>
                  <code>
                    <pre>
                      {`const webpack = require("webpack");
webpack({
// Configuration Object
}, (err, stats) => {
if (err) {
    console.error(err);
    return;
}`}
                      <span className="add-diff">
                        {`
fs.writeFileSync(
  path.join(__dirname, "stats.json"), 
  JSON.stringify(stats.toJson()), 
  'utf-8');
});
`}
                      </span>
                    </pre>
                    <button
                      onClick={() =>
                        toClipboard(`fs.writeFileSync(path.join(__dirname, "stats.json"), JSON.stringify(stats.toJson()), 'utf-8')`)
                      }
                      className="copy-button"
                      aria-label="Copy stats.json programatic snippit to clipboard"
                    />
                  </code>
                </div>
                <div>
                  <h5>sourcemaps</h5>
                  <p>webpack.conf.js</p>
                  <code>
                    <pre>
                      <span className="add-diff">devtool: "source-map"</span>
                    </pre>
                    <button
                      onClick={() => toClipboard("devtool: 'source-map'")}
                      className="copy-button"
                      aria-label="Copy sourcemap snippet to clipboard"
                    />
                  </code>
                </div>
              </div>
              <h3>How to create assets from Create React App:</h3>{" "}
              <h5>sourcemaps & bundle-stats.json</h5>
              <p>Using yarn, your project directory run: </p>
              <code>
                <pre>
                  <span className="add-diff">
                    GENERATE_SOURCEMAP=true yarn run build -- --stats
                    </span ><br/>
                </pre>
                <button
                  onClick={() => toClipboard("devtool: 'source-map'")}
                  className="copy-button"
                  aria-label="Copy sourcemap snippet to clipboard"
                />
              </code>
                 <p>Using npm, your project directory run: </p>
              <code>
                <pre>
     
                <span className="add-diff">
                GENERATE_SOURCEMAP=true npm run build -- --stats
                    </span>
                </pre>
                <button
                  onClick={() => toClipboard("devtool: 'source-map'")}
                  className="copy-button"
                  aria-label="Copy sourcemap snippet to clipboard"
                />
              </code>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default WebpackImport;
