import React, { Component } from "react";

class Introduction extends Component {
  render() {
    return (
      <div>
        <h1>Introduction</h1>
        <p>
          <b>Bundling</b>
          <br />
          Combining JavaScript source code from a repository of files and
          dependencies into an optimized set of reduced files.
        </p>
        <p>
          <b>The Pros</b>, bundling automates:
        </p>
        <ul>
          <li>Combining files</li>
          <li>Translating new JavaScript syntax for compatability</li>
          <li>Minimizing code to reduce file size</li>
          <li>
            Splitting files by route to reduce the file size loaded per page
          </li>
        </ul>
        <p>Add image here</p>
        <p>
          {" "}
          <b>The Cons</b>
          <br /> The way users are bundling has become a complicated, opaque
          process. This makes it difficult to understand if all of{" "}
          <b>The Pros</b> are:
        </p>
        <ul>
          <li>Actually happening</li>
          <li>Efficiently configured</li>
        </ul>
        <p>Add image here</p>

        <p>
          <b>Bundle Buddy</b>
        </p>
        <p>To help you analyze what's in your bundle(s) and why it’s there.</p>
        <p>
          Go to the right panel to get started with analysis, or read continue
          reading for guidance.
        </p>
      </div>
    );
  }
}

export default Introduction;
