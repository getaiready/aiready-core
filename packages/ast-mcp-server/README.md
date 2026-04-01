# @aiready/ast-mcp-server

AST-aware codebase exploration tools for Model Context Protocol.

## Features

- **Resolve Definition**: Pinpoint exactly where symbols are defined using TypeScript's type system.
- **Find References**: Locate every usage of a function, class, or variable.
- **Find Implementations**: Discover concrete implementations of interfaces and abstract classes.
- **File Structure overview**: Get a high-level summary of imports, exports, and declarations.
- **Search Code**: Blazingly fast regex search powered by Ripgrep.
- **Symbol Documentation**: Instantly fetch JSDoc/TSDoc for any symbol.
- **Symbol Indexing**: Project-wide symbol indexing for rapid navigation.

## Tools

### 1. `resolve_definition`

Find where a symbol is defined.

- `symbol`: Name of the symbol.
- `path`: Project root or target directory.

### 2. `find_references`

Find all usages of a symbol.

- `symbol`: Symbol name.
- `path`: Project root.

### 3. `find_implementations`

Find implementations for interfaces/abstract classes.

- `symbol`: Symbol name.
- `path`: Project root.

### 4. `get_file_structure`

Overview of a file's structure.

- `file`: Path to the file.

### 5. `search_code`

Fast regex search via bundled ripgrep.

- `pattern`: Regex pattern.
- `path`: Directory to search.
- `filePattern`: Optional glob filter.

### 6. `get_symbol_docs`

Retrieve only documentation for a symbol.

- `symbol`: Symbol name.
- `path`: Project root.

### 7. `build_symbol_index`

Build/Warm project-wide index.

- `path`: Project root to index.

## Installation

```bash
npx -y @aiready/ast-mcp-server
```

## Configuration

In your MCP client (e.g., Claude Desktop, Cursor, Windsurf):

```json
{
  "mcpServers": {
    "ast-explorer": {
      "command": "npx",
      "args": ["-y", "@aiready/ast-mcp-server"]
    }
  }
}
```

## Development

```bash
pnpm install
npm run build
npm run test
```
