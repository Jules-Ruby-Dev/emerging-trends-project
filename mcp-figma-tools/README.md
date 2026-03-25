# MCP Figma Tools

Complete MCP server for generating React components, design tokens, and documentation from Figma designs.

## Features

### 5 Main Tools:

1. **Design Token Extractor** — Colors, spacing, typography → Tailwind/CSS variables
2. **Figma → React Generator** — Figma frames → React components with TypeScript
3. **Figma → Vanilla UI Generator** — HTML/CSS/TS components
4. **Component Documentation** — API docs, accessibility, usage examples, Storybook
5. **Master Coordinator** — Orchestrates all tools in one command

## Installation

```bash
npm install
npm run build
```

## Usage

### Starting the MCP Server

```bash
npm run dev
# or
npm start
```

### Via Claude/Codebase AI

Once the server is running, use these tools in your copilot:

```
- extract_design_tokens
- export_tailwind_config
- export_css_variables
- generate_react_components
- generate_component_with_story
- generate_vanilla_ui
- generate_web_components
- generate_component_docs
- generate_library_docs
- orchestrate_full_export (⭐ master command)
- sync_figma_to_repo
- validate_design_sync
```

## Configuration

Create a `.env` file:

```env
FIGMA_API_KEY=your_figma_api_key
FIGMA_FILE_ID=your_figma_file_id
```

## Example: Full Export

```bash
# Using the master coordinator tool
orchestrate_full_export({
  figmaFileId: "abc123",
  figmaApiKey: "token123",
  pages: ["Login", "Home", "Settings"],
  usesTailwind: true,
  usesShadcn: true
})
```

This will:

1. Extract all design tokens
2. Generate React components from all pages
3. Generate vanilla TS UI components
4. Create Tailwind config
5. Generate CSS variables
6. Create component documentation
7. Generate Storybook stories

## Output Structure

```
generated/
├── react/
│   ├── Login.tsx
│   ├── Home.tsx
│   └── Settings.tsx
├── vanilla/
│   ├── login.ts
│   ├── login.css
│   └── login.html
├── docs/
│   ├── COMPONENTS.md
│   └── accessibility.md
├── tailwind.config.js
├── design-tokens.css
└── .storybook/main.ts
```

## Pages in Your Figma File

The MCP server is configured for these pages:

1. **Login** — Authentication UI
2. **Home** — Chat with AR interface
3. **History** — Conversation history
4. **Settings** — User settings
5. **Pretend Friend settings** — AR companion configuration
6. **Pop-up mental health message** — Modal/notification components

## Getting Your Figma API Key

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Generate a personal access token
3. Save it in `.env` as `FIGMA_API_KEY`

## Getting Your File ID

Your Figma file URL looks like:

```
https://www.figma.com/file/abc123xyz/My-Design?...
                          ^^^^^^^^^^
```

The `abc123xyz` part is your `FIGMA_FILE_ID`.

## Integration with Your Project

### React Frontend

```bash
# Copy generated components
cp -r generated/react/* ../frontend/src/components/

# Copy Tailwind config
cp generated/tailwind.config.js ../frontend/

# Copy design tokens
cp generated/design-tokens.css ../frontend/src/styles/
```

### With Three.js AR Scene

The generated components are vanilla React - they integrate seamlessly with your Three.js WebXR implementation in `ar-scene.ts`.

## Next Steps

1. **Share your Figma file** with me or provide the file ID
2. **Run** `orchestrate_full_export` to generate everything
3. **Review** the generated components in `generated/`
4. **Customize** colors/styling as needed
5. **Integrate** into your React frontend

## Troubleshooting

### "Figma API Key invalid"

- Check `.env` file
- Verify token from Figma settings

### "File not found"

- Confirm `FIGMA_FILE_ID` is correct
- Ensure file is shared with your Figma account

### Missing components

- Check page names match your Figma file exactly
- Verify frames are named properly in Figma

## Development

```bash
# Type check
npm run type-check

# Build
npm run build

# Dev mode (with hot reload)
npm run dev
```

## License

MIT
