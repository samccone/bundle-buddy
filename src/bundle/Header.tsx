import React from 'react';

import {primary, mainFileColor, secondaryFileColor} from '../theme';

import {getFileSize, getFileSizeSplit, getPercent} from './stringFormats';
import BarChart from './BarChart';
import {ProcessedImportState, SizeData} from '../types';

export const typeColors = {
  js: mainFileColor,
  ts: mainFileColor,
  jsx: mainFileColor,
  tsx: mainFileColor,
};

const frameProps = {
  margin: {top: 5, right: 50, left: 140},
  oAccessor: (d: SizeData) => d.name,
  rAccessor: (d: SizeData) => d.totalBytes,
  oPadding: 10,
  barHeight: 45,
  bar: (d: SizeData, width: number | string | undefined) => {
    return (
      <div
        style={{
          background:
            typeColors[d.name as keyof typeof typeColors] || d.color || secondaryFileColor,
          height: '100%',
          width,
        }}
      />
    );
  },
  oLabel: (d: SizeData, o: string, r: number) => {
    return (
      <div>
        <span>{o}</span>
        <br />
        <span>
          <b>{getPercent(d.pct)}</b> <span style={{opacity: 0.6}}>{getFileSize(r)}</span>
        </span>
      </div>
    );
  },
};

const directoryProps = {
  ...frameProps,
  additionalDefs: [
    <pattern key="1" id="dags-primary" patternUnits="userSpaceOnUse" width="4" height="4">
      <path
        d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
        shapeRendering="auto"
        stroke={primary}
        strokeLinecap="square"
      />
    </pattern>,
    <pattern key="2" id="dags" patternUnits="userSpaceOnUse" width="4" height="4">
      <path
        d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
        shapeRendering="auto"
        stroke={'#ddd'}
        strokeLinecap="square"
      />
    </pattern>,
  ],
};

type Props = {
  download: JSX.Element;
  rollups?: ProcessedImportState['rollups'];
};

export default function ByTypeBarChart(props: Props) {
  const {rollups = {} as ProcessedImportState['rollups'], download} = props;
  const totalSize = rollups.value;
  const types = rollups.fileTypes || [];
  const folders = rollups.directories || [];

  const fileTypes = types.sort((a, b) => b.totalBytes - a.totalBytes);
  const directories = folders.sort((a, b) => b.totalBytes - a.totalBytes);

  let fileTypeMessage;

  if (fileTypes.length === 1) {
    fileTypeMessage = (
      <span>
        Your project only has one file type: <b>{fileTypes[0].name}</b>
      </span>
    );
  } else {
    if (fileTypes[0] && fileTypes[0].pct >= 0.6) {
      fileTypeMessage = (
        <span>
          Your project has <b>{fileTypes.length}</b> file types, but it is mostly{' '}
          <b>{fileTypes[0].name}</b> files.
        </span>
      );
    } else {
      fileTypeMessage = (
        <span>
          Your bundle has <b>{fileTypes.length}</b> file types
        </span>
      );
    }
  }

  const size = getFileSizeSplit(totalSize);
  return (
    <div className="flex padding top-panel" id="bundle-header">
      <div className="right-padding left-panel" style={{width: '25vw'}}>
        <h1 className="uppercase-header">Overview</h1>

        {totalSize && (
          <div className="total-size">
            <p>
              <span className="value">{size.value}</span> <span className="type">{size.type}</span>
            </p>
          </div>
        )}
        {download}
      </div>
      <div className="scroll-y" style={{width: '75vw'}}>
        <p className="subheader">
          <img className="icon" alt="file types" src="/img/file.png" />
          <b>
            <small>By Bundle</small>
          </b>
        </p>

        <div className="flex">
          <div className="scroll-y" style={{width: '37vw'}}>
            <div className="sticky-wrapper">
              <div className="sticky">
                <p className="subheader">
                  <img className="icon" alt="file types" src="/img/file.png" />
                  <b>
                    <small>By File Type</small>
                  </b>
                </p>
                <p>{fileTypeMessage}</p>
              </div>
              <BarChart {...frameProps} data={fileTypes} />
            </div>
          </div>
          <div className="scroll-y" style={{width: '37vw'}}>
            <div className="sticky-wrapper">
              <div className="sticky">
                <p className="subheader">
                  <img className="icon" alt="directories" src="/img/folder.png" />
                  <b>
                    <small>By Directory</small>
                  </b>
                </p>
                <p>
                  Your project is made up <b>{directories.length}</b> top-level directories
                </p>
              </div>
              <BarChart {...directoryProps} data={directories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
