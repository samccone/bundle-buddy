import React, { Component } from "react";
// noopener noreferrer

class WebpackImport extends Component {
    sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
    statsInput?: React.RefObject<HTMLInputElement & { files: FileList }>;

    constructor(props: {}) {
        super(props);
        this.sourceMapInput = React.createRef();
        this.statsInput = React.createRef();
    }

    state: {
        sourceMapFile?: File;
        statsFile?: File;
    } = {
    };

    async toClipboard(text: string) {
        await (navigator as (Navigator & { clipboard: { writeText: (t: string) => Promise<void> } })).clipboard.writeText(text);
    }

    hasStatsFile(f: File|undefined) {
        return f != null;
    }

    hasSourceMapFile(f: File|undefined) {
        return f != null;
    }

    canProcess(statsFile: File|undefined, sourceMapFile: File|undefined) {
        return statsFile != null && sourceMapFile != null;
    }

    private processFiles() {

    }

    protected onStatsInput() {
        if (this.statsInput != null && this.statsInput.current != null && this.statsInput.current.files.length) {
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
        if (this.sourceMapInput != null && this.sourceMapInput.current != null && this.sourceMapInput.current.files.length) {
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
                <h3>Importing a project from Webpack</h3>
                <div className="col-container">
                    <div className="col-narrow">
                        <h5>Upload assets</h5>
                        <div className="upload-files-container">
                            <div>
                                <button tabIndex={-1}>
                                    <img className="attach-icon" src="/img/attach_icon.svg"></img>
                                    stats.json
                                    <input id="stats" type="file" ref={this.statsInput} onInput={() => this.onStatsInput()} />
                                </button>
                                <img src={this.hasStatsFile(this.state.statsFile) ? '/img/ok_icon.svg' : '/img/warn_icon.svg'} className="status-icon"></img>
                            </div>
                            <div>
                                <button tabIndex={-1}>
                                    <img className="attach-icon" src="/img/attach_icon.svg"></img>
                                    sourcemap
                                    <input id="sourcemap" type="file" ref={this.sourceMapInput}  onInput={() => this.onSourceMapInput()} />
                                </button>
                                <img src={this.hasSourceMapFile(this.state.sourceMapFile) ? '/img/ok_icon.svg' : '/img/warn_icon.svg'}  className="status-icon"></img>
                            </div>
                            <div>
                                <button disabled={!this.canProcess(this.state.sourceMapFile, this.state.statsFile)} onClick={() => this.processFiles()}>Process</button>
                            </div>
                        </div>
                    </div>
                    <div className="import-instruction">
                        <div className="col-container">
                            <div>
                                <h5>sourcemap</h5>
                                <p>webpack.conf.js</p>
                                <code>
                                    <pre>
                                        <span className="add-diff">
                                            devtool: "source-map"
                                    </span>
                                    </pre>
                                    <button onClick={() => this.toClipboard("devtool: 'source-map'")} className="copy-button" aria-label="Copy sourcemap snippet to clipboard"></button>
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
                                    <button onClick={() => this.toClipboard("webpack --profile --json > stats.json")} className="copy-button" aria-label="Copy stats.json CLI command to clipboard"></button>
                                </code>
                                <p>via programatic compilation </p>
                                <code>
                                    <pre>{`const webpack = require("webpack");
webpack({
// Configuration Object
}, (err, stats) => {
if (err) {
    console.error(err);
    return;
}`}
                                        <span className="add-diff">{`
fs.writeJSONSync(path.join(__dirname, "stats.json"), 
    stats.toJson())
});
`}
                                        </span>
                                    </pre>
                                    <button onClick={() => this.toClipboard(`fs.writeJSONSync(path.join(__dirname, "stats.json"), 
    stats.toJson())
});`)} className="copy-button" aria-label="Copy stats.json programatic snippit to clipboard"></button>
                                </code>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default WebpackImport;