import { statsToGraph } from "../stats_to_graph";
import { readFileAsText, readFilesAsText } from "../file_reader";
import { toClipboard } from "../clipboard";
import { processImports, buildImportErrorReport } from "../process_imports";
import {
  ImportProps,
  ImportResolveState,
  ImportState,
  ProcessedSourceMap,
} from "../../types";

import React, { Component } from "react";
import { cleanGraph } from "../graph_process";
import { storeResolveState } from "../../routes";
// noopener noreferrer

const IGNORE_FILES = [
  // https://twitter.com/samccone/status/1137776153148583936
  "webpack/bootstrap",
];

function removeWebpackMagicFiles(v: ProcessedSourceMap) {
  const ret: ProcessedSourceMap = {
    totalBytes: v.totalBytes,
    files: {},
  };
  for (const k of Object.keys(v.files)) {
    let skip = false;
    for (const i of IGNORE_FILES) {
      if (k.endsWith(i)) {
        skip = true;
      }
    }
    if (!skip) {
      ret.files[k] = v.files[k];
    }
  }

  return ret;
}

class CRAImport extends Component<ImportProps, ImportState> {
  sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
  statsInput?: React.RefObject<HTMLInputElement & { files: FileList }>;

  constructor(props: ImportProps) {
    super(props);
    this.sourceMapInput = React.createRef();
    this.statsInput = React.createRef();
  }

  state: ImportState = {};
  hasStatsFile(f: File | undefined) {
    return f != null || window.location.pathname.includes("resolve");
  }

  hasSourceMapFile(f: File[] | undefined) {
    return (
      (f != null && f.length) || window.location.pathname.includes("resolve")
    );
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
      graphEdges: statsFileContents,
      graphPreProcessFn: (g) => cleanGraph(statsToGraph(g)),
    });

    if (processed.processedSourcemap != null) {
      processed.processedSourcemap = removeWebpackMagicFiles(
        processed.processedSourcemap
      );
    }

    const { importError, importErrorUri } = buildImportErrorReport(processed, {
      graphFile: this.state.graphFile,
      sourceMapFiles: this.state.sourceMapFiles,
    });

    this.setState({
      importError,
      importErrorUri,
    });

    // We only want to go to the resolve screen if there are no errors.
    if (this.props.history != null && this.state.importError == null) {
      const state: ImportResolveState = {
        graphEdges: processed.processedGraph!,
        processedSourceMap: processed.processedSourcemap!,
      };

      this.props.history.push(
        "/create-react-app/resolve",
        storeResolveState(state)
      );
    }
  }

  protected onStatsInput() {
    if (
      this.statsInput != null &&
      this.statsInput.current != null &&
      this.statsInput.current.files.length
    ) {
      this.setState(
        {
          graphFile: this.statsInput.current.files[0],
        },
        () => {
          if (
            this.canProcess(this.state.sourceMapFiles, this.state.graphFile)
          ) {
            this.processFiles();
          }
        }
      );
    } else {
      this.setState({
        graphFile: undefined,
      });
    }
  }

  protected onSourceMapInput() {
    if (
      this.sourceMapInput != null &&
      this.sourceMapInput.current != null &&
      this.sourceMapInput.current.files.length
    ) {
      this.setState(
        {
          sourceMapFiles: Array.from(this.sourceMapInput.current.files),
        },
        () => {
          if (
            this.canProcess(this.state.sourceMapFiles, this.state.graphFile)
          ) {
            this.processFiles();
          }
        }
      );
    } else {
      this.setState({
        sourceMapFiles: undefined,
      });
    }
  }

  render() {
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
        <div>
          <h3>Upload assets:</h3>
          <div className="upload-files-container flex">
            <div className="button-import-container">
              <button className="import-asset" tabIndex={-1}>
                <img
                  height="20px"
                  width="20px"
                  className="attach-icon"
                  alt="attach file"
                  src="/img/attach_icon.svg"
                />
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
                  this.hasStatsFile(this.state.graphFile)
                    ? "/img/ok_icon.svg"
                    : "/img/warn_icon.svg"
                }
                alt={
                  this.hasStatsFile(this.state.graphFile)
                    ? "OK import"
                    : "missing import"
                }
                height="24px"
                width="24px"
                className="status-icon"
              />
            </div>

            <div className="button-import-container">
              <button tabIndex={-1} className="import-asset">
                <img
                  height="20px"
                  width="20px"
                  className="attach-icon"
                  alt="attach file"
                  src="/img/attach_icon.svg"
                />
                sourcemaps
                <input
                  id="sourcemap"
                  type="file"
                  multiple
                  accept=".map,.sourcemap"
                  ref={this.sourceMapInput}
                  onInput={() => this.onSourceMapInput()}
                />
              </button>
              <img
                src={
                  this.hasSourceMapFile(this.state.sourceMapFiles)
                    ? "/img/ok_icon.svg"
                    : "/img/warn_icon.svg"
                }
                alt={
                  this.hasSourceMapFile(this.state.sourceMapFiles)
                    ? "OK import"
                    : "missing import"
                }
                height="24px"
                width="24px"
                className="status-icon"
              />
            </div>
          </div>
        </div>
        <div className="col-container">
          <div className="right-spacing">
            <p>Using yarn, in your project directory run: </p>
            <code>
              <pre>
                <span className="add-diff">
                  GENERATE_SOURCEMAP=true yarn run build -- --stats
                </span>
                <br />
              </pre>
              <button
                onClick={() => toClipboard("devtool: 'source-map'")}
                className="copy-button"
                aria-label="Copy sourcemap snippet to clipboard"
              />
            </code>
          </div>
          <div>
            {" "}
            <p>Or, using npm, in your project directory run: </p>
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
      </div>
    );
  }
}

export default CRAImport;
