import React, { Component } from "react";
import { readFileAsText } from "./file_reader";
import { Link } from "react-router-dom";
import { ImportHistory, ProcessedHistory } from "../types";
import { storeProcessedState } from "../routes";
// noopener noreferrer

class ImportSelector extends Component<{ history: ImportHistory }> {
  existingImportInput: React.RefObject<HTMLInputElement & { files: FileList }>;

  constructor(props: { history: ImportHistory }) {
    super(props);
    this.existingImportInput = React.createRef();
  }

  async onExistingImportInput() {
    const file = this.existingImportInput.current?.files[0];
    if (file == null) {
      return;
    }

    const contents = await readFileAsText(file);
    const previousState = JSON.parse(contents);

    this.props.history.push("/bundle", storeProcessedState(previousState));
  }

  state: never;

  render() {
    return (
      <div>
        <h1>Start</h1>
        <p>
          In order to understand what is in your bundle, we need to understand
          your project better. Please select the bundler you are using so that
          we can help you to get the information we need.
        </p>
        <h2>What bundler are you using?</h2>
        <div>
          <Link
            to="/webpack"
            aria-label="webpack project import"
            className="no-link-underline button-wrap"
          >
            <button
              aria-hidden
              tabIndex={-1}
              className={`type-button project-import`}
            >
              <img
                width="35px"
                height="36px"
                className="rollup-logo"
                alt="webpack logo"
                src="/img/webpack_logo.png"
              />
              Webpack / Create React App
            </button>
          </Link>
          <br />
          <Link
            to="/rollup"
            aria-label="rollup project import"
            className="no-link-underline button-wrap"
          >
            <button
              aria-hidden
              tabIndex={-1}
              className={`type-button project-import`}
            >
              <img
                width="34px"
                height="36px"
                alt="rollup logo"
                src="/img/rollup_logo.png"
                className="rollup-logo"
              />{" "}
              Rollup
            </button>
          </Link>
          <br />
          <Link
            to="/rome"
            aria-label="rome project import"
            className="no-link-underline button-wrap"
          >
            <button
              aria-hidden
              tabIndex={-1}
              className={`type-button project-import rome-import`}
            >
              <img
                width="31px"
                height="36px"
                alt="rome logo"
                src="/img/rome_logo.png"
                className="rome-logo"
              />{" "}
              Rome
            </button>
          </Link>
          <br />
          <Link
            to="/parcel"
            aria-label="parcel project import"
            className="no-link-underline button-wrap"
          >
            <button
              aria-hidden
              tabIndex={-1}
              className={`type-button project-import parcel-import`}
            >
              <img
                width="35px"
                height="26px"
                alt="parcel logo"
                src="/img/parcel_logo.png"
                className="parcel-logo"
              />{" "}
              Parcel
            </button>
          </Link>
        </div>
        <h2>Have an existing analysis?</h2>
        <div className="flex">
          <button className="project-import" tabIndex={-1}>
            Import existing project
            <input
              type="file"
              ref={this.existingImportInput}
              accept=".json"
              onInput={async () => await this.onExistingImportInput()}
            />
          </button>
        </div>
      </div>
    );
  }
}

export default ImportSelector;
