import { TSESTree } from '@typescript-eslint/typescript-estree';
import { Severity } from '@aiready/core';
import type { NamingIssue } from '../types';
import {
  parseFile,
  traverseAST,
  getLineNumber,
  isLoopStatement,
} from '../utils/ast-parser';
import {
  buildCodeContext,
  isAcceptableInContext,
  adjustSeverity,
} from '../utils/context-detector';

/**
 * Advanced naming analyzer using TypeScript AST
 */
export async function analyzeNamingAST(
  filePaths: string[]
): Promise<NamingIssue[]> {
  const allIssues: NamingIssue[] = [];

  for (const filePath of filePaths) {
    try {
      const ast = parseFile(filePath);
      if (!ast) continue;

      const context = buildCodeContext(filePath, ast);
      const issues = analyzeIdentifiers(ast, filePath, context);
      allIssues.push(...issues);
    } catch (err) {
      void err;
    }
  }

  return allIssues;
}

/**
 * Traverse AST and find naming issues in identifiers
 */
function analyzeIdentifiers(
  ast: TSESTree.Program,
  filePath: string,
  context: any
): NamingIssue[] {
  const issues: NamingIssue[] = [];
  const scopeTracker = new ScopeTracker();

  traverseAST(ast, {
    enter: (node) => {
      // 1. Variable Declarations
      if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
        const isParameter = false;
        const isLoopVariable = isLoopStatement(node.parent?.parent);
        scopeTracker.declareVariable(
          node.id.name,
          node.id,
          getLineNumber(node.id),
          { isParameter, isLoopVariable }
        );
      }

      // 2. Function Parameters
      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        const isArrowParameter = node.type === 'ArrowFunctionExpression';
        node.params.forEach((param) => {
          if (param.type === 'Identifier') {
            scopeTracker.declareVariable(
              param.name,
              param,
              getLineNumber(param),
              { isParameter: true, isArrowParameter }
            );
          } else if (param.type === 'ObjectPattern') {
            // Handle destructured parameters: { id, name }
            extractDestructuredIdentifiers(param, scopeTracker, {
              isParameter: true,
              isArrowParameter,
            });
          }
        });
      }

      // 3. Class/Interface/Type names
      if (
        (node.type === 'ClassDeclaration' ||
          node.type === 'TSInterfaceDeclaration' ||
          node.type === 'TSTypeAliasDeclaration') &&
        node.id
      ) {
        checkNamingConvention(
          node.id.name,
          'PascalCase',
          node.id,
          filePath,
          issues,
          context
        );
      }
    },
  });

  // Check all collected variables
  for (const varInfo of scopeTracker.getVariables()) {
    checkVariableNaming(varInfo, filePath, issues, context);
  }

  return issues;
}

/**
 * Check if a name follows a specific convention
 */
function checkNamingConvention(
  name: string,
  convention: 'camelCase' | 'PascalCase' | 'UPPER_CASE',
  node: TSESTree.Node,
  file: string,
  issues: NamingIssue[],
  context: any
) {
  let isValid = true;
  if (convention === 'PascalCase') {
    isValid = /^[A-Z][a-zA-Z0-9]*$/.test(name);
  } else if (convention === 'camelCase') {
    isValid = /^[a-z][a-zA-Z0-9]*$/.test(name);
  } else if (convention === 'UPPER_CASE') {
    isValid = /^[A-Z][A-Z0-9_]*$/.test(name);
  }

  if (!isValid) {
    const severity = adjustSeverity(Severity.Info, context, 'convention-mix');
    issues.push({
      file,
      line: getLineNumber(node),
      type: 'convention-mix',
      identifier: name,
      severity,
      suggestion: `Follow ${convention} for this identifier`,
    });
  }
}

/**
 * Advanced variable naming checks
 */
