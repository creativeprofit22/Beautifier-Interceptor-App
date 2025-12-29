"use client";

import { useState, useMemo } from "react";
import { File, Folder, ChevronRight, ChevronDown, Code, Search } from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
}

interface DecompiledViewerProps {
  files: FileNode[];
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
  fileContent?: string;
}

/**
 * Filter file tree nodes by search query (case-insensitive).
 * Returns nodes whose name or path matches, plus parent folders.
 */
function filterFileTree(nodes: FileNode[], query: string): FileNode[] {
  if (!query.trim()) return nodes;
  const lowerQuery = query.toLowerCase();

  function matches(node: FileNode): boolean {
    return (
      node.name.toLowerCase().includes(lowerQuery) || node.path.toLowerCase().includes(lowerQuery)
    );
  }

  function filterNode(node: FileNode): FileNode | null {
    if (node.type === "file") {
      return matches(node) ? node : null;
    }
    // For folders, include if matches OR has matching children
    const filteredChildren = node.children
      ?.map(filterNode)
      .filter((n): n is FileNode => n !== null);
    if (matches(node) || (filteredChildren && filteredChildren.length > 0)) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

  return nodes.map(filterNode).filter((n): n is FileNode => n !== null);
}

function FileTreeItem({
  node,
  depth = 0,
  onSelect,
  selectedPath,
  forceExpand,
}: {
  node: FileNode;
  depth?: number;
  onSelect: (path: string) => void;
  selectedPath?: string;
  forceExpand?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const shouldExpand = forceExpand || isExpanded;

  const handleClick = () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm transition-colors ${
          isSelected
            ? "bg-violet-500/20 text-violet-300"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type === "folder" ? (
          <>
            {shouldExpand ? (
              <ChevronDown className="h-3 w-3 shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0" />
            )}
            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className="h-4 w-4 shrink-0 text-zinc-500" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {node.type === "folder" && shouldExpand && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
              forceExpand={forceExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DecompiledViewer({
  files,
  onFileSelect,
  selectedFile,
  fileContent,
}: DecompiledViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = useMemo(() => filterFileTree(files, searchQuery), [files, searchQuery]);

  const handleFileSelect = (path: string) => {
    onFileSelect?.(path);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex h-[600px] overflow-hidden rounded-lg border border-zinc-800">
      {/* File Tree Panel */}
      <div className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 p-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 pr-3 pl-9 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="h-[calc(100%-57px)] overflow-y-auto p-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((node) => (
              <FileTreeItem
                key={node.path}
                node={node}
                onSelect={handleFileSelect}
                selectedPath={selectedFile}
                forceExpand={isSearching}
              />
            ))
          ) : isSearching ? (
            <p className="p-4 text-center text-sm text-zinc-500">
              No files match &quot;{searchQuery}&quot;
            </p>
          ) : (
            <p className="p-4 text-center text-sm text-zinc-500">No files to display</p>
          )}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="flex-1 bg-zinc-950">
        {selectedFile && fileContent ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
              <Code className="h-4 w-4 text-zinc-500" />
              <span className="truncate text-sm text-zinc-400">{selectedFile}</span>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-sm">
              <code className="text-zinc-300">{fileContent}</code>
            </pre>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Code className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
              <p className="text-sm text-zinc-500">Select a file to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
