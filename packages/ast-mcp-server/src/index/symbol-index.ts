import { projectManager } from '../project-manager';
import { IndexingStats } from '../types';
import os from 'os';

export class SymbolIndex {
  /**
   * Build/Warm the index for a given path
   */
  public async buildIndex(rootDir: string): Promise<IndexingStats> {
    const startTime = Date.now();
    const projects = await projectManager.getProjectsForPath(rootDir);

    let fileCount = 0;
    let functionCount = 0;
    let classCount = 0;
    let interfaceCount = 0;
    let typeCount = 0;

    for (const project of projects) {
      const sourceFiles = project.getSourceFiles();
      fileCount += sourceFiles.length;

      for (const sourceFile of sourceFiles) {
        functionCount += sourceFile.getFunctions().length;
        classCount += sourceFile.getClasses().length;
        interfaceCount += sourceFile.getInterfaces().length;
        typeCount += sourceFile.getTypeAliases().length;
      }
    }

    const duration = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    return {
      indexed: {
        files: fileCount,
        functions: functionCount,
        classes: classCount,
        interfaces: interfaceCount,
        types: typeCount,
      },
      duration_ms: duration,
      memory_mb: Math.round(memoryUsage),
    };
  }
}

export const symbolIndex = new SymbolIndex();
