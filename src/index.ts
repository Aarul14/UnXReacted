// src/index.ts

// Export core VDOM functions
export { createElement, render, updateElement } from './vdom';

// Export hooks
export { useState, useEffect } from './hooks';

// Export the component renderer
export { renderComponent } from './renderer';

// Export types (optional, but good practice for library consumers)
export type { VDomNode } from './vdom';
export type { ComponentContext } from './hooks'; // If you want to expose the context structure
