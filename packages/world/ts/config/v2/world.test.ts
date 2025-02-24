import { describe, it } from "vitest";
import { defineWorld } from "./world";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import {
  CONFIG_DEFAULTS as STORE_CONFIG_DEFAULTS,
  TABLE_CODEGEN_DEFAULTS,
  CODEGEN_DEFAULTS as STORE_CODEGEN_DEFAULTS,
  TABLE_DEPLOY_DEFAULTS,
} from "@latticexyz/store/config/v2";
import {
  CODEGEN_DEFAULTS as WORLD_CODEGEN_DEFAULTS,
  DEPLOY_DEFAULTS,
  CONFIG_DEFAULTS as WORLD_CONFIG_DEFAULTS,
} from "./defaults";
import { World } from "./output";

const CONFIG_DEFAULTS = { ...STORE_CONFIG_DEFAULTS, ...WORLD_CONFIG_DEFAULTS };
const CODEGEN_DEFAULTS = { ...STORE_CODEGEN_DEFAULTS, ...WORLD_CODEGEN_DEFAULTS };

describe("defineWorld", () => {
  it.skip("should resolve namespaced tables", () => {
    const config = defineWorld({
      // @ts-expect-error TODO: remove once namespaces support ships
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: {
              schema: {
                id: "address",
                value: "uint256",
                dynamic: "string",
              },
              key: ["id"],
            },
          },
        },
      },
    });

    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
      tables: {
        ExampleNS__ExampleTable: {
          label: "ExampleTable",
          type: "table",
          namespace: "ExampleNS",
          name: "ExampleTable" as string,
          tableId: resourceToHex({ type: "table", namespace: "ExampleNS", name: "ExampleTable" }),
          schema: {
            id: {
              type: "address",
              internalType: "address",
            },
            value: {
              type: "uint256",
              internalType: "uint256",
            },
            dynamic: {
              type: "string",
              internalType: "string",
            },
          },
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {},
      enums: {},
      enumValues: {},
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it.skip("should resolve namespaced table config with user types and enums", () => {
    const config = defineWorld({
      // @ts-expect-error TODO: remove once namespaces support ships
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: {
              schema: {
                id: "Static",
                value: "MyEnum",
                dynamic: "Dynamic",
              },
              key: ["id"],
            },
          },
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
    });

    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
      tables: {
        ExampleNS__ExampleTable: {
          label: "ExampleTable",
          type: "table",
          namespace: "ExampleNS",
          name: "ExampleTable" as string,
          tableId: resourceToHex({ type: "table", namespace: "ExampleNS", name: "ExampleTable" }),
          schema: {
            id: {
              type: "address",
              internalType: "Static",
            },
            value: {
              type: "uint8",
              internalType: "MyEnum",
            },
            dynamic: {
              type: "string",
              internalType: "Dynamic",
            },
          },
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
      enumValues: {
        MyEnum: {
          First: 0,
          Second: 1,
        },
      },
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it.skip("should extend the output World type", () => {
    const config = defineWorld({
      // @ts-expect-error TODO: remove once namespaces support ships
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: {
              schema: {
                id: "Static",
                value: "MyEnum",
                dynamic: "Dynamic",
              },
              key: ["id"],
            },
          },
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
    });

    attest<true, typeof config extends World ? true : false>();
  });

  it.skip("should not use the global namespace for namespaced tables", () => {
    const config = defineWorld({
      namespace: "namespace",
      // @ts-expect-error TODO: remove once namespaces support ships
      namespaces: {
        AnotherOne: {
          tables: {
            Example: {
              schema: { id: "address", name: "string", age: "uint256" },
              key: ["age"],
            },
          },
        },
      },
    });

    attest<"namespace">(config.namespace).equals("namespace");
    // @ts-expect-error TODO: fix once namespaces support ships
    attest<"AnotherOne">(config.tables.AnotherOne__Example.namespace).equals("AnotherOne");
    // @ts-expect-error TODO: fix once namespaces support ships
    attest(config.tables.AnotherOne__Example.tableId).equals(
      resourceToHex({ type: "table", name: "Example", namespace: "AnotherOne" }),
    );
  });

  describe("should have the same output as `defineWorld` for store config inputs", () => {
    it("should return the full config given a full config with one key", () => {
      const config = defineWorld({
        tables: {
          Example: {
            schema: { id: "address", name: "string", age: "uint256" },
            key: ["age"],
          },
        },
      });

      const expected = {
        ...CONFIG_DEFAULTS,
        codegen: CODEGEN_DEFAULTS,
        tables: {
          Example: {
            label: "Example",
            type: "table",
            namespace: "",
            name: "Example" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
            schema: {
              id: {
                type: "address",
                internalType: "address",
              },
              name: {
                type: "string",
                internalType: "string",
              },
              age: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            key: ["age"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
        },
        userTypes: {},
        enums: {},
        enumValues: {},
        namespace: "",
      } as const;

      attest<typeof expected>(config).equals(expected);
    });

    it("should return the full config given a full config with one key and user types", () => {
      const config = defineWorld({
        tables: {
          Example: {
            schema: { id: "dynamic", name: "string", age: "static" },
            key: ["age"],
          },
        },
        userTypes: {
          static: { type: "address", filePath: "path/to/file" },
          dynamic: { type: "string", filePath: "path/to/file" },
        },
      });
      const expected = {
        ...CONFIG_DEFAULTS,
        codegen: CODEGEN_DEFAULTS,
        tables: {
          Example: {
            label: "Example",
            type: "table",
            namespace: "",
            name: "Example" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
            schema: {
              id: {
                type: "string",
                internalType: "dynamic",
              },
              name: {
                type: "string",
                internalType: "string",
              },
              age: {
                type: "address",
                internalType: "static",
              },
            },
            key: ["age"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
        },
        userTypes: {
          static: { type: "address", filePath: "path/to/file" },
          dynamic: { type: "string", filePath: "path/to/file" },
        },
        enums: {},
        enumValues: {},
        namespace: "",
      } as const;

      attest<typeof expected>(config).equals(expected);
    });

    it("should return the full config given a full config with two key", () => {
      const config = defineWorld({
        tables: {
          Example: {
            schema: { id: "address", name: "string", age: "uint256" },
            key: ["age", "id"],
          },
        },
      });
      const expected = {
        ...CONFIG_DEFAULTS,
        codegen: CODEGEN_DEFAULTS,
        tables: {
          Example: {
            label: "Example",
            type: "table",
            namespace: "",
            name: "Example" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
            schema: {
              id: {
                type: "address",
                internalType: "address",
              },
              name: {
                type: "string",
                internalType: "string",
              },
              age: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            key: ["age", "id"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
        },
        userTypes: {},
        enums: {},
        enumValues: {},
        namespace: "",
        deploy: DEPLOY_DEFAULTS,
      } as const;

      attest<typeof expected>(config).equals(expected);
    });

    it("should resolve two tables in the config with different schemas", () => {
      const config = defineWorld({
        tables: {
          First: {
            schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
            key: ["firstKey", "firstAge"],
          },
          Second: {
            schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
            key: ["secondKey", "secondAge"],
          },
        },
      });
      const expected = {
        ...CONFIG_DEFAULTS,
        codegen: CODEGEN_DEFAULTS,
        tables: {
          First: {
            label: "First",
            type: "table",
            namespace: "",
            name: "First" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "First" }),
            schema: {
              firstKey: {
                type: "address",
                internalType: "address",
              },
              firstName: {
                type: "string",
                internalType: "string",
              },
              firstAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            key: ["firstKey", "firstAge"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
          Second: {
            label: "Second",
            type: "table",
            namespace: "",
            name: "Second" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "Second" }),
            schema: {
              secondKey: {
                type: "address",
                internalType: "address",
              },
              secondName: {
                type: "string",
                internalType: "string",
              },
              secondAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            key: ["secondKey", "secondAge"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
        },
        userTypes: {},
        enums: {},
        enumValues: {},
        namespace: "",
      } as const;

      attest<typeof expected>(config).equals(expected);
    });

    it("should resolve two tables in the config with different schemas and user types", () => {
      const config = defineWorld({
        tables: {
          First: {
            schema: { firstKey: "Static", firstName: "Dynamic", firstAge: "uint256" },
            key: ["firstKey", "firstAge"],
          },
          Second: {
            schema: { secondKey: "Static", secondName: "Dynamic", secondAge: "uint256" },
            key: ["secondKey", "secondAge"],
          },
        },
        userTypes: {
          Static: { type: "address", filePath: "path/to/file" },
          Dynamic: { type: "string", filePath: "path/to/file" },
        },
      });

      const expected = {
        ...CONFIG_DEFAULTS,
        codegen: CODEGEN_DEFAULTS,
        tables: {
          First: {
            label: "First",
            type: "table",
            namespace: "",
            name: "First" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "First" }),
            schema: {
              firstKey: {
                type: "address",
                internalType: "Static",
              },
              firstName: {
                type: "string",
                internalType: "Dynamic",
              },
              firstAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            key: ["firstKey", "firstAge"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
          Second: {
            label: "Second",
            type: "table",
            namespace: "",
            name: "Second" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "Second" }),
            schema: {
              secondKey: {
                type: "address",
                internalType: "Static",
              },
              secondName: {
                type: "string",
                internalType: "Dynamic",
              },
              secondAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            key: ["secondKey", "secondAge"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
        },
        userTypes: {
          Static: { type: "address", filePath: "path/to/file" },
          Dynamic: { type: "string", filePath: "path/to/file" },
        },
        enums: {},
        enumValues: {},
        namespace: "",
      } as const;

      attest<typeof expected>(config).equals(expected);
    });

    it("should throw if referring to fields of different tables", () => {
      attest(() =>
        defineWorld({
          tables: {
            First: {
              schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
              key: ["firstKey", "firstAge"],
            },
            Second: {
              schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
              // @ts-expect-error Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'
              key: ["firstKey", "secondAge"],
            },
          },
        }),
      )
        .throws('Invalid key. Expected `("secondKey" | "secondAge")[]`, received `["firstKey", "secondAge"]`')
        .type.errors(`Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'`);
    });

    it("should throw an error if the provided key is not a static field", () => {
      attest(() =>
        defineWorld({
          tables: {
            Example: {
              schema: { id: "address", name: "string", age: "uint256" },
              // @ts-expect-error Type '"name"' is not assignable to type '"id" | "age"'.
              key: ["name"],
            },
          },
        }),
      )
        .throws('Invalid key. Expected `("id" | "age")[]`, received `["name"]`')
        .type.errors(`Type '"name"' is not assignable to type '"id" | "age"'`);
    });

    it("should throw an error if the provided key is not a static field with user types", () => {
      attest(() =>
        defineWorld({
          tables: {
            Example: {
              schema: { id: "address", name: "Dynamic", age: "uint256" },
              // @ts-expect-error Type '"name"' is not assignable to type '"id" | "age"'.
              key: ["name"],
            },
          },
          userTypes: {
            Dynamic: { type: "string", filePath: "path/to/file" },
          },
        }),
      )
        .throws('Invalid key. Expected `("id" | "age")[]`, received `["name"]`')
        .type.errors(`Type '"name"' is not assignable to type '"id" | "age"'`);
    });

    it("should return the full config given a full config with enums and user types", () => {
      const config = defineWorld({
        tables: {
          Example: {
            schema: { id: "dynamic", name: "ValidNames", age: "static" },
            key: ["name"],
          },
        },
        userTypes: {
          static: { type: "address", filePath: "path/to/file" },
          dynamic: { type: "string", filePath: "path/to/file" },
        },
        enums: {
          ValidNames: ["first", "second"],
        },
      });
      const expected = {
        ...CONFIG_DEFAULTS,
        codegen: CODEGEN_DEFAULTS,
        tables: {
          Example: {
            label: "Example",
            type: "table",
            namespace: "",
            name: "Example" as string,
            tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
            schema: {
              id: {
                type: "string",
                internalType: "dynamic",
              },
              name: {
                type: "uint8",
                internalType: "ValidNames",
              },
              age: {
                type: "address",
                internalType: "static",
              },
            },
            key: ["name"],
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
            deploy: TABLE_DEPLOY_DEFAULTS,
          },
        },
        userTypes: {
          static: { type: "address", filePath: "path/to/file" },
          dynamic: { type: "string", filePath: "path/to/file" },
        },
        enums: {
          ValidNames: ["first", "second"],
        },
        enumValues: {
          ValidNames: {
            first: 0,
            second: 1,
          },
        },
        namespace: "",
      } as const;

      attest<typeof expected>(config).equals(expected);
      attest<typeof config>(expected).equals(expected);
    });

    it("should use the root namespace as default namespace", () => {
      const config = defineWorld({});

      attest<"">(config.namespace).equals("");
    });

    it("should use pipe through non-default namespaces", () => {
      const config = defineWorld({ namespace: "custom" });

      attest<"custom">(config.namespace).equals("custom");
    });

    it("should extend the output World type", () => {
      const config = defineWorld({
        tables: { Name: { schema: { key: "CustomType" }, key: ["key"] } },
        userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
      });

      attest<true, typeof config extends World ? true : false>();
    });

    it("should use the global namespace instead for tables", () => {
      const config = defineWorld({
        namespace: "namespace",
        tables: {
          Example: {
            schema: { id: "address", name: "string", age: "uint256" },
            key: ["age"],
          },
        },
      });

      attest<"namespace">(config.namespace).equals("namespace");
      attest<"namespace">(config.tables.namespace__Example.namespace).equals("namespace");
      attest(config.tables.namespace__Example.tableId).equals(
        resourceToHex({ type: "table", name: "Example", namespace: "namespace" }),
      );
    });
  });

  it("should use the custom name and namespace as table index", () => {
    const config = defineWorld({
      namespace: "CustomNS",
      tables: {
        Example: {
          schema: { id: "address" },
          key: ["id"],
        },
      },
    });

    attest<"CustomNS__Example", keyof typeof config.tables>();
  });

  it("should throw if namespace is overridden in top level tables", () => {
    attest(() =>
      defineWorld({
        namespace: "CustomNS",
        tables: {
          Example: {
            // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in a store config"
            namespace: "NotAllowed",
            schema: { id: "address" },
            key: ["id"],
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in a store config");
  });

  it("should throw if label is overridden in top level tables", () => {
    attest(() =>
      defineWorld({
        tables: {
          Example: {
            // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in a store config"
            label: "NotAllowed",
            schema: { id: "address" },
            key: ["id"],
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in a store config");
  });

  it.skip("should throw if label is overridden in namespaced tables", () => {
    attest(() =>
      defineWorld({
        // @ts-expect-error TODO: remove once namespaces support ships
        namespaces: {
          MyNamespace: {
            tables: {
              Example: {
                label: "NotAllowed",
                schema: { id: "address" },
                key: ["id"],
              },
            },
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in a store config");
  });

  it.skip("should throw if namespace is overridden in namespaced tables", () => {
    attest(() =>
      defineWorld({
        // @ts-expect-error TODO: remove once namespaces support ships
        namespaces: {
          MyNamespace: {
            tables: {
              Example: {
                namespace: "NotAllowed",
                schema: { id: "address" },
                key: ["id"],
              },
            },
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in a store config");
  });

  it("should throw if namespaces are defined (TODO: remove once namespaces support ships)", () => {
    attest(() =>
      defineWorld({
        // @ts-expect-error TODO: remove once namespaces support ships
        namespaces: {},
      }),
    ).type.errors("Namespaces config will be enabled soon.");
  });

  it("should allow setting openAccess of a system to false", () => {
    const config = defineWorld({
      systems: {
        Example: {
          openAccess: false,
        },
      },
    });

    attest<false>(config.systems.Example.openAccess).equals(false);
  });

  it("should allow a const config as input", () => {
    const config = {
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    } as const;

    defineWorld(config);
  });

  it("should throw if config has unexpected key", () => {
    attest(() =>
      defineWorld({
        // @ts-expect-error Invalid config option
        invalidOption: "nope",
      }),
    ).type.errors("`invalidOption` is not a valid World config option.");
  });
});
