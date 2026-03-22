Below is an in-depth, step‐by‐step guide for turning your mini React implementation into a reusable npm package. This guide covers organizing your code into modules, configuring your project for bundling, writing tests, and finally publishing it so that others can install and use your library. You can adjust these steps as you extend your implementation.

Core task: Create react from scratch that has useEffect and useState, along with a component system.

We use Typescript and Bun.

---

## 1. Organize Your Project Structure [Done]

Start by laying out your project directory. A sample structure might look like this:

```
mini-react/
├── src/
│   ├── index.js         // Entry point that exports your library’s public API
│   ├── vdom.js          // Contains createElement, render, and diffing logic
│   ├── hooks.js         // Contains implementations for useState, useEffect, etc.
│   └── renderer.js      // Contains component rendering and re-rendering logic
├── test/
│   └── mini-react.test.js // Unit tests for your library features
├── package.json         // NPM package config
├── README.md            // Documentation
└── .gitignore           // Files to ignore in git
```

---

## 2. Modularize Your Code

Break your code into modules for maintainability and reusability. For example:

### **src/vdom.js**

```js
// src/vdom.js

// Create a virtual DOM element
export const createElement = (type, props = {}, ...children) => {
  return { type, props, children };
};

// Render a vDOM object into a real DOM node
export const render = (vdom, container) => {
  // Handle text and number nodes
  if (typeof vdom === "string" || typeof vdom === "number") {
    const textNode = document.createTextNode(vdom);
    container.appendChild(textNode);
    return;
  }

  // Create a DOM element from the vDOM type
  const domElement = document.createElement(vdom.type);

  // Assign props (consider enhancing for events, etc.)
  if (vdom.props) {
    Object.keys(vdom.props).forEach((propName) => {
      domElement[propName] = vdom.props[propName];
    });
  }

  // Render children recursively
  vdom.children.forEach((child) => render(child, domElement));
  container.appendChild(domElement);
};

// Helper: convert vDOM to a DOM node (used in diffing)
export const createDom = (vdom) => {
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(vdom);
  }
  const dom = document.createElement(vdom.type);
  if (vdom.props) {
    Object.keys(vdom.props).forEach((prop) => {
      dom[prop] = vdom.props[prop];
    });
  }
  vdom.children.forEach((child) => {
    dom.appendChild(createDom(child));
  });
  return dom;
};

// Update properties on a DOM element
export const updateProps = (dom, newProps = {}, oldProps = {}) => {
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      dom[key] = "";
    }
  });
  Object.keys(newProps).forEach((key) => {
    if (newProps[key] !== oldProps[key]) {
      dom[key] = newProps[key];
    }
  });
};

// Diffing and updating the DOM
export const updateElement = (parent, newNode, oldNode, index = 0) => {
  if (!oldNode) {
    parent.appendChild(createDom(newNode));
  } else if (!newNode) {
    parent.removeChild(parent.childNodes[index]);
  } else if (newNode.type !== oldNode.type) {
    parent.replaceChild(createDom(newNode), parent.childNodes[index]);
  } else {
    updateProps(parent.childNodes[index], newNode.props, oldNode.props);
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = 0; i < newLength || i < oldLength; i++) {
      updateElement(
        parent.childNodes[index],
        newNode.children[i],
        oldNode.children[i],
        i,
      );
    }
  }
};
```

### **src/hooks.js**

```js
// src/hooks.js

// Globals to track the current component and hook index
let currentComponent = null;
let hookIndex = 0;

// useState hook
export const useState = (initialValue) => {
  const hooks = currentComponent.hooks;

  if (hooks[hookIndex] === undefined) {
    hooks[hookIndex] = initialValue;
  }
  const currentIndex = hookIndex;

  // Update state and trigger a re-render
  const setState = (newValue) => {
    hooks[currentIndex] = newValue;
    currentComponent.rerender();
  };

  return [hooks[hookIndex++], setState];
};

// useEffect hook
export const useEffect = (effect, deps) => {
  const hooks = currentComponent.hooks;
  const hasNoDeps = !deps;
  const oldDeps = hooks[hookIndex];
  const depsChanged = oldDeps
    ? !deps.every((dep, i) => dep === oldDeps[i])
    : true;

  if (hasNoDeps || depsChanged) {
    hooks[hookIndex] = deps;
    setTimeout(effect, 0);
  }
  hookIndex++;
};

// Function to set the current component context (to be used in rendering)
export const setCurrentComponent = (component) => {
  currentComponent = component;
  hookIndex = 0;
};
```

### **src/renderer.js**

```js
// src/renderer.js

import { render } from "./vdom.js";
import { setCurrentComponent } from "./hooks.js";

// Function to render a component
export const renderComponent = (Component, container) => {
  const componentContext = {
    hooks: [],
    component: Component,
    container,
    rerender: () => {
      componentContext.hooks = [...componentContext.hooks]; // Optionally clone hooks if needed.
    },
  };
  setCurrentComponent(componentContext);
  container.innerHTML = ""; // Clear container before rendering new content
  const vdom = Component();
  render(vdom, container);
};
```

### **src/index.js**

This file exposes your package’s public API. For example:

```js
// src/index.js

export { createElement, render, updateElement } from "./vdom.js";
export { useState, useEffect } from "./hooks.js";
export { renderComponent } from "./renderer.js";
```

---

## 3. Configure the Package with package.json

We have already used Bun to initialize the project.

Fill in the details and specify the entry point as `src/index.js`. Here is a sample `package.json`:

```json
{
  "name": "react-from-scratch",
  "version": "1.0.0",
  "description": "A minimal React-like library with basic virtual DOM, useState, and useEffect. I built this to understand how React works.",
  "main": "src/index.js",
  "scripts": {
    "build": "rollup -c",
    "test": "jest"
  },
  "keywords": ["react", "mini-react", "virtual-dom", "hooks"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "rollup": "^3.0.0",
    "rollup-plugin-terser": "^7.0.2",
    "jest": "^29.0.0"
  }
}
```

## The above is just an example.

## 4. Write Unit Tests

Using a framework like Jest, write tests to ensure your implementation works. In `test/mini-react.test.js`, you might test simple rendering or state updates:

```js
// test/mini-react.test.js
import { createElement } from "../src/vdom.js";

test("createElement produces a valid vDOM node", () => {
  const node = createElement("div", { id: "test" }, "Hello");
  expect(node).toEqual({
    type: "div",
    props: { id: "test" },
    children: ["Hello"],
  });
});
```

Run your tests with:

```bash
npm run test
```

---

## 5. Document Your Library

Write a `README.md` file that explains:

- **Installation:**  
  How users can install your package (e.g., via `npm install mini-react`).

- **Usage:**  
  Include example usage showing how to import the library, use `renderComponent`, and utilize hooks.

- **API Reference:**  
  Document functions like `createElement`, `useState`, `useEffect`, and any configuration or advanced use cases.

A detailed `README.md` encourages adoption.

---
