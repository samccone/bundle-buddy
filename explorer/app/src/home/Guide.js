import React, { Component } from "react";

class Guide extends Component {
  render() {
    return (
      <div className="">
        <h1>Guide</h1>
        <p>How big is my bundle?</p>
        <p>What size should it be?</p>

        <p>What's in my bundle?</p>
        <p>What file types are in my bundle?</p>
        <p>Why did this end up in my bundle?</p>
        <p>What files are affected if I remove this dependency?</p>
        <p>Do I have duplicate versions of the same library</p>
      </div>
    );
  }
}

export default Guide;
