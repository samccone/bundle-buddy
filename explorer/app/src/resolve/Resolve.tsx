import React, { Component } from "react";
import { GraphNodes } from "../import/graph_process";
import { ProcessedSourceMap } from "../import/process_sourcemaps";
import { transform } from "./process";
import { ResolveProps, ProcessedImportState } from "../types";
import { findCommonPrefix, findFirstIndex } from "../import/prefix_cleaner";
import { History } from "history";
import { findTrims } from "./trim";

// noopener noreferrer

export interface ResolveState {
  sourceMapFiles: string[];
  transforms: {
    sourceMapFileTransform: (v: string) => string;
    graphFileTransform: (v: string) => string;
  };
  graphFiles: string[];
  resolveError?: string;
}

function toFunctionRef(func: string) {
  let ref: any;
  try {
    ref = eval(`(${func})`);
  } catch (e) {
    alert(`unable to compile transform due to ${e}`);
  }

  return ref;
}

function transformGraphNames(
  nodes: GraphNodes,
  graphTransform: (v: string) => string,
  trims: string[],
): GraphNodes {
  return nodes.map(n => {
    n.source = graphTransform(trimClean(trims, n.source));
    if (n.target != null) {
      n.target = graphTransform(trimClean(trims, n.target));
    }
    return n;
  });
}

function transformSourceMapNames(
  sourcemap: ProcessedSourceMap,
  sourcemapTransform: (v: string) => string,
  trims: string[]
): ProcessedSourceMap {
  const ret: ProcessedSourceMap = {};

  for (const fileName of Object.keys(sourcemap)) {
    ret[sourcemapTransform(trimClean(trims, fileName))] = sourcemap[fileName];
  }

  return ret;
}

function getGraphFiles(graphNodes: GraphNodes) {
    const ret = new Set<string>();

    for (const node of graphNodes) {
      ret.add(node.source);
      if (node.target) {
        ret.add(node.target);
      }
    }

    return Array.from(ret);
  }

function trimClean(trims: string[], word: string) {
  for (const t of trims) {
        if (word.startsWith(t)) {
            return word.slice(t.length);
          }
        }
        return word;
}

function autoclean(opts: {processedSourceMap: ProcessedSourceMap, graphNodes: GraphNodes}): {sourceMapFiles: string[], graphFiles: string[], trims: string[]} {
    const sourceMapFiles = Object.keys(cleanSouremapFiles(opts.processedSourceMap));
    const graphFiles = getGraphFiles(opts.graphNodes);
    const trims = Object.keys(findTrims(sourceMapFiles, graphFiles));

    return {
      sourceMapFiles: sourceMapFiles.map(v => trimClean(trims, v)),
      graphFiles: graphFiles.map(v => trimClean(trims, v)) ,
      trims,
    };
}

function cleanSouremapFiles(processedSourceMap: ProcessedSourceMap): ProcessedSourceMap {
    const ret: ProcessedSourceMap = {};
    const prefix = (findCommonPrefix(Object.keys(processedSourceMap)) || "");
    if (prefix.length === 0) {
      return processedSourceMap;
    }

    for (const filename of Object.keys(processedSourceMap)) {
      ret[filename.slice(prefix.length)] = processedSourceMap[filename];
    }

    return ret;
  }


class Resolve extends Component<ResolveProps, ResolveState> {
  sourceMapTransformRef?: React.RefObject<HTMLTextAreaElement>;
  sourceGraphTransformRef?: React.RefObject<HTMLTextAreaElement>;

  state: ResolveState;
  trims: string[];

  constructor(props: ResolveProps) {
    super(props);

    this.sourceMapTransformRef = React.createRef();
    this.sourceGraphTransformRef = React.createRef();
    const {sourceMapFiles, graphFiles, trims} = autoclean({processedSourceMap: this.props.processedSourceMap, graphNodes: this.props.graphNodes});
    this.trims = trims;
    this.state = {
      sourceMapFiles,
      graphFiles,
      transforms: {
        sourceMapFileTransform:
          (props.sourceMapFileTransform &&
            toFunctionRef(props.sourceMapFileTransform)) ||
          (fileName => fileName),
        graphFileTransform:
          (props.graphFileTransform &&
            toFunctionRef(props.graphFileTransform)) ||
          (fileName => fileName)
      }
    };

    const sourcemapTransformed = this.transformFiles(
      this.state.sourceMapFiles,
      this.state.graphFiles,
      this.state.transforms.sourceMapFileTransform,
      this.state.transforms.graphFileTransform
    );

    if (sourcemapTransformed.files.length === 0) {
      this.import();
    }
  }

  static sorted<T>(arr: Array<T>) {
    const ret = Array.from(arr);
    ret.sort();
    return ret;
  }

  transformFiles<T>(
    a: Array<T>,
    b: Array<T>,
    aTransform: (v: T) => T,
    bTransform: (v: T) => T
  ): { files: T[]; lastError: undefined | Error } {
    let lastError: Error | undefined = undefined;
    const setA = new Set(
      a.map(v => {
        try {
          return aTransform(v);
        } catch (e) {
          lastError = e;
          return v;
        }
      })
    );
    const setB = new Set(
      b.map(v => {
        try {
          return bTransform(v);
        } catch (e) {
          lastError = e;
          return v;
        }
      })
    );

    const ret: Array<T> = [];
    for (const v of setA) {
      if (!setB.has(v)) {
        ret.push(v);
      }
    }

    return {
      files: ret,
      lastError
    };
  }

  updateSourceMapTransform() {
    if (
      this.sourceMapTransformRef != null &&
      this.sourceMapTransformRef.current != null
    ) {
      const transformRef = toFunctionRef(
        this.sourceMapTransformRef.current.value
      );
      if (transformRef == null) {
        return;
      }

      this.props.history.replace(window.location.pathname, {
        graphNodes: this.props.graphNodes,
        processedSourceMap: this.props.processedSourceMap,
        graphFileTransform: this.state.transforms.graphFileTransform.toString(),
        sourceMapFileTransform: transformRef.toString()
      });

      this.setState({
        transforms: {
          graphFileTransform: this.state.transforms.graphFileTransform,
          sourceMapFileTransform: transformRef
        }
      });
    }
  }

  updateGraphSourceTransform() {
    if (
      this.sourceGraphTransformRef != null &&
      this.sourceGraphTransformRef.current != null
    ) {
      const transformRef = toFunctionRef(
        this.sourceGraphTransformRef.current.value
      );
      if (transformRef == null) {
        return;
      }

      this.props.history.replace(window.location.pathname, {
        graphNodes: this.props.graphNodes,
        processedSourceMap: this.props.processedSourceMap,
        graphFileTransform: transformRef.toString(),
        sourceMapFileTransform: this.state.transforms.sourceMapFileTransform.toString()
      });

      this.setState({
        transforms: {
          graphFileTransform: transformRef,
          sourceMapFileTransform: this.state.transforms.sourceMapFileTransform
        }
      });
    }
  }

  import() {
    if (
      this.props.graphNodes == null ||
      this.props.processedSourceMap == null
    ) {
      throw new Error("Unable to find graphnodes or sourcemap data");
    }
    const processed = transform(
      transformGraphNames(
        this.props.graphNodes,
        this.state.transforms.graphFileTransform,
        this.trims,
      ),
      transformSourceMapNames(
        cleanSouremapFiles(this.props.processedSourceMap),
        this.state.transforms.sourceMapFileTransform,
        this.trims,
      ),
      this.state.sourceMapFiles
    );

    ((this.props.history as unknown) as History<ProcessedImportState>).push(
      "/bundle",
      processed
    );
  }

  formatError(e: Error) {
    return `
${e.message}
\n----------------\n
${e.stack}`;
  }

  render() {
    const sourceMapTransformed = this.transformFiles(
      this.state.sourceMapFiles,
      this.state.graphFiles,
      this.state.transforms.sourceMapFileTransform,
      this.state.transforms.graphFileTransform
    );

    const graphTransformed = this.transformFiles(
      this.state.graphFiles,
      this.state.sourceMapFiles,
      this.state.transforms.graphFileTransform,
      this.state.transforms.sourceMapFileTransform
    );
    return (
      <div className="resolve-conflicts">
     
        <div className="col-container">
          <div>
            <h3>Resolve source map files</h3>
            {sourceMapTransformed.lastError != null ? (
              <div className="error">
                {this.formatError(sourceMapTransformed.lastError)}
              </div>
            ) : null}
            <p>
              {sourceMapTransformed.files.length} unmatched source map files of{" "}
              {this.state.sourceMapFiles.length} total
            </p>
            <textarea
              ref={this.sourceMapTransformRef}
              className="code-editor"
              defaultValue={this.state.transforms.sourceMapFileTransform.toString()}
            />
            <br />
            <button onClick={() => this.updateSourceMapTransform()}>
              update source map transform
            </button>
            <ul>
              {Resolve.sorted(sourceMapTransformed.files).map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Resolve graph source files</h3>
            {graphTransformed.lastError != null ? (
              <div className="error">
                {this.formatError(graphTransformed.lastError)}
              </div>
            ) : null}
            <p>
              {graphTransformed.files.length} unmatched graph files of{" "}
              {this.state.graphFiles.length} total
            </p>
            <textarea
              ref={this.sourceGraphTransformRef}
              className="code-editor"
              defaultValue={this.state.transforms.graphFileTransform.toString()}
            />
            <br />
            <button onClick={() => this.updateGraphSourceTransform()}>
              update graph source transform
            </button>
            <ul>
              {Resolve.sorted(graphTransformed.files).map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="resolved">
        <div className="resolved-message">When sourcemaps and stats are resovled:{" "}
        <button className="good" onClick={() => this.import()}>Go to analysis</button></div></div>
      </div>
    );
  }
}

export default Resolve;
