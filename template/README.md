# `UnXReacted` – React Reimagined from Scratch

This project is a hands-on exploration of how React works internally by building a minimal version of it using pure TypeScript.

The goal is simple: **understand React by recreating it** — including core concepts like hooks, rendering, and the virtual DOM.

---

## 🚀 What’s Included

This lightweight implementation currently supports:

- `useState`
- `useEffect`
- Basic component rendering
- Virtual DOM structure and diffing

All of this is implemented in a **minimal codebase**, with most files staying under 100 lines.

---

## 📦 Size Overview

- Package size: **~9.7 kB**
- Unpacked size: **~30.4 kB**  
  _(~49.8 kB including favicon assets)_

---

## 🧠 Purpose of This Project

This is **not a production-ready framework**.

Instead, it’s built for:

- Learning how React works internally
- Understanding hooks lifecycle
- Exploring rendering and diffing mechanisms
- Getting comfortable with low-level TypeScript

Think of it as a **learning playground for React internals**.

---

## 🛠 Where to Start

The main development happens in:
src/app.ts

This is where you can:

- Build your own components
- Experiment with hooks
- Test how rendering behaves

Since this is a low-level implementation, expect to work closer to raw TypeScript than typical React.

---

## ⚙️ Setup

### 1. Install the package

```bash
npm install unreacted

```

or

```bash
bun install unreacted
```

or

```bash
pnpm install unreacted
```

## 2. Install dependencies

```bash
bun install
```

This installs all required dependencies including TypeScript and Bun typings.

---

## 🏗 Build the Project

This project uses Bun’s built-in bundler to compile TypeScript.

Run:

```bash
bun run build
```

This generates:

```
dist/bundle.js
```

---

## ▶️ Run the App

After building:

```bash
bun run dev
```

Then open:

```
index.html
```

in your browser.

This will load the bundled script and render the example component (like a counter) on the page.

---

## 📁 Project Structure

```
index.html          # Entry HTML file
src/
  app.ts            # Main app (your playground)
  vdom.ts           # Virtual DOM + diffing logic
  hooks.ts          # useState & useEffect implementation
  renderer.ts       # Rendering engine
  index.ts          # Library exports

dist/
  bundle.js         # Compiled output

package.json        # Scripts & dependencies
tsconfig.json       # TypeScript config
```

---

## 🎯 Why Use This?

If you’ve ever wondered:

- How does `useState` actually store state?
- How does React know when to re-render?
- What is Virtual DOM diffing really doing?

This project helps you see it, not just read about it.
