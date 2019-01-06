import React, { Component } from "react";
import { toClipboard } from '../clipboard';
import { readFileAsText } from '../file_reader';
import { processImports, buildImportErrorReport } from "../process_imports";
import { ImportProps, ImportResolveState } from "../../types";

// noopener noreferrer
class RollupImport extends Component<ImportProps> {
    sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
    graphInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
    generateGraphContents: React.RefObject<HTMLSpanElement>;

    constructor(props: ImportProps) {
        super(props);

        this.sourceMapInput = React.createRef();
        this.graphInput = React.createRef();
        this.generateGraphContents = React.createRef();
    }

    state: {
        sourceMapFile?: File;
        graphFile?: File;
        importError?: string;
        importErrorUri?: string;
    } = {
        };

    onGraphInput() {
        if (this.graphInput != null && this.graphInput.current != null && this.graphInput.current.files.length) {
            this.setState({
                'graphFile': this.graphInput.current.files[0]
            })
        } else {
            this.setState({
                'graphFile': undefined
            })
        }
    }

    onSourceMapInput() {
        if (this.sourceMapInput != null && this.sourceMapInput.current != null && this.sourceMapInput.current.files.length) {
            this.setState({
                'sourceMapFile': this.sourceMapInput.current.files[0]
            })
        } else {
            this.setState({
                'sourceMapFile': undefined
            })
        }
    }

    hasGraphFile(file?: File) {
        return file != null;
    }

    hasSourceMapFile(file?: File) {
        return file != null;
    }

    canProcess(sourceMapFile: File | undefined, graphFile: File | undefined) {
        return sourceMapFile != null && graphFile != null;
    }

    async processFiles() {
        if (this.state.graphFile == null || this.state.sourceMapFile == null) {
            return
        }

        const graphContents = await readFileAsText(this.state.graphFile);
        const sourceMapContents = await readFileAsText(this.state.sourceMapFile);

        const processed = await processImports({
            sourceMapContents,
            graphNodes: graphContents,
        });

        const { importError, importErrorUri } = buildImportErrorReport(processed, {
            graphFile: this.state.graphFile,
            sourceMapFile: this.state.sourceMapFile
        });

        this.setState({
            importError,
            importErrorUri,
        });

        if (this.props.history != null) {
            const state: ImportResolveState = {
                graphNodes: processed.processedGraph!,
                processedSourceMap: processed.proccessedSourcemap!,
            };

            this.props.history.push('/resolve', state);
        }
    }

    render() {
        return (
            <div>
                <div>
                    <h3>Importing a project from Rollup [V1 required]</h3>
                    {this.state.importError != null ? (
                        <div className="import-error">
                            <h2>Import error</h2>
                            <code><pre>{`${this.state.importError}`}</pre></code>
                            <a href={this.state.importErrorUri} target="_blank">File a bug</a>
                        </div>) : null}
                    <div className="col-container">
                        <div className="col-narrow">
                            <h5>Upload assets</h5>
                            <div className="upload-files-container">
                                <div>
                                    <button tabIndex={-1}>
                                        <img className="attach-icon" src="/img/attach_icon.svg"></img>
                                        graph.json
                                    <input id="stats" type="file" ref={this.graphInput} onInput={() => this.onGraphInput()} />
                                    </button>
                                    <img src={this.hasGraphFile(this.state.graphFile) ? '/img/ok_icon.svg' : '/img/warn_icon.svg'} className="status-icon"></img>
                                </div>
                                <div>
                                    <button tabIndex={-1}>
                                        <img className="attach-icon" src="/img/attach_icon.svg"></img>
                                        sourcemap
                                    <input id="sourcemap" type="file" ref={this.sourceMapInput} onInput={() => this.onSourceMapInput()} />
                                    </button>
                                    <img src={this.hasSourceMapFile(this.state.sourceMapFile) ? '/img/ok_icon.svg' : '/img/warn_icon.svg'} className="status-icon"></img>
                                </div>
                                <div>
                                    <button disabled={!this.canProcess(this.state.sourceMapFile, this.state.graphFile)} onClick={() => this.processFiles()}>Import project</button>
                                </div>
                            </div>
                        </div>
                        <div className="import-instruction">
                            <div className="col-container">
                                <div>
                                    <h5>sourcemap</h5>
                                    <p>via rollup.config.js</p>
                                    <code>
                                        <pre>{`output: { 
    file: '\`\${outFolder}/dist.js',
    format: 'iife',
    name: 'rough',\n`}
                                            <span className="add-diff">
                                                &nbsp;&nbsp;&nbsp;&nbsp;sourcemap: true,
</span>{`
}`}
                                        </pre>
                                        <button onClick={() => toClipboard("sourcemap: true,")} className="copy-button" aria-label="Copy sourcemap snippet to clipboard"></button>
                                    </code>
                                </div>
                                <div>
                                    <h5>graph.json</h5>
                                    <p>via rollup.config.js</p>
                                    <code>
                                        <pre><span id="rollup-generate-graph" ref={this.generateGraphContents} className="add-diff">{`
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
                                        </span></pre>
                                        <button onClick={() => toClipboard(this.generateGraphContents.current!.textContent || '')} className="copy-button" aria-label="Copy stats.json programatic snippit to clipboard"></button>
                                    </code>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default RollupImport;
