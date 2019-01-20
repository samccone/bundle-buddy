import React, { Component } from "react";
import { GraphNodes } from "../import/graph_process";
import { ProcessedSourceMap } from "../import/process_sourcemaps";
import * as data from "./data";
import { transform } from "./process";
import { ResolveProps, ProcessedImportState } from "../types";
import { findCommonPrefix } from "../import/prefix_cleaner";

// noopener noreferrer

const DEBUG_PROCESSED_SOURCE_MAP: ProcessedSourceMap = data.processedSourceMap;
const DEBUG_GRAPH_NODES: GraphNodes = data.processedGraph;

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
  graphTransform: (v: string) => string
): GraphNodes {
  return nodes.map(n => {
    n.source = graphTransform(n.source);
    if (n.target != null) {
      n.target = graphTransform(n.target);
    }
    return n;
  });
}

function transformSourceMapNames(
  sourcemap: ProcessedSourceMap,
  sourcemapTransform: (v: string) => string
): ProcessedSourceMap {
  const ret: ProcessedSourceMap = {};

  for (const fileName of Object.keys(sourcemap)) {
    ret[sourcemapTransform(fileName)] = sourcemap[fileName];
  }

  return ret;
}

export interface ResolveState {
  sourceMapFiles: string[];
  transforms: {
    sourceMapFileTransform: (v: string) => string;
    graphFileTransform: (v: string) => string;
  };
  graphFiles: string[];
  resolveError?: string;
}

class Resolve extends Component<ResolveProps, ResolveState> {
  sourceMapTransformRef?: React.RefObject<HTMLTextAreaElement>;
  sourceGraphTransformRef?: React.RefObject<HTMLTextAreaElement>;

  state: ResolveState = {
    sourceMapFiles: [],
    graphFiles: [],
    transforms: {
      sourceMapFileTransform: (v: string) => v,
      graphFileTransform: (v: string) => v
    }
  };

  constructor(props: ResolveProps) {
    super(props);

    this.sourceMapTransformRef = React.createRef();
    this.sourceGraphTransformRef = React.createRef();

    this.state = {
      sourceMapFiles: this.getSourceMapFiles(
        props.processedSourceMap || DEBUG_PROCESSED_SOURCE_MAP
      ),
      graphFiles: this.getGraphFiles(props.graphNodes || DEBUG_GRAPH_NODES),
      transforms: {
        sourceMapFileTransform: (v: string) => v,
        graphFileTransform: (v: string) => v
      }
    };
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

  getGraphFiles(graphNodes: GraphNodes) {
    const ret = new Set<string>();

    for (const node of graphNodes) {
      ret.add(node.source);
      if (node.target) {
        ret.add(node.target);
      }
    }

    return Array.from(ret);
  }

  getSourceMapFiles(processedSourceMap: ProcessedSourceMap) {
    const fileNames = Object.keys(processedSourceMap);
    const prefix = (findCommonPrefix(fileNames) || "").length;

    if (prefix) return fileNames.map(d => d.slice(prefix));

    return fileNames;
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
        this.state.transforms.graphFileTransform
      ),
      transformSourceMapNames(
        this.props.processedSourceMap,
        this.state.transforms.sourceMapFileTransform
      )
    );

    this.props.history.push("/bundle", processed);
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
        <h5>Resolve sourcemap and stats</h5>
        <button onClick={() => this.import()}>Import</button>
        <div className="col-container">
          <div>
            <h3> Source map files</h3>
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
            <h3>Graph source files</h3>
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
      </div>
    );
  }
}

export default Resolve;
