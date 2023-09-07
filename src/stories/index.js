import React from 'react';
import {storiesOf} from '@storybook/react';
import ByTypeBarChart from '../bundle/Header';
import Report from '../bundle/Report';
import FileDetails from '../bundle/FileDetails';

import '../index.css';
import DEFAULT_TOTALS from './data/filetype.json';
import DEFAULT_DUPES from './data/duplicateNodeModules.json';
import DEFAULT_DETAILS from './data/filedetails.json';

storiesOf('ByTypeBarChart', module)
  .add('no values', () => <ByTypeBarChart />)
  .add('with default values', () => <ByTypeBarChart totalsByType={DEFAULT_TOTALS} />);

storiesOf('Report', module)
  .add('no values', () => <Report />)
  .add('with default values', () => <Report duplicateNodeModules={DEFAULT_DUPES} />);

storiesOf('FileDetails', module)
  .add('no values', () => <FileDetails />)
  .add('with default values', () => (
    <FileDetails {...DEFAULT_DETAILS} changeSelected={d => console.log(d)} />
  ));
