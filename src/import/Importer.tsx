import React, { Component } from "react";
import { toClipboard } from "./clipboard";
import { readFileAsText, readFilesAsText } from "./file_reader";
import { processImports, buildImportErrorReport } from "./process_imports";
import {
  ImportProps,
  ImportResolveState,
  ImportState,
  ImportTypes,
  EsBuildMetadata,
} from "../types";
import { storeResolveState } from "../routes";
import { toEdges, toProcessedBundles } from "./esbuild";
import { mergeProcessedBundles } from "./process_sourcemaps";

// noopener noreferrer
class Import extends Component<ImportProps, ImportState> {
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
      this.setState(
        {
          graphFile: this.graphInput.current.files[0],
        },
        () => {
          if (
            this.canProcess(
              this.state.sourceMapFiles,
              this.state.graphFile,
              this.props.importType
            )
          ) {
            this.processFiles(this.props.importType);
          }
        }
      );
    } else {
      this.setState({
        graphFile: undefined,
      });
    }
  }

  onSourceMapInput() {
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
            this.canProcess(
              this.state.sourceMapFiles,
              this.state.graphFile,
              this.props.importType
            )
          ) {
            this.processFiles(this.props.importType);
          }
        }
      );
    } else {
      this.setState({
        sourceMapFiles: undefined,
      });
    }
  }

  hasGraphFile(file?: File) {
    return file != null || window.location.pathname.includes("resolve");
  }

  hasSourceMapFile(files?: File[]) {
    return (
      (files != null && files.length) ||
      window.location.pathname.includes("resolve")
    );
  }

  canProcess(
    sourceMapFiles: File[] | undefined,
    graphFile: File | undefined,
    importType: ImportTypes
  ) {
    // ESBuild does not need sourcemap files.
    if (importType === ImportTypes.ESBUILD) {
      return graphFile != null;
    }

    return sourceMapFiles != null && sourceMapFiles.length && graphFile != null;
  }

  async processFiles(importType: ImportTypes) {
    if (importType === ImportTypes.ESBUILD && this.state.graphFile != null) {
      const graphContents = JSON.parse(
        await readFileAsText(this.state.graphFile)
      ) as EsBuildMetadata;

      const state: ImportResolveState = {
        graphEdges: toEdges(graphContents),
        processedSourceMap: mergeProcessedBundles(
          toProcessedBundles(graphContents)
        ),
      };

      this.props.history.push(
        `/${this.props.importType}/resolve`,
        storeResolveState(state)
      );
      return;
    }

    if (this.state.graphFile == null || this.state.sourceMapFiles == null) {
      return;
    }

    const graphContents = await readFileAsText(this.state.graphFile);
    const sourceMapContents = await readFilesAsText(this.state.sourceMapFiles);

    const processed = await processImports({
      sourceMapContents,
      graphEdges: graphContents,
    });

    const { importError, importErrorUri } = buildImportErrorReport(processed, {
      graphFile: this.state.graphFile,
      sourceMapFiles: this.state.sourceMapFiles,
    });

    this.setState({
      importError,
      importErrorUri,
    });

    if (this.props.history != null && this.state.importError == null) {
      const state: ImportResolveState = {
        graphEdges: processed.processedGraph!,
        processedSourceMap: processed.processedSourcemap!,
      };

      this.props.history.push(
        `/${this.props.importType}/resolve`,
        storeResolveState(state)
      );
    }
  }

  disableSourceMapInput(importType: ImportTypes) {
    if (importType === ImportTypes.ESBUILD) {
      return true;
    }

    return false;
  }

  render() {
    const type = this.props.importType;
    let graph, sourcemaps, instructions;

    if (type === ImportTypes.ROLLUP) {
      graph = (
        <div>
          <p>rollup.config.js</p>
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
  for (const id of this.getModuleIds()) {
    const m = this.getModuleInfo(id);
    if (m != null && !m.isExternal) {
      for (const target of m.importedIds) {
        deps.push({ source: m.id, target })
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
                  this.generateGraphContents.current!.textContent || ""
                )
              }
              className="copy-button"
              aria-label="Copy stats.json programatic snippit to clipboard"
            />
          </code>
        </div>
      );
      sourcemaps = (
        <div>
          <p>rollup.config.js</p>
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
      );
    } else if (type === ImportTypes.ROME) {
      instructions = (
        <div>
          <p>
            Run the <code>bundle</code> command of rome to generate the
            sourcemap files and bundlebuddy.json for your project
          </p>
          <code>
            <pre>rome bundle .</pre>
          </code>
        </div>
      );
    } else if (type === ImportTypes.PARCEL) {
      instructions = (
        <div>
          <p>
            run <code>BUNDLE_BUDDY=true parcel build</code>&nbsp; to generate
            the sourcemap files and bundle-buddy.json file for your project
          </p>
          <code>
            <pre>BUNDLE_BUDDY=true parcel build</pre>
          </code>
        </div>
      );
    } else if (type === ImportTypes.ESBUILD) {
      instructions = (
        <div>
          <p>
            Run the <code>--bundle</code> command of <code>esbuild</code> with{" "}
            <code>--metafile=esbuild</code> to generate the metadata file to
            understand your project.
          </p>
          <code>
            <pre>esbuild --bundle --metafile</pre>
          </code>
        </div>
      );
    }

    return (
      <div>
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
          <h3>Upload assets:</h3>
          <div className="upload-files-container flex">
            <div className="right-spacing">
              <div className="button-import-container">
                <button tabIndex={-1} className="import-asset">
                  <img
                    height="20px"
                    width="20px"
                    className="attach-icon"
                    alt="attach file"
                    src="/img/attach_icon.svg"
                  />
                  {this.props.graphFileName}
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
                    this.hasGraphFile(this.state.graphFile)
                      ? "/img/ok_icon.svg"
                      : "/img/warn_icon.svg"
                  }
                  height="24px"
                  width="24px"
                  alt={
                    this.hasGraphFile(this.state.graphFile)
                      ? "OK import"
                      : "missing import"
                  }
                  className="status-icon"
                />
              </div>
              {graph}
            </div>
            {this.disableSourceMapInput(this.props.importType) ? null : (
              <div className="right-spacing">
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
                      multiple
                      type="file"
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
                    height="24px"
                    width="24px"
                    alt={
                      this.hasSourceMapFile(this.state.sourceMapFiles)
                        ? "OK import"
                        : "missing import"
                    }
                    className="status-icon"
                  />
                </div>
                {sourcemaps}
              </div>
            )}
          </div>

          <div className="import-instruction">{instructions}</div>
        </div>
      </div>
    );
  }
}

export default Import;
