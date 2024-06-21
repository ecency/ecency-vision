import { EntryMetadataBuilder } from "./entry-metadata-builder";

export namespace EntryMetadataManagement {
  export class EntryMetadataManager {
    public static shared = new EntryMetadataManager();

    public builder(): EntryMetadataBuilder {
      return new EntryMetadataBuilder();
    }
  }
}
