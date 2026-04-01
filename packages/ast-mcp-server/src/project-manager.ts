import { Project, ProjectOptions, TSConfigResolver } from 'ts-morph';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

/**
 * ProjectManager handles tsconfig discovery and Project lifecycle.
 * One Project per tsconfig.json to handle monorepo project boundaries correctly.
 */
export class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private tsconfigCache: Map<string, string[]> = new Map();

  /**
   * Find all tsconfig.json files in a directory (recursive)
   */
  public async findTsConfigs(rootDir: string): Promise<string[]> {
    if (this.tsconfigCache.has(rootDir)) {
      return this.tsconfigCache.get(rootDir)!;
    }

    const configs = await glob('**/tsconfig.json', {
      cwd: rootDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**'],
    });

    this.tsconfigCache.set(rootDir, configs);
    return configs;
  }

  /**
   * Get or create a Project for a specific file path
   */
  public async getProjectForFile(
    filePath: string
  ): Promise<Project | undefined> {
    const tsconfigPath = await this.findNearestTsConfig(filePath);
    if (!tsconfigPath) return undefined;

    return this.getOrCreateProject(tsconfigPath);
  }

  /**
   * Get or create a Project for a tsconfig path
   */
  public getOrCreateProject(tsconfigPath: string): Project {
    if (this.projects.has(tsconfigPath)) {
      return this.projects.get(tsconfigPath)!;
    }

    const project = new Project({
      tsConfigFilePath: tsconfigPath,
      skipAddingFilesFromTsConfig: false,
    });

    this.projects.set(tsconfigPath, project);
    return project;
  }

  /**
   * Find the nearest tsconfig.json for a file
   */
  private async findNearestTsConfig(
    filePath: string
  ): Promise<string | undefined> {
    let currentDir = path.dirname(filePath);
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const tsconfigPath = path.join(currentDir, 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        return tsconfigPath;
      }
      currentDir = path.dirname(currentDir);
    }

    return undefined;
  }

  /**
   * Get all projects that might contain a file or serve a path
   */
  public async getProjectsForPath(rootDir: string): Promise<Project[]> {
    const configs = await this.findTsConfigs(rootDir);
    return configs.map((config) => this.getOrCreateProject(config));
  }

  /**
   * Dispose all projects to free memory
   */
  public disposeAll() {
    for (const project of this.projects.values()) {
      project.getLanguageService().compilerObject.dispose();
    }
    this.projects.clear();
  }
}

export const projectManager = new ProjectManager();
