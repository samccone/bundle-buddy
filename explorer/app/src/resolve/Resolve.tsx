import React, { Component } from "react";
import { GraphNodes } from "../import/graph_process";
import { ProcessedSourceMap } from "../import/process_sourcemaps";
// noopener noreferrer

const DEBUG_PROCESSED_SOURCE_MAP: ProcessedSourceMap  = {};
const DEBUG_GRAPH_NODES: GraphNodes = [];


class Resolve extends Component<{graphNodes: GraphNodes; processedSourceMap: ProcessedSourceMap}> {
    constructor(props: {graphNodes: GraphNodes; processedSourceMap: ProcessedSourceMap }) {
        super(props);
        console.log(props);
    }

    state: {
    } = {
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

    render() {
        return <div>
            <h3> Source map files</h3>
            <ul>
               {Resolve.sorted(Object.keys(this.props.processedSourceMap || DEBUG_PROCESSED_SOURCE_MAP)).map(v => <li>{v}</li>)}
            </ul>
            <h3>Graph source files</h3>
            <ul>
               {Resolve.sorted(Object.keys(this.props.graphNodes || DEBUG_GRAPH_NODES)).map(v => <li>{v}</li>)}
            </ul>
        </div>
    }
}

export default Resolve;