import React, { Component } from "react";
import { toClipboard } from "../clipboard";
import { readFileAsText, readFilesAsText } from "../file_reader";
import { processImports, buildImportErrorReport } from "../process_imports";
import { ImportProps, ImportResolveState, ImportState } from "../../types";

// noopener noreferrer
class RollupImport extends Component<ImportProps, ImportState> {
  sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
  graphInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
  generateGraphContents: React.RefObject<HTMLSpanElement>;

  constructor(props: ImportProps) {
    super(props);

    this.sourceMapInput = React.createRef();
    this.graphInput = React.createRef();
    this.generateGraphContents = React.createRef();
  }

  state: ImportState = {};

  onGraphInput() {
    if (
      this.graphInput != null &&
      this.graphInput.current != null &&
      this.graphInput.current.files.length
    ) {
      this.setState({
        graphFile: this.graphInput.current.files[0]
      });
    } else {
      this.setState({
        graphFile: undefined
      });
    }
  }

  onSourceMapInput() {
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

  hasGraphFile(file?: File) {
    return file != null;
  }

  hasSourceMapFile(files?: File[]) {
    return files != null && files.length;
  }

  canProcess(sourceMapFiles: File[] | undefined, graphFile: File | undefined) {
    return sourceMapFiles != null && sourceMapFiles.length && graphFile != null;
  }

  async processFiles() {
    if (this.state.graphFile == null || this.state.sourceMapFiles == null) {
      return;
    }

    const graphContents = await readFileAsText(this.state.graphFile);
    const sourceMapContents = await readFilesAsText(this.state.sourceMapFiles);

    const processed = await processImports({
      sourceMapContents,
      graphNodes: graphContents
    });

    const { importError, importErrorUri } = buildImportErrorReport(processed, {
      graphFile: this.state.graphFile,
      sourceMapFiles: this.state.sourceMapFiles
    });

    this.setState({
      importError,
      importErrorUri
    });

    if (this.props.history != null && this.state.importError == null) {
      const state: ImportResolveState = {
        graphNodes: processed.processedGraph!,
        processedSourceMap: processed.proccessedSourcemap!
      };

      this.props.history.push("/rollup/resolve", state);
    }
  }

  render() {
    const resolve = window.location.pathname.indexOf("resolve") !== -1;

    return (
      <div>
        <div>
          {this.state.importError != null ? (
            <div className="error">
              <h2>Import error</h2>
              <code>
                <pre>{`${this.state.importError}`}</pre>
              </code>
              <a href={this.state.importErrorUri || ''} target="_blank">
                File a bug
              </a>
            </div>
          ) : null}
          <h5>Upload assets</h5>
          <div className="upload-files-container flex">
             <div>
              <button tabIndex={-1}>
                <img className="attach-icon" src="/img/attach_icon.svg" />
                graph.json
                <input
                  id="stats"
                  type="file"
                  accept=".json"
                  ref={this.graphInput}
                  onInput={() => this.onGraphInput()}
                />
              </button>
              <img
                src={
                  this.hasGraphFile(this.state.graphFile)|| this.props.imported 
                    ? "/img/ok_icon.svg"
                    : "/img/warn_icon.svg"
                }
                className="status-icon"
              />
            </div>
            <div>
              <button tabIndex={-1}>
                <img className="attach-icon" src="/img/attach_icon.svg" />
                sourcemaps
                <input
                  id="sourcemap"
                  multiple
                  type="file"
                  accept=".map"
                  ref={this.sourceMapInput}
                  onInput={() => this.onSourceMapInput()}
                />
              </button>
              <img
                src={
                  this.hasSourceMapFile(this.state.sourceMapFiles)|| this.props.imported 
                    ? "/img/ok_icon.svg"
                    : "/img/warn_icon.svg"
                }
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
                Import project
              </button>
            </div>
          </div>
          {!resolve && (
            <div className="col-container">
              <div className="col-narrow" />
              <div className="import-instruction">
                <div className="col-container">
                  
                  <div>
                    <h5>graph.json</h5>
                    <p>via rollup.config.js</p>
                    <code>
                      <pre>
                        <span
                          id="rollup-generate-graph"
                          ref={this.generateGraphContents}
                          className="add-diff"
                        >
                          {`
plugins: [{
    buildEnd() {
        const deps = [];
        for(const id of this.moduleIds) {
            let m = this.getModuleInfo(id);
            if (m != null && !m.isExternal) {
                for (const source of m.importedIds) {
                    deps.push({ target: m.id, source})
                }
            }
        }
        
        fs.writeFileSync(
            path.join(__dirname, 'graph.json'), 
            JSON.stringify(deps, null, 2));
    },
}]`}
                        </span>
                      </pre>
                      <button
                        onClick={() =>
                          toClipboard(
                            this.generateGraphContents.current!.textContent ||
                              ""
                          )
                        }
                        className="copy-button"
                        aria-label="Copy stats.json programatic snippit to clipboard"
                      />
                    </code>
                  </div>
                  <div>
                    <h5>sourcemap</h5>
                    <p>via rollup.config.js</p>
                    <code>
                      <pre>
                        {`output: { 
    file: '\`\${outFolder}/dist.js',
    format: 'iife',
    name: 'PROJECT_NAME',\n`}
                        <span className="add-diff">
                          &nbsp;&nbsp;&nbsp;&nbsp;sourcemap: true,
                        </span>
                        {`
}`}
                      </pre>
                      <button
                        onClick={() => toClipboard("sourcemap: true,")}
                        className="copy-button"
                        aria-label="Copy sourcemap snippet to clipboard"
                      />
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default RollupImport;