function checkVariableNaming(
  varInfo: any,
  file: string,
  issues: NamingIssue[],
  context: any
) {
  const { name, line, options } = varInfo;

  // Skip very common small names if they are in acceptable context
  if (isAcceptableInContext(name, context, options)) {
    return;
  }

  // 1. Single letter names
  if (
    name.length === 1 &&
    !options.isLoopVariable &&
    !options.isArrowParameter
  ) {
    const severity = adjustSeverity(Severity.Minor, context, 'poor-naming');
    issues.push({
      file,
      line,
      type: 'poor-naming',
      identifier: name,
      severity,
      suggestion: 'Use a more descriptive name than a single letter',
    });
  }

  // 2. Vague names
  const vagueNames = [
    'data',
    'info',
    'item',
    'obj',
    'val',
    'tmp',
    'temp',
    'thing',
    'stuff',
  ];
  if (vagueNames.includes(name.toLowerCase())) {
    const severity = adjustSeverity(Severity.Minor, context, 'poor-naming');
    issues.push({
      file,
      line,
      type: 'poor-naming',
      identifier: name,
      severity,
      suggestion: `Avoid vague names like '${name}'. What does this data represent?`,
    });
  }

  // 3. Abbreviations
  if (
    name.length > 1 &&
    name.length <= 3 &&
    !options.isLoopVariable &&
    !isCommonAbbreviation(name)
  ) {
    const severity = adjustSeverity(Severity.Info, context, 'abbreviation');
    issues.push({
      file,
      line,
      type: 'abbreviation',
      identifier: name,
      severity,
      suggestion: 'Avoid non-standard abbreviations',
    });
  }
}

function isCommonAbbreviation(name: string): boolean {
  const common = [
    'id',
    'db',
    'fs',
    'os',
    'ip',
    'ui',
    'ux',
    'api',
    'env',
    'url',
    'req',
    'res',
    'err',
    'ctx',
    'cb',
    'idx',
    'src',
    'dir',
    'app',
    'dev',
    'qa',
    'dto',
    'dao',
    'ref',
    'ast',
    'dom',
    'log',
    'msg',
    'pkg',
    'req',
    'err',
    'res',
    'css',
    'html',
    'xml',
    'jsx',
    'tsx',
    'ts',
    'js',
  ];
  return common.includes(name.toLowerCase());
}

/**
 * Simple scope-aware variable tracker
 */
class ScopeTracker {
  private variables: any[] = [];

  declareVariable(
    name: string,
    node: TSESTree.Node,
    line: number,
    options = {}
  ) {
    this.variables.push({ name, node, line, options });
  }

  getVariables() {
    return this.variables;
  }
}

/**
 * Extracts identifiers from destructured patterns (object or array destructuring)
 * and registers them in the scope tracker.
 * @param node - The AST node representing the destructured pattern
 * @param isParameter - When true, indicates the destructured variable is a function parameter; when false, it's a local variable
 * @param scopeTracker - The scope tracker to register variables with
 */
function extractDestructuredIdentifiers(
  node: TSESTree.ObjectPattern | TSESTree.ArrayPattern,
  scopeTracker: ScopeTracker,
  options: {
    isParameter?: boolean;
    isArrowParameter?: boolean;
  } = {}
) {
  const { isParameter = false, isArrowParameter = false } = options;

  if (node.type === 'ObjectPattern') {
    node.properties.forEach((prop) => {
      if (prop.type === 'Property' && prop.value.type === 'Identifier') {
        scopeTracker.declareVariable(
          prop.value.name,
          prop.value,
          getLineNumber(prop.value),
          {
            isParameter,
            isDestructured: true,
            isArrowParameter,
          }
        );
      }
    });
  } else if (node.type === 'ArrayPattern') {
    for (const element of node.elements) {
      if (element?.type === 'Identifier') {
        scopeTracker.declareVariable(
          element.name,
          element,
          getLineNumber(element),
          {
            isParameter,
            isDestructured: true,
            isArrowParameter,
          }
        );
      }
    }
  }
}
