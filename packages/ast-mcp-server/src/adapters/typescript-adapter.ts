import {
  Project,
  SourceFile,
  Node,
  Symbol,
  JSDoc,
  Type,
  SyntaxKind,
} from 'ts-morph';
import {
  DefinitionLocation,
  ReferenceLocation,
  FileStructure,
  SymbolKind,
  ImportInfo,
  ExportInfo,
  ClassInfo,
  FunctionInfo,
  InterfaceInfo,
  TypeAliasInfo,
  EnumInfo,
  JSDocTag,
} from '../types.js';
import { projectManager } from '../project-manager.js';

/**
 * TypeScriptAdapter handles the actual ts-morph operations
 */
export class TypeScriptAdapter {
  /**
   * Resolve definition of a symbol at a path
   */
  public async resolveDefinition(
    symbolName: string,
    path: string
  ): Promise<DefinitionLocation[]> {
    const projects = await projectManager.getProjectsForPath(path);
    const results: DefinitionLocation[] = [];

    for (const project of projects) {
      const sourceFiles = project.getSourceFiles();
      for (const sourceFile of sourceFiles) {
        // Find nodes with the given name
        const nodes = sourceFile
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .filter((id: Node) => id.getText() === symbolName);

        for (const node of nodes) {
          const definitions = node.getDefinitionNodes();
          for (const defNode of definitions) {
            results.push(this.mapToDefinitionLocation(defNode));
          }
        }
      }
    }

    // Deduplicate and return
    return this.deduplicateLocations(results);
  }

  /**
   * Find references to a symbol
   */
  public async findReferences(
    symbolName: string,
    path: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ references: ReferenceLocation[]; total_count: number }> {
    const projects = await projectManager.getProjectsForPath(path);
    const results: ReferenceLocation[] = [];

    for (const project of projects) {
      const sourceFiles = project.getSourceFiles();
      for (const sourceFile of sourceFiles) {
        const nodes = sourceFile
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .filter((id) => id.getText() === symbolName);

        for (const node of nodes) {
          const referencedSymbols = node.findReferences();
          for (const referencedSymbol of referencedSymbols) {
            const references = referencedSymbol.getReferences();
            for (const ref of references) {
              const sourceFile = ref.getSourceFile();
              const lineAndColumn = sourceFile.getLineAndColumnAtPos(
                ref.getTextSpan().getStart()
              );
              results.push({
                file: sourceFile.getFilePath(),
                line: lineAndColumn.line,
                column: lineAndColumn.column,
                text:
                  ref.getNode().getParent()?.getText() ||
                  ref.getNode().getText(),
              });
            }
          }
        }
      }
    }

    const uniqueResults = this.deduplicateLocations(results);
    return {
      references: uniqueResults.slice(offset, offset + limit),
      total_count: uniqueResults.length,
    };
  }

  /**
   * Find implementations for a symbol
   */
  public async findImplementations(
    symbolName: string,
    path: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ implementations: ReferenceLocation[]; total_count: number }> {
    const projects = await projectManager.getProjectsForPath(path);
    const results: ReferenceLocation[] = [];

    for (const project of projects) {
      const sourceFiles = project.getSourceFiles();
      for (const sourceFile of sourceFiles) {
        const nodes = sourceFile
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .filter((id) => id.getText() === symbolName);

        for (const node of nodes) {
          const implementations = node.getImplementations();
          for (const impl of implementations) {
            const sourceFile = impl.getSourceFile();
            const lineAndColumn = sourceFile.getLineAndColumnAtPos(
              impl.getTextSpan().getStart()
            );
            results.push({
              file: sourceFile.getFilePath(),
              line: lineAndColumn.line,
              column: lineAndColumn.column,
              text:
                impl.getNode().getParent()?.getText() ||
                impl.getNode().getText(),
            });
          }
        }
      }
    }

    const uniqueResults = this.deduplicateLocations(results);
    return {
      implementations: uniqueResults.slice(offset, offset + limit),
      total_count: uniqueResults.length,
    };
  }

  /**
   * Get file structure overview
   */
  public async getFileStructure(
    filePath: string
  ): Promise<FileStructure | undefined> {
    const project = await projectManager.getProjectForFile(filePath);
    if (!project) return undefined;

    const sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) return undefined;

    const structure: FileStructure = {
      file: filePath,
      imports: sourceFile.getImportDeclarations().map((imp: any) => ({
        module: imp.getModuleSpecifierValue(),
        names: imp.getNamedImports().map((ni: any) => ni.getName()),
      })),
      exports: sourceFile.getExportSymbols().map((sym: Symbol) => ({
        name: sym.getName(),
        kind: this.mapSymbolKind(sym),
      })),
      classes: sourceFile
        .getClasses()
        .map((cls: any) => this.mapToClassInfo(cls)),
      functions: sourceFile
        .getFunctions()
        .map((fn: any) => this.mapToFunctionInfo(fn)),
      interfaces: sourceFile
        .getInterfaces()
        .map((itf: any) => this.mapToInterfaceInfo(itf)),
      typeAliases: sourceFile
        .getTypeAliases()
        .map((ta: any) => this.mapToTypeAliasInfo(ta)),
      enums: sourceFile.getEnums().map((enm: any) => this.mapToEnumInfo(enm)),
    };

