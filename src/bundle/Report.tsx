import React from 'react';
import {ProcessedImportState} from '../types';

type Props = {
  duplicateNodeModules: ProcessedImportState['duplicateNodeModules'];
};

export default function Report(props: Props) {
  const {duplicateNodeModules} = props;
  return (
    <div className="flex padding top-panel Report">
      <div className="left-panel" style={{width: '25vw'}}>
        <h1 className="uppercase-header">Health Checks</h1>
      </div>
      <div style={{width: '74vw'}}>
        <div className="report-panel">
          <div className="flex">
            <div className="vertical-center" style={{width: '17vw'}}>
              <div className="flex align-baseline">
                <img className="icon right-spacing" alt="directories" src="/img/folder.png" />

                <p className="subheader no-margin">
                  <b>
                    <small>Duplicate Node Modules</small>
                  </b>
                </p>
              </div>
            </div>
            <div className="scroll-y" style={{width: '57vw'}}>
              {duplicateNodeModules && duplicateNodeModules.length > 0 ? (
                <div>
                  <br />
                  <table>
                    <thead className="subheader grey600">
                      <tr>
                        <th>
                          <small>Module</small>
                        </th>
                        <th>
                          <small>Dependencies</small>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {duplicateNodeModules.map(k => {
                        return (
                          <tr key={k.key}>
                            <td>
                              <b>{k.key}</b>
                            </td>
                            <td>{k.value.join(', ')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>
                  No duplicated node modules found{' '}
                  <span role="img" aria-label="raised-hands">
                    🙌
                  </span>
                </p>
              )}
              <div className="grey600">
                <p>
                  Run <code>{`(npm or yarn) list <package_name>`}</code> with the duplicated module
                  name to see the associations between duplicated modules. To prevent this
                  automatically see{' '}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/formidablelabs/inspectpack/"
                  >
                    inspectpack
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
