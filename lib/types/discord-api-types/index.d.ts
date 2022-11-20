import {LocalizationMap} from 'discord-api-types/v10';

declare module 'discord-api-types/v10' {
  // moved to lib/constants.ts
  // export enum ApplicationRoleConnectionMetadataType {
  //   NumberLessThan = 1,
  //   NumberGreaterThan = 2,
  //   NumberEqual = 3,
  //   NumberNotEqual = 4,
  //   DateTimeLessThan = 5,
  //   DateTimeGreaterThan = 6,
  //   BooleanEqual = 7,
  // }

  export interface ApplicationRoleConnectionMetadataEntry {
    key: string;
    name: string;
    name_localizations?: LocalizationMap;
    description: string;
    description_localizations?: LocalizationMap;
    type: ApplicationRoleConnectionMetadataType;
  }

  export type ApplicationRoleConnectionMetadata =
    ApplicationRoleConnectionMetadataEntry[];

  export interface ApplicationUserRoleConnection<
    Metadata extends {[key: string]: string} = {[key: string]: string}
  > {
    platform_name: string;
    platform_username: string | null;
    metadata: Metadata;
    // metadata: {
    //   /**
    //    * key references `ApplicationRoleConnectionMetadataEntry.key`
    //    * **NOTE:** value is ALWAYS a string, regardless of metadata type
    //    */
    //   [key: string]: `${number}`;
    // };
  }
}
