import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Header from "./Header";
import TestProcess from "./TestProcess";
import ErrorBoundry from "./ErrorBoundry";
import { stateFromProcessedKey, stateFromResolveKey } from "./routes";
import { useAppHistory } from "./routes/history";

const Bundle = lazy(() => import("./bundle/Bundle"));
const Home = lazy(() => import("./home/Home"));

function BundleRoute() {
  const location = useLocation();
  const state = stateFromProcessedKey((location.state as any).key);
  if (state == null) {
    throw new Error("invalid state");
  }

  let params = new URLSearchParams(location.search);
  return (
    <div>
      <Header />
      <Bundle
        trimmedNetwork={state.trimmedNetwork}
        rollups={state.rollups}
        duplicateNodeModules={state.duplicateNodeModules}
        selected={params.get("selected")}
        hierarchy={state.hierarchy}
      />
    </div>
  );
}

function HomeRoute() {
  const location = useLocation();
  const history = useAppHistory();
  const state = stateFromResolveKey(
    ((location.state as any) || { key: "" }).key,
  );

  return (
    <Home
      history={history}
      graphEdges={state?.graphEdges!}
      processedSourceMap={state?.processedSourceMap!}
      bundledFilesTransform={state?.bundledFilesTransform}
      graphFileTransform={state?.graphFileTransform}
    />
  );
}

export default function App() {
  return (
    <Router>
      <ErrorBoundry>
        <div className="App">
          <div className="Page">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/bundle" element={<BundleRoute />} />

                {/* TODO remove this test route */}
                <Route path="/testProcess" element={<TestProcess />} />

                <Route path="*" element={<HomeRoute />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </ErrorBoundry>
    </Router>
  );
}
