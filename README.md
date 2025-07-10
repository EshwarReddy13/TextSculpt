# TextSculpt

TextSculpt is a modern, component-based toolkit for building collaborative, rich text-editing experiences. At its core is a reusable React component that can be integrated into any web application, designed to handle real-time collaboration, document processing, and performance caching out of the box.

This repository contains the core TextSculpt packages and a simple web application that demonstrates its capabilities.

## Core Features

- **Real-Time Collaboration:** Built from the ground up for simultaneous editing, using CRDTs (via Y.js) to ensure a conflict-free writing experience.
- **Component-Based Architecture:** The editor is delivered as a self-contained React component, making it easy to drop into any application.
- **Pluggable & Extensible:** Designed with a clean separation of concerns, allowing for custom file processors and caching providers.
- **Intelligent Caching:** Features a robust document caching layer to ensure fast load times for frequently accessed files, with a "stale-while-revalidate" approach for updates.
- **Provider-Agnostic Auth:** The core component is not tied to a specific authentication system. It accepts a generic user object, which the host application is responsible for providing.

## Architecture Overview

TextSculpt is a monorepo managed by npm workspaces. This structure allows us to maintain separate, independently versioned packages for different parts of the system.

```
TextSculpt/
├── apps/
│   └── web/            # Demo web application showcasing the editor.
│
└── packages/
    ├── editor/         # The main "smart" component that developers use.
    ├── document-cache/ # A generic service for caching processed documents.
    └── processors/     # A library of functions for converting file types.
```

### The Packages

1.  **`@textsculpt/editor` (The Smart Component)**
    This is the public-facing package that developers will install. It acts as an orchestrator, combining the power of the other packages to provide a simple API (e.g., `<BlockEditor file={file} />`). It handles the entire lifecycle of a document internally.

2.  **`@textsculpt/processors` (The File Converters)**
    A library of specialist functions responsible for converting different file formats (like `.docx` or `.xlsx`) into a consistent, editable format recognized by the editor (e.g., a Y.js document).

3.  **`@textsculpt/document-cache` (The Caching Engine)**
    A generic, high-performance service for caching the results of expensive file processing. It uses a timestamp-based validation system to serve cached content when possible and re-process it when the source file has changed. It uses Firebase as its backend but is architected to support other providers.

### The Demo App

The `apps/web` project is a simple Next.js application that serves as a live demonstration of how to integrate and use the `@textsculpt/editor` component.

## How It Works: The Document Lifecycle

1.  **First Load (Cache Miss):** A user provides a file. The system checks for a cached version using the file's unique ID. If none is found, it performs a one-time, server-side conversion of the file into the collaborative Y.js format and saves it to the cache.
2.  **Subsequent Loads (Cache Hit):** If a user opens the same file again and the source hasn't changed, the system bypasses the conversion step and loads the pre-processed document instantly from the cache.
3.  **Collaboration:** All connected clients sync their document state using Y.js, with Firebase Realtime Database acting as the high-speed messaging channel.
4.  **Cache Eviction:** An automated background job periodically cleans the cache, removing documents that haven't been accessed recently (e.g., in the last 30 days) to manage storage costs.

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

## Next Steps & Future Plans

This project is currently in the foundational phase. The immediate next steps from our implementation plan are:
1.  **Implement Real `.docx` Processing:** Replace the current dummy processor with a real implementation using a library like `mammoth.js`.
2.  **Integrate Y.js:** Fully wire up the editor UI to use a real Y.js document for state management.
3.  **Implement Auto-Saving:** Add the functionality to save content back to the original source provider.
4.  **Add Cache Eviction:** Create the automated background job for cleaning up the cache.