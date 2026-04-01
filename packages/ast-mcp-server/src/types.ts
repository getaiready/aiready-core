/**
 * SymbolKind Enum for all tools
 */
export type SymbolKind =
  | 'function'
  | 'class'
  | 'interface'
  | 'type_alias'
  | 'enum'
  | 'variable'
  | 'method'
  | 'property'
  | 'parameter'
  | 'import';

/**
 * Common Location Interface
 */
export interface Location {
  file: string;
  line: number;
  column: number;
}

/**
 * Definition Location with Snippet and Documentation
 */
export interface DefinitionLocation extends Location {
  kind: SymbolKind;
  snippet: string;
  documentation?: string;
}

/**
 * Reference Location
 */
export interface ReferenceLocation extends Location {
  text: string;
}

/**
 * File Structure Overview
 */
export interface FileStructure {
  file: string;
  imports: ImportInfo[];
  exports: ExportInfo[];
  classes: ClassInfo[];
  functions: FunctionInfo[];
  interfaces: InterfaceInfo[];
  typeAliases: TypeAliasInfo[];
  enums: EnumInfo[];
}

export interface ImportInfo {
  module: string;
  names: string[];
}

export interface ExportInfo {
  name: string;
  kind: SymbolKind;
}

export interface SymbolBase {
  name: string;
  documentation?: string;
  tags?: JSDocTag[];
}

export interface JSDocTag {
  name: string;
  text: string;
}

export interface ClassInfo extends SymbolBase {
  methods: FunctionInfo[];
  properties: PropertyInfo[];
}

export interface FunctionInfo extends SymbolBase {
  params: ParameterInfo[];
  returnType: string;
}

export interface PropertyInfo extends SymbolBase {
  type: string;
}

export interface ParameterInfo {
  name: string;
  type: string;
}

export interface InterfaceInfo extends SymbolBase {
  properties: PropertyInfo[];
  methods: FunctionInfo[];
}

export interface TypeAliasInfo extends SymbolBase {
  type: string;
}

export interface EnumInfo extends SymbolBase {
  members: string[];
}

/**
 * Indexing Stats
 */
export interface IndexingStats {
  indexed: {
    files: number;
    functions: number;
    classes: number;
    interfaces: number;
    types: number;
  };
  duration_ms: number;
  memory_mb: number;
}
