# TextSculpt

TextSculpt is a modern, component-based toolkit for building collaborative, rich text-editing experiences. At its core is a universal React component that can be integrated into any web application, designed to handle real-time collaboration, document processing, and intelligent caching out of the box.

This repository contains the core TextSculpt packages and a demo web application that showcases its capabilities.

## Core Features

- **Real-Time Collaboration:** Built from the ground up for simultaneous editing, using CRDTs (via Y.js) with Firebase Realtime Database as the messaging channel for conflict-free writing experiences.
- **Universal, Provider-Agnostic Design:** The editor component is completely decoupled from any specific backend, authentication, or storage provider, making it usable in any technology stack.
- **Intelligent Performance Optimizations:** Advanced caching strategies including optimistic loading, parallel cache/processing, and stale-while-revalidate patterns for optimal user experience.
- **Robust Error Handling:** Comprehensive error handling with retry logic, graceful degradation, and meaningful user feedback for all operations.
- **Extensible Architecture:** Clean separation of concerns with pluggable file processors and cache providers, allowing for easy customization and extension.

## Architecture Overview

TextSculpt is a monorepo managed by npm workspaces, designed with strict package boundaries and universal applicability.

```
TextSculpt/
├── apps/
│   └── web/            # Demo Next.js application (for testing/demonstration only)
│
└── packages/
    ├── editor/         # Universal React component (provider-agnostic)
    ├── document-cache/ # Generic caching service with provider abstraction
    └── processors/     # File format conversion functions
```

### The Packages

1.  **`@textsculpt/editor` (Universal React Component)**
    The main public-facing package that developers install. It's completely provider-agnostic and orchestrates document processing, caching, and collaboration. Accepts a file and user object, handles the entire document lifecycle internally, and returns the processed/edited file.

2.  **`@textsculpt/processors` (File Format Converters)**
    A library of specialist functions that convert different file formats (`.docx`, `.txt`, etc.) into a consistent, editable format. All processors follow the `ProcessorFunction` type: `(file: File) => Promise<string>`.

3.  **`@textsculpt/document-cache` (Intelligent Caching Engine)**
    A high-performance, provider-agnostic caching service with Firebase-specific providers. Features timestamp-based validation, cache eviction strategies, and supports multiple cache providers through abstraction.

## Backend Features & Performance Enhancements

### Advanced Caching Strategy
- **Cache-First Design:** Always check cache before processing files for optimal performance
- **Optimistic Loading:** Show cached content immediately while processing in background
- **Parallel Operations:** Cache checking and file processing run concurrently when possible
- **Stale-While-Revalidate:** Serve cached content while updating in background
- **Intelligent Cache Invalidation:** Use file modification timestamps for cache validation
- **Memory Management:** Automatic cache eviction for long-running sessions

### Real-Time Collaboration Engine
- **Y.js Integration:** CRDT-based conflict resolution for seamless collaborative editing
- **Firebase Realtime Database:** High-speed messaging channel for Y.js synchronization
- **User Presence:** Real-time indicators showing who's currently editing
- **Conflict Resolution:** Automatic conflict resolution using CRDT principles
- **Debounced Updates:** Throttled real-time updates to prevent network overload

### Robust Error Handling & Recovery
- **Comprehensive Error Boundaries:** React error boundaries prevent app crashes
- **Retry Logic:** Automatic retry mechanisms for failed operations
- **Graceful Degradation:** App continues working even when some features fail
- **Meaningful Feedback:** Clear, actionable error messages for users
- **Fallback Mechanisms:** Alternative processing paths for unsupported files

### Document Processing Pipeline
- **Extensible Processors:** Easy to add new file format support
- **Progress Indicators:** Visual feedback during file processing
- **Large File Optimization:** Efficient handling of large documents
- **Format Validation:** Automatic detection and validation of file formats
- **Error Recovery:** Fallback processing for corrupted or unsupported files

## How It Works: The Document Lifecycle

1.  **Input & Validation:** Component accepts a file and user object (no auth handling required)
2.  **Cache Check:** System checks for cached version using file's unique identifier
3.  **Parallel Processing:** If cache miss, file processing begins while showing loading state
4.  **Optimistic Loading:** If cache hit, content loads immediately while validating freshness
5.  **Collaborative Editing:** Y.js document syncs across all connected clients via Firebase
6.  **Output:** Returns processed/edited file to user (no automatic saving to original source)

## UI/UX Enhancements

- **Modern Design System:** Built with Origin UI and shadcn/ui components for consistency
- **Dark/Light Mode:** Theme switching with `next-themes` integration
- **Phosphor Icons:** Consistent iconography throughout the interface
- **Responsive Layout:** Optimized for all screen sizes and devices
- **Accessibility:** Full keyboard navigation and screen reader support

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm (v8 or later)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/EshwarReddy13/TextSculpt.git
    ```
2.  Navigate to the project root:
    ```sh
    cd TextSculpt
    ```
3.  Install all dependencies for all packages:
    ```sh
    npm install
    ```

### Running the Demo

To see the editor in action, run the demo web application:

```sh
cd apps/web
npm run dev
```

Open your browser to `http://localhost:3000` to view the application.

## Extending TextSculpt

### Adding New File Processors
Create a new processor function in `packages/processors/src/` following the `ProcessorFunction` type:
```typescript
export const processNewFormat: ProcessorFunction = async (file: File) => {
  // Process file and return string content
  return processedContent;
};
```

### Adding New Cache Providers
Implement the `CacheProvider` interface in `packages/document-cache/src/`:
```typescript
export class CustomCacheProvider implements CacheProvider {
  async get(key: string): Promise<string | null> { /* ... */ }
  async set(key: string, value: string): Promise<void> { /* ... */ }
  async delete(key: string): Promise<void> { /* ... */ }
}
```

### Custom Collaboration Backends
While Firebase Realtime Database is the officially supported backend for real-time collaboration, the architecture supports custom messaging channels for Y.js integration.

## Architecture Principles

- **Universal Applicability:** Core editor works with any backend, auth system, or storage provider
- **Provider Abstraction:** All provider-specific logic is abstracted behind interfaces
- **Performance First:** Caching and optimization strategies built into the core architecture
- **Error Resilience:** Comprehensive error handling at every layer
- **Extensibility:** Easy to add new processors, cache providers, and collaboration backends