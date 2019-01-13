import { statsToGraph } from "../stats_to_graph";
import { readFileAsText } from "../file_reader";
import { toClipboard } from "../clipboard";
import { processImports, buildImportErrorReport } from "../process_imports";
import { ImportProps, ImportResolveState } from "../../types";

import React, { Component } from "react";
// noopener noreferrer

class WebpackImport extends Component<ImportProps> {
  sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
  statsInput?: React.RefObject<HTMLInputElement & { files: FileList }>;

  constructor(props: ImportProps) {
    super(props);
    this.sourceMapInput = React.createRef();
    this.statsInput = React.createRef();
  }

  state: {
    sourceMapFile?: File;
    statsFile?: File;
    importError?: string;
    importErrorUri?: string;
  } = {};

  hasStatsFile(f: File | undefined) {
    return f != null;
  }

  hasSourceMapFile(f: File | undefined) {
    return f != null;
  }

  canProcess(statsFile: File | undefined, sourceMapFile: File | undefined) {
    return statsFile != null && sourceMapFile != null;
  }

  private async processFiles() {
    if (this.state.statsFile == null || this.state.sourceMapFile == null) {
      return;
    }

    const statsFileContents = await readFileAsText(this.state.statsFile);
    const sourceMapContents = await readFileAsText(this.state.sourceMapFile);

    const processed = await processImports({
      sourceMapContents,
      graphNodes: statsFileContents,
      graphPreProcessFn: statsToGraph
    });

    const { importError, importErrorUri } = buildImportErrorReport(processed, {
      graphFile: this.state.statsFile,
      sourceMapFile: this.state.sourceMapFile
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

      this.props.history.push("/resolve", state);
    }
  }

  protected onStatsInput() {
    if (
      this.statsInput != null &&
      this.statsInput.current != null &&
      this.statsInput.current.files.length
    ) {
      this.setState({
        statsFile: this.statsInput.current.files[0]
      });
    } else {
      this.setState({
        statsFile: undefined
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
        sourceMapFile: this.sourceMapInput.current.files[0]
      });
    } else {
      this.setState({
        sourceMapFile: undefined
      });
    }
  }

  render() {
    return (
      <div>
        {this.state.importError != null ? (
          <div className="import-error">
            <h2>Import error</h2>
            <code>
              <pre>{`${this.state.importError}`}</pre>
            </code>
            <a href={this.state.importErrorUri} target="_blank">
              File a bug
            </a>
          </div>
        ) : null}
        <h5>Upload assets</h5>
        <div className="upload-files-container flex">
          <div>
            <button tabIndex={-1}>
              <img className="attach-icon" src="/img/attach_icon.svg" />
              sourcemap
              <input
                id="sourcemap"
                type="file"
                ref={this.sourceMapInput}
                onInput={() => this.onSourceMapInput()}
              />
            </button>
            <img
              src={
                this.hasSourceMapFile(this.state.sourceMapFile)
                  ? "/img/ok_icon.svg"
                  : "/img/warn_icon.svg"
              }
              className="status-icon"
            />
          </div>
          <div>
            <button tabIndex={-1}>
              <img className="attach-icon" src="/img/attach_icon.svg" />
              stats.json
              <input
                id="stats"
                type="file"
                ref={this.statsInput}
                onInput={() => this.onStatsInput()}
              />
            </button>
            <img
              src={
                this.hasStatsFile(this.state.statsFile)
                  ? "/img/ok_icon.svg"
                  : "/img/warn_icon.svg"
              }
              className="status-icon"
            />
          </div>

          <div>
            <button
              disabled={
                !this.canProcess(this.state.sourceMapFile, this.state.statsFile)
              }
              onClick={() => this.processFiles()}
            >
              Import
            </button>
          </div>
        </div>
        <div className="col-container">
          <div className="import-instruction">
            <div className="col-container">
              <div>
                <h5>sourcemap</h5>
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
              <div>
                <h5>stats.json</h5>
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
fs.writeJSONSync(path.join(__dirname, "stats.json"), 
    stats.toJson())
});
`}
                    </span>
                  </pre>
                  <button
                    onClick={() =>
                      toClipboard(`fs.writeJSONSync(path.join(__dirname, "stats.json"), 
    stats.toJson())
});`)
                    }
                    className="copy-button"
                    aria-label="Copy stats.json programatic snippit to clipboard"
                  />
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WebpackImport;
