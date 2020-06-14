import React, { Component } from "react";
import { readFileAsText } from "./file_reader";
import { Link } from "react-router-dom";
import { ImportHistory } from "../types";
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
        <div className="flex">
          <div style={{ flexGrow: 1, display: "flex", flexWrap: "wrap" }}>
            <Link
              to="/webpack"
              aria-label="webpack project import"
              className="no-link-underline "
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
                <span>Webpack / Create React App</span>
              </button>
            </Link>
            <Link
              to="/rollup"
              aria-label="rollup project import"
              className="no-link-underline "
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
                <span>Rollup</span>
              </button>
            </Link>
            <Link
              to="/rome"
              aria-label="rome project import"
              className="no-link-underline "
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
                <span>Rome</span>
              </button>
            </Link>
            <Link
              to="/parcel"
              aria-label="parcel project import"
              className="no-link-underline "
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
                <span>Parcel</span>
              </button>
            </Link>
            <Link
              to="/esbuild"
              aria-label="esbuild project import"
              className="no-link-underline "
            >
              <button
                aria-hidden
                tabIndex={-1}
                className={`type-button project-import esbuild-import`}
              >
                <span>ESBuild</span>
              </button>
            </Link>
          </div>

          <button tabIndex={-1}>
            <span className="ft-24">Or</span>
            <br />
            <br />
            Import an existing project
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
