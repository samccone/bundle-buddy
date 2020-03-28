import React from "react";
// noopener noreferrer

export default function Report({duplicateNodeModules }: {duplicateNodeModules: [{key: string, value: string[]}]} ) {
  return (
    <div className="flex padding top-panel">
      <div style={{ width: "25vw" }} />
      <div style={{ width: "37vw" }}>
        <p>
          <img className="icon" alt="directories" src="/img/folder.png" />
          <b>
            <small>Duplicate Node Modules</small>
          </b>
        </p>

        <div>
          <p>
            Run <code>{`npm ls <package_name>`}</code> with the duplicated
            module name to see the associations between duplicated modules.
          </p>
          <p>
            To learn more, check out{" "}
            <a target="_blank" href="https://github.com/formidablelabs/inspectpack/">
              inspectpack
            </a>
            .
          </p>
        </div>
      </div>
      <div className="scroll-y" style={{ width: "37vw" }}>
        {duplicateNodeModules && duplicateNodeModules.length > 0
          ? <div>
              <br />
              <table>
                <thead>
                  <tr>
                    <th>
                      <small>Duplicated module</small>
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
                        <td>{k.value.join(", ")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          : <p>
              <small>
                No duplicated node modules found{" "}
                <span role="img" aria-label="raised-hands">
                  🙌
                </span>
              </small>
            </p>}
      </div>
    </div>
  );
}
