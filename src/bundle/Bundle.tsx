import * as pako from 'pako';
import React, {useState, useEffect, useMemo} from 'react';
import Header from './Header';
import Report from './Report';
import Analyze from './Analyze';
import './bundle.css';

import {colors} from '../theme';
import {ProcessedImportState} from '../types';

function storeSelected(selected?: string | null) {
  if (selected) {
    window.history.pushState(
      {...window.history.state, selected},
      '',
      selected
        ? `${window.location.origin}${window.location.pathname}?selected=${encodeURIComponent(
            selected
          )}`
        : `${window.location.origin}${window.location.pathname}`
    );
  }
}

function download(props: Props) {
  const deflate = new pako.Deflate({level: 3});
  deflate.push(new TextEncoder().encode(JSON.stringify(props)).buffer, true);

  const blob = new Blob([deflate.result as Uint8Array], {
    type: 'application/json',
  });
  const objectURL = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement('a');
  a.setAttribute('download', 'bundle-buddy-share.json');
  a.href = objectURL;
  a.click();
}

interface Props extends ProcessedImportState {
  selected: string | null;
}

function getDirectories(rollups: Props['rollups']) {
  const directories = rollups.directories
    .sort((a, b) => b.totalBytes - a.totalBytes)
    .map(d => d.name);

  const directoryColors: {[dir: string]: string} = {};
  const svgDirectoryColors: {[dir: string]: string} = {};
  let i = 0;
  directories.forEach(d => {
    if (d.indexOf('node_modules') !== -1) {
      directoryColors[d] = `repeating-linear-gradient(
      45deg,
      #dfe1e5,
      #dfe1e5 2px,
      #fff 2px,
      #fff 4px
    )`;
      svgDirectoryColors[d] = 'url(#dags)';
    } else {
      directoryColors[d] = colors[i] || 'black';
      svgDirectoryColors[d] = colors[i] || 'black';
      i++;
    }
  });

  return {
    directories,
    directoryColors,
    svgDirectoryColors,
  };
}

export default function Bundle(props: Props) {
  const {trimmedNetwork, rollups, hierarchy, duplicateNodeModules} = props;

  const [selected, changeSelected] = useState(props.selected);
  useEffect(() => storeSelected(selected), [selected]);

  const network = trimmedNetwork;

  const {directories, directoryColors, svgDirectoryColors} = useMemo(
    () => getDirectories(rollups),
    [rollups]
  );

  rollups.directories.forEach(d => {
    d.color = directoryColors[d.name];
  });

  const downloadButton = (
    <button className="download paper" onClick={() => download(props)}>
      download analysis
    </button>
  );

  return (
    <div id="bundle">
      <div>
        <Header rollups={rollups} download={downloadButton} />
      </div>
      <div>
        <Report duplicateNodeModules={duplicateNodeModules} />
      </div>
      <div>
        <Analyze
          total={rollups.value}
          network={network}
          changeSelected={changeSelected}
          hierarchy={hierarchy}
          directoryColors={directoryColors}
          svgDirectoryColors={svgDirectoryColors}
          directories={directories}
          selected={selected}
        />
      </div>
    </div>
  );
}
