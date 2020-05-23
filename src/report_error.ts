export class ReportErrorUri {
  erroredFiles: string[] = [];
  errorBodies: { [file: string]: string } = {};

  addError(fileName: string, error: Error) {
    this.erroredFiles.push(fileName);
    this.errorBodies[fileName] = `${error.message}
----
${error.stack}`;
  }

  toUri() {
    const base = "https://github.com/samccone/bundle-buddy/issues/new";
    const params = new URLSearchParams();

    params.append("title", `Error from ${this.erroredFiles.join(" & ")}`);

    let body = "";

    for (const filename of Object.keys(this.errorBodies)) {
      body += `\`${filename}\`:\n\`\`\`${this.errorBodies[filename]}\`\`\`\n`;
    }

    params.append("body", body);

    return `${base}?${params}`;
  }
}
