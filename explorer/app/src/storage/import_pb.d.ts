// package:
// file: src/storage/import.proto

import * as jspb from "google-protobuf";

export class Import extends jspb.Message {
  getDate(): number;
  setDate(value: number): void;

  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Import.AsObject;
  static toObject(includeInstance: boolean, msg: Import): Import.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Import,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): Import;
  static deserializeBinaryFromReader(
    message: Import,
    reader: jspb.BinaryReader
  ): Import;
}

export namespace Import {
  export type AsObject = {
    date: number;
    name: string;
  };
}
