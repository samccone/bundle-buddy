import React, { Component } from "react";
import { GraphNodes } from "../import/graph_process";
import { ProcessedSourceMap } from "../import/process_sourcemaps";
import * as data from './data';
// noopener noreferrer

const DEBUG_PROCESSED_SOURCE_MAP: ProcessedSourceMap = data.processedSourceMap;
const DEBUG_GRAPH_NODES: GraphNodes = data.processedGraph;


function uniqueIn<T>(a: Array<T>, b: Array<T>, aTransform: (v: T) => T, bTransform: (v: T) => T) {
    const setA = new Set(a.map(v => aTransform(v)));
    const setB = new Set(b.map(v => bTransform(v)));

    const ret: Array<T> = [];
    for (const v of setA) {
        if (!setB.has(v)) {
            ret.push(v);
        }
    }

    return ret;
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

interface ResolveProps { graphNodes?: GraphNodes; processedSourceMap?: ProcessedSourceMap; }; 

class Resolve extends Component<ResolveProps> {
    sourceMapTransformRef?: React.RefObject<HTMLTextAreaElement>;
    sourceGraphTransformRef?: React.RefObject<HTMLTextAreaElement>;

    constructor(props: ResolveProps) {
        super(props);

        this.sourceMapTransformRef = React.createRef();
        this.sourceGraphTransformRef = React.createRef();

        this.state = {
            sourceMapFiles: this.getSourceMapFiles(props.processedSourceMap || DEBUG_PROCESSED_SOURCE_MAP),
            graphFiles: this.getGraphFiles(props.graphNodes || DEBUG_GRAPH_NODES),
            transforms: {
                sourceMapFileTransform: (v: string) => v,
                graphFileTransform: (v: string) => v,
            },
        };
    }

    state: {
        sourceMapFiles: string[];
        transforms: {
            sourceMapFileTransform: (v: string) => string;
            graphFileTransform: (v: string) => string;
        },
        graphFiles: string[]
    } = {
            sourceMapFiles: [],
            graphFiles: [],
            transforms: {
                sourceMapFileTransform: (v: string) => v,
                graphFileTransform: (v: string) => v,
            },
        };

    static sorted<T>(arr: Array<T>) {
        const ret = Array.from(arr);
        ret.sort();
        return ret;
    }

    getGraphFiles(graphNodes: GraphNodes) {
        const ret = new Set();
        for (const node of graphNodes) {
            ret.add(node.source);
            ret.add(node.target);
        }

        return Array.from(ret);
    }

    getSourceMapFiles(processedSourceMap: ProcessedSourceMap) {
        const ret = new Set();
        for (const k of Object.keys(processedSourceMap)) {
            ret.add(k);
        }

        return Array.from(ret);
    }

    updateSourceMapTransform() {
        if (this.sourceMapTransformRef != null && this.sourceMapTransformRef.current != null) {
            const transformRef = toFunctionRef(this.sourceMapTransformRef.current.value);
            if (transformRef == null) {
                return;
            }
            this.setState({
                transforms: {
                    graphFileTransform: this.state.transforms.graphFileTransform,
                    sourceMapFileTransform: transformRef,
                }
            });
        }
    }

    updateGraphSourceTransform() {
        if (this.sourceGraphTransformRef != null && this.sourceGraphTransformRef.current != null) {
            const transformRef = toFunctionRef(this.sourceGraphTransformRef.current.value);
            if (transformRef == null) {
                return;
            }
            this.setState({
                transforms: {
                    graphFileTransform: transformRef,
                    sourceMapFileTransform: this.state.transforms.sourceMapFileTransform,
                }
            });
        }
    }

    render() {
        return <div className="resolve-conflicts">
            <div className="col-container">
                <div>
                    <h3> Source map files</h3>
                    <p>{uniqueIn(this.state.sourceMapFiles, this.state.graphFiles, this.state.transforms.sourceMapFileTransform, this.state.transforms.graphFileTransform).length} unmatched source map files of {this.state.sourceMapFiles.length} total</p>
                    <textarea ref={this.sourceMapTransformRef} className="code-editor" defaultValue={this.state.transforms.sourceMapFileTransform.toString()}>
                    </textarea>
                    <br />
                    <button onClick={() => this.updateSourceMapTransform()}>update source map transform</button>
                    <ul>
                        {Resolve.sorted(uniqueIn(this.state.sourceMapFiles, this.state.graphFiles, this.state.transforms.sourceMapFileTransform, this.state.transforms.graphFileTransform)).map(v => <li key={v}>{v}</li>)}
                    </ul>
                </div>
                <div>
                    <h3>Graph source files</h3>
                    <p>{uniqueIn(this.state.graphFiles, this.state.sourceMapFiles, this.state.transforms.graphFileTransform, this.state.transforms.sourceMapFileTransform).length} unmatched graph files of {this.state.graphFiles.length} total</p>
                    <textarea ref={this.sourceGraphTransformRef} className="code-editor" defaultValue={this.state.transforms.graphFileTransform.toString()}>
                    </textarea>
                    <br />
                    <button onClick={() => this.updateGraphSourceTransform()}>update graph source transform</button>
                    <ul>
                        {Resolve.sorted(uniqueIn(this.state.graphFiles, this.state.sourceMapFiles, this.state.transforms.graphFileTransform, this.state.transforms.sourceMapFileTransform)).map(v => <li key={v}>{v}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    }
}

export default Resolve;