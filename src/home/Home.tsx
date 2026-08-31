import { Route, Routes } from "react-router-dom";
import React from "react";
import Resolve from "../resolve/Resolve";
import { ImportResolveState, ImportHistory, ImportTypes } from "../types";
import Importer from "../import/Importer";
import ImportSelector from "../import/ImportSelector";

import "./home.css";

interface Props extends ImportResolveState {
  history: ImportHistory;
}

export default function Home(props: Props) {
  const {
    graphEdges,
    processedSourceMap,
    bundledFilesTransform: sourceMapFileTransform,
    graphFileTransform,
    history,
  } = props;

  return (
    <div id="home">
      <section style={{ background: "var(--grey900)", color: "white" }}>
        <header className="left-panel">
          <div
            className="inner-border vertical-center"
            style={{ borderRight: `3px solid var(--grey700)` }}
          >
            <h1>Bundle Buddy</h1>
          </div>
        </header>

        <div className="right-panel">
          <p className="ft-24">
            <i>
              Visualizing what code is in your web bundle, and how it got there.
            </i>
          </p>
        </div>
      </section>

      <section style={{ background: "var(--primary-color)", color: "white" }}>
        <div className="left-panel">
          <div
            className="inner-border vertical-center"
            style={{ borderRight: `3px solid var(--grey300)` }}
          >
            <h2>Step 1</h2>
          </div>
        </div>
        <div className="right-panel">
          <p className="ft-18">Select the bundler you are using:</p>
          <ImportSelector history={history} />
        </div>
      </section>
      <section
        style={{ background: "var(--grey200)", color: "var(--grey900)" }}
      >
        <Routes>
          <Route
            path=":importer/*"
            element={
              <div className="left-panel">
                <div
                  className="inner-border vertical-center"
                  style={{ borderRight: `3px solid var(--grey300)` }}
                >
                  <h2>Step 2</h2>
                </div>
              </div>
            }
          />
        </Routes>

        <div className="col-container">
          <div className="right-col upload">
            <div className="padding">
              <Routes>
                <Route
                  path="webpack/*"
                  element={
                    <Importer
                      graphFileName="stats.json"
                      history={history}
                      importType={ImportTypes.WEBPACK}
                    />
                  }
                />
                <Route
                  path="rspack/*"
                  element={
                    <Importer
                      graphFileName="stats.json"
                      history={history}
                      importType={ImportTypes.RSPACK}
                    />
                  }
                />
                <Route
                  path="create-react-app/*"
                  element={
                    <Importer
                      graphFileName="stats.json"
                      history={history}
                      importType={ImportTypes.CRA}
                    />
                  }
                />
                <Route
                  path="rollup/*"
                  element={
                    <Importer
                      importType={ImportTypes.ROLLUP}
                      graphFileName="graph.json"
                      history={history}
                    />
                  }
                />
                <Route
                  path="rome/*"
                  element={
                    <Importer
                      importType={ImportTypes.ROME}
                      graphFileName="bundlebuddy.json"
                      history={history}
                    />
                  }
                />
                <Route
                  path="parcel/*"
                  element={
                    <Importer
                      importType={ImportTypes.PARCEL}
                      graphFileName="bundle-buddy.json"
                      history={history}
                    />
                  }
                />
                <Route
                  path="esbuild/*"
                  element={
                    <Importer
                      importType={ImportTypes.ESBUILD}
                      graphFileName="esbuild.json"
                      history={history}
                    />
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </section>
      {graphEdges && (
        <section style={{ color: "var(--grey900)" }}>
          <div className="left-panel">
            <div
              className="inner-border vertical-center"
              style={{ borderRight: `3px solid var(--grey300)` }}
            >
              <h2>Step 3</h2>
            </div>
          </div>
          <div className="right-panel">
            <Resolve
              history={history}
              graphEdges={graphEdges}
              processedBundle={processedSourceMap}
              sourceMapFileTransform={sourceMapFileTransform}
              graphFileTransform={graphFileTransform}
            />
          </div>
        </section>
      )}
    </div>
  );
}
