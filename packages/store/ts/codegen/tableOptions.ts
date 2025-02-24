import path from "path";
import { SchemaTypeArrayToElement } from "@latticexyz/schema-type/deprecated";
import {
  ImportDatum,
  RenderDynamicField,
  RenderField,
  RenderKeyTuple,
  RenderStaticField,
  SolidityUserDefinedType,
} from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";
import { getSchemaTypeInfo, importForAbiOrUserType, resolveAbiOrUserType } from "./userType";
import { Store as StoreConfig } from "../config/v2/output";
import { getKeySchema, getValueSchema } from "@latticexyz/protocol-parser/internal";

export interface TableOptions {
  /** Path where the file is expected to be written (relative to project root) */
  outputPath: string;
  /** Name of the table, as used in filename and library name */
  tableName: string;
  /** Options for `renderTable` function */
  renderOptions: RenderTableOptions;
}

/**
 * Transforms store config and available solidity user types into useful options for `tablegen` and `renderTable`
 */
export function getTableOptions(
  config: StoreConfig,
  solidityUserTypes: Record<string, SolidityUserDefinedType>,
): TableOptions[] {
  const options = Object.values(config.tables).map((table): TableOptions => {
    const keySchema = getKeySchema(table);
    const valueSchema = getValueSchema(table);

    // struct adds methods to get/set all values at once
    const withStruct = table.codegen.dataStruct;
    // operate on all fields at once; always render for offchain tables; for only 1 field keep them if struct is also kept
    const withRecordMethods = withStruct || table.type === "offchainTable" || Object.keys(valueSchema).length > 1;
    // field methods can include simply get/set if there's only 1 field and no record methods
    const withSuffixlessFieldMethods = !withRecordMethods && Object.keys(valueSchema).length === 1;
    // list of any symbols that need to be imported
    const imports: ImportDatum[] = [];

    const keyTuple = Object.entries(keySchema).map(([name, field]): RenderKeyTuple => {
      const abiOrUserType = field.internalType;
      const { renderType } = resolveAbiOrUserType(abiOrUserType, config, solidityUserTypes);

      const importDatum = importForAbiOrUserType(
        abiOrUserType,
        table.codegen.outputDirectory,
        config,
        solidityUserTypes,
      );
      if (importDatum) imports.push(importDatum);

      return {
        ...renderType,
        name,
        isDynamic: false,
      };
    });

    const fields = Object.entries(valueSchema).map(([name, field]): RenderField => {
      const abiOrUserType = field.internalType;
      const { renderType, schemaType } = resolveAbiOrUserType(abiOrUserType, config, solidityUserTypes);

      const importDatum = importForAbiOrUserType(
        abiOrUserType,
        table.codegen.outputDirectory,
        config,
        solidityUserTypes,
      );
      if (importDatum) imports.push(importDatum);

      const elementType = SchemaTypeArrayToElement[schemaType];
      return {
        ...renderType,
        arrayElement: elementType !== undefined ? getSchemaTypeInfo(elementType) : undefined,
        name,
      };
    });

    const staticFields = fields.filter(({ isDynamic }) => !isDynamic) as RenderStaticField[];
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic) as RenderDynamicField[];

    // With tableIdArgument: tableId is a dynamic argument for each method
    // Without tableIdArgument: tableId is a file-level constant generated from `staticResourceData`
    const staticResourceData = table.codegen.tableIdArgument
      ? undefined
      : {
          namespace: table.namespace,
          name: table.name,
          offchainOnly: table.type === "offchainTable",
        };

    return {
      outputPath: path.join(table.codegen.outputDirectory, `${table.label}.sol`),
      tableName: table.label,
      renderOptions: {
        imports,
        libraryName: table.label,
        structName: withStruct ? table.label + "Data" : undefined,
        staticResourceData,
        storeImportPath: config.codegen.storeImportPath,
        keyTuple,
        fields,
        staticFields,
        dynamicFields,
        withGetters: table.type === "table",
        withRecordMethods,
        withDynamicFieldMethods: table.type === "table",
        withSuffixlessFieldMethods,
        storeArgument: table.codegen.storeArgument,
      },
    };
  });

  return options;
}
