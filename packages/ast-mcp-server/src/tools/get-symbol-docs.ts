import { typescriptAdapter } from '../adapters/typescript-adapter';
import { projectManager } from '../project-manager';
import { SyntaxKind } from 'ts-morph';

export async function getSymbolDocs(symbol: string, path: string) {
  const projects = await projectManager.getProjectsForPath(path);

  for (const project of projects) {
    const sourceFiles = project.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      const node = sourceFile
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .find((id) => id.getText() === symbol);

      if (node) {
        const decls = node.getSymbol()?.getDeclarations();
        if (decls && decls.length > 0) {
          const docs = typescriptAdapter.getSymbolDocs(decls[0]);
          if (docs) {
            return {
              symbol,
              file: sourceFile.getFilePath(),
              line: sourceFile.getLineAndColumnAtPos(decls[0].getStart()).line,
              ...docs,
            };
          }
        }
      }
    }
  }

  return undefined;
}
