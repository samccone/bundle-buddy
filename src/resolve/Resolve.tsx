import React, {Component} from 'react';
import {transform} from './process';
import {ResolveProps, GraphEdges, ProcessedBundle} from '../types';
import {findTrims} from './trim';
import {storeProcessedState, storeResolveState} from '../routes';

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
    /* eslint-disable-next-line no-eval */
    ref = eval(`(${func})`);
  } catch (e) {
    alert(`unable to compile transform due to ${e}`);
  }

  return ref;
}

function transformGraphNames(
  nodes: GraphEdges,
  graphTransform: (v: string) => string,
  trims: string[]
): GraphEdges {
  return nodes.map(n => {
    n.source = graphTransform(trimClean(trims, n.source));
    if (n.target != null) {
      n.target = graphTransform(trimClean(trims, n.target));
    }
    return n;
  });
}

function transformSourceMapNames(
  sourcemap: ProcessedBundle,
  sourcemapTransform: (v: string) => string,
  trims: string[]
): ProcessedBundle {
  const ret: ProcessedBundle = {
    files: {},
    totalBytes: sourcemap.totalBytes,
  };

  for (const fileName of Object.keys(sourcemap.files)) {
    ret.files[sourcemapTransform(trimClean(trims, fileName))] = sourcemap.files[fileName];
  }

  return ret;
}

function getGraphFiles(graphEdges: GraphEdges) {
  const ret = new Set<string>();

  for (const edge of graphEdges) {
    ret.add(edge.source);
    if (edge.target) {
      ret.add(edge.target);
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

function autoclean(opts: {
  processedSourceMap: ProcessedBundle;
  graphEdges: GraphEdges;
}): {sourceMapFiles: string[]; graphFiles: string[]; trims: string[]} {
  const sourceMapFiles = Object.keys(opts.processedSourceMap.files);
  const graphFiles = getGraphFiles(opts.graphEdges);
  const trims = Object.keys(findTrims(sourceMapFiles, graphFiles));

  return {
    sourceMapFiles: sourceMapFiles.map(v => trimClean(trims, v)),
    graphFiles: graphFiles.map(v => trimClean(trims, v)),
    trims,
  };
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
    const {sourceMapFiles, graphFiles, trims} = autoclean({
      processedSourceMap: this.props.processedBundle,
      graphEdges: this.props.graphEdges,
    });
    this.trims = trims;
    this.state = {
      sourceMapFiles,
      graphFiles,
      transforms: {
        sourceMapFileTransform:
          (props.sourceMapFileTransform && toFunctionRef(props.sourceMapFileTransform)) ||
          (fileName => fileName),
        graphFileTransform:
          (props.graphFileTransform && toFunctionRef(props.graphFileTransform)) ||
          (fileName => fileName),
      },
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
  ): {files: T[]; lastError: undefined | Error} {
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
      lastError,
    };
  }

  updateSourceMapTransform() {
    if (this.sourceMapTransformRef != null && this.sourceMapTransformRef.current != null) {
      const transformRef = toFunctionRef(this.sourceMapTransformRef.current.value);
      if (transformRef == null) {
        return;
      }

      const k = storeResolveState({
        graphEdges: this.props.graphEdges,
        processedSourceMap: this.props.processedBundle,
        graphFileTransform: this.state.transforms.graphFileTransform.toString(),
        bundledFilesTransform: transformRef.toString(),
      });

      this.props.history.replace(window.location.pathname, k);

      this.setState({
        transforms: {
          graphFileTransform: this.state.transforms.graphFileTransform,
          sourceMapFileTransform: transformRef,
        },
      });
    }
  }

  updateGraphSourceTransform() {
    if (this.sourceGraphTransformRef != null && this.sourceGraphTransformRef.current != null) {
      const transformRef = toFunctionRef(this.sourceGraphTransformRef.current.value);
      if (transformRef == null) {
        return;
      }

      const k = storeResolveState({
        graphEdges: this.props.graphEdges,
        processedSourceMap: this.props.processedBundle,
        graphFileTransform: transformRef.toString(),
        bundledFilesTransform: this.state.transforms.sourceMapFileTransform.toString(),
      });

      this.props.history.replace(window.location.pathname, k);

      this.setState({
        transforms: {
          graphFileTransform: transformRef,
          sourceMapFileTransform: this.state.transforms.sourceMapFileTransform,
        },
      });
    }
  }

  import() {
    if (this.props.graphEdges == null || this.props.processedBundle == null) {
      throw new Error('Unable to find graph edges or sourcemap data');
    }

    const processed = transform(
      transformGraphNames(
        this.props.graphEdges,
        this.state.transforms.graphFileTransform,
        this.trims
      ),
      transformSourceMapNames(
        this.props.processedBundle,
        this.state.transforms.sourceMapFileTransform,
        this.trims
      ),
      this.state.sourceMapFiles
    );

    this.props.history.push('/bundle', storeProcessedState(processed));
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
            <p className="ft-18">Resolve source map files:</p>
            {sourceMapTransformed.lastError != null ? (
              <div className="error">{this.formatError(sourceMapTransformed.lastError)}</div>
            ) : null}
            <small>
              <span className={`${sourceMapTransformed.files.length === 0 ? 'primary' : ''}`}>
                {sourceMapTransformed.files.length}
              </span>{' '}
              source map files of {this.state.sourceMapFiles.length} total need resolving
            </small>
            <textarea
              ref={this.sourceMapTransformRef}
              className="code-editor"
              defaultValue={this.state.transforms.sourceMapFileTransform.toString()}
            />
            <br />
            <button onClick={() => this.updateSourceMapTransform()}>retry transform</button>
            <ul>
              {Resolve.sorted(sourceMapTransformed.files).map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ft-18">Resolve graph source files:</p>
            {graphTransformed.lastError != null ? (
              <div className="error">{this.formatError(graphTransformed.lastError)}</div>
            ) : null}
            <small>
              <span className={`${graphTransformed.files.length === 0 ? 'primary' : ''}`}>
                {graphTransformed.files.length}
              </span>{' '}
              graph files of {this.state.graphFiles.length} total need resolving
            </small>
            <textarea
              ref={this.sourceGraphTransformRef}
              className="code-editor"
              defaultValue={this.state.transforms.graphFileTransform.toString()}
            />
            <br />
            <button onClick={() => this.updateGraphSourceTransform()}>Retry transform</button>
            <ul>
              {Resolve.sorted(graphTransformed.files).map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="resolved">
          <div className="resolved-message">
            <button className="good" onClick={() => this.import()}>
              Go to analysis
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Resolve;