    return structure;
  }

  /**
   * Helper: Map ts-morph Node (Declaration) to DefinitionLocation
   */
  private mapToDefinitionLocation(node: Node): DefinitionLocation {
    const sourceFile = node.getSourceFile();
    const lineAndColumn = sourceFile.getLineAndColumnAtPos(node.getStart());

    return {
      file: sourceFile.getFilePath(),
      line: lineAndColumn.line,
      column: lineAndColumn.column,
      kind: this.mapNodeToSymbolKind(node),
      snippet: node.getText(),
      documentation: this.getJsDoc(node),
    };
  }

  /**
   * Helper: Map ts-morph Node to SymbolKind
   */
  private mapNodeToSymbolKind(node: Node): SymbolKind {
    if (Node.isClassDeclaration(node)) return 'class';
    if (Node.isFunctionDeclaration(node)) return 'function';
    if (Node.isInterfaceDeclaration(node)) return 'interface';
    if (Node.isTypeAliasDeclaration(node)) return 'type_alias';
    if (Node.isEnumDeclaration(node)) return 'enum';
    if (Node.isVariableDeclaration(node)) return 'variable';
    if (Node.isMethodDeclaration(node)) return 'method';
    if (Node.isPropertyDeclaration(node)) return 'property';
    if (Node.isParameterDeclaration(node)) return 'parameter';
    return 'variable'; // Default
  }

  /**
   * Helper: Map Symbol to SymbolKind
   */
  private mapSymbolKind(symbol: Symbol): SymbolKind {
    const decls = symbol.getDeclarations();
    if (decls.length > 0) return this.mapNodeToSymbolKind(decls[0]);
    return 'variable';
  }

  /**
   * Helper: Get JSDoc from Node
   */
  private getJsDoc(node: Node): string | undefined {
    if (Node.isJSDocable(node)) {
      const docs = node.getJsDocs();
      if (docs.length > 0) {
        return docs[0].getCommentText();
      }
    }
    return undefined;
  }

  /**
   * Helper: Get full JSDoc info (with tags)
   */
  public getSymbolDocs(node: Node) {
    if (Node.isJSDocable(node)) {
      const docs = node.getJsDocs();
      if (docs.length > 0) {
        const doc = docs[0];
        return {
          documentation: doc.getCommentText(),
          tags: doc.getTags().map((tag) => ({
            name: tag.getTagName(),
            text: tag.getCommentText() || '',
          })),
        };
      }
    }
    return undefined;
  }

  private mapToClassInfo(cls: any): ClassInfo {
    return {
      name: cls.getName() || 'anonymous',
      ...this.getSymbolDocs(cls),
      methods: cls.getMethods().map((m: any) => this.mapToFunctionInfo(m)),
      properties: cls
        .getProperties()
        .map((p: any) => this.mapToPropertyInfo(p)),
    };
  }

  private mapToFunctionInfo(fn: any): FunctionInfo {
    return {
      name: fn.getName() || 'anonymous',
      ...this.getSymbolDocs(fn),
      params: fn.getParameters().map((p: any) => ({
        name: p.getName(),
        type: p.getType().getText(),
      })),
      returnType: fn.getReturnType().getText(),
    };
  }

  private mapToPropertyInfo(p: any) {
    return {
      name: p.getName(),
      type: p.getType().getText(),
      ...this.getSymbolDocs(p),
    };
  }

  private mapToInterfaceInfo(itf: any): InterfaceInfo {
    return {
      name: itf.getName(),
      ...this.getSymbolDocs(itf),
      properties: itf
        .getProperties()
        .map((p: any) => this.mapToPropertyInfo(p)),
      methods: itf.getMethods().map((m: any) => this.mapToFunctionInfo(m)),
    };
  }

  private mapToTypeAliasInfo(ta: any): TypeAliasInfo {
    return {
      name: ta.getName(),
      type: ta.getType().getText(),
      ...this.getSymbolDocs(ta),
    };
  }

  private mapToEnumInfo(enm: any): EnumInfo {
    return {
      name: enm.getName(),
      ...this.getSymbolDocs(enm),
      members: enm.getMembers().map((m: any) => m.getName()),
    };
  }

  /**
   * Helper: Deduplicate locations
   */
  private deduplicateLocations<
    T extends { file: string; line: number; column: number },
  >(locations: T[]): T[] {
    const seen = new Set<string>();
    return locations.filter((loc) => {
      const key = `${loc.file}:${loc.line}:${loc.column}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const typescriptAdapter = new TypeScriptAdapter();
