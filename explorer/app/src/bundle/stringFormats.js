const mb = 1024 * 1024;
const kb = 1024;
export const getFileSize = size => {
  return (
    (size && size >= mb ? size / mb : size / kb).toFixed(2) +
    " " +
    (size >= mb ? "MB" : "KB")
  );
};

export const getPercent = (size, total) => {
  let rounded = size < 1 ? size * 100 : size / total * 100;

  if (rounded < 0.1) rounded = "<.1";
  else if (rounded >= 99.5) rounded = rounded.toFixed(1);
  else if (rounded < 1) rounded = rounded.toFixed(1);
  else rounded = rounded.toFixed(0);

  rounded = rounded + "%";

  if (rounded === "1.0%") rounded = "1%";
  if (rounded.slice(0, 2) === "0.") rounded = rounded.slice(1);

  return rounded;
};
