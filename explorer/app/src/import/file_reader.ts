export function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => {
      const target = e.target as EventTarget & { result: string };
      res(target.result);
    };

    reader.onabort = reader.onerror = e => Promise.reject(e);
    reader.readAsText(file);
  });
}
