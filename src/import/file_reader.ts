export async function readFilesAsText(
  files: File[]
): Promise<{ [filename: string]: string }> {
  const ret: { [filename: string]: string } = {};
  for (const f of files) {
    ret[f.name] = await readFileAsText(f);
  }

  return ret;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const target = e.target as EventTarget & { result: string };
      res(target.result);
    };

    reader.onabort = reader.onerror = (e) => Promise.reject(e);
    reader.readAsText(file);
  });
}

export function readFileAsBinary(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const target = e.target as EventTarget & { result: string };
      res(target.result);
    };

    reader.onabort = reader.onerror = (e) => Promise.reject(e);
    reader.readAsBinaryString(file);
  });
}
