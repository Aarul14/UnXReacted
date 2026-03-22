import { updateElement, createDom } from './vdom';
import type { VDomNode } from './vdom';
import { setCurrentComponentContext } from './hooks';
import type { ComponentContext } from './hooks'; // Assuming ComponentContext is exported from hooks.ts

// Type for a component function
type ComponentFunction = () => VDomNode;

// Store component instances to manage their state and lifecycle
const componentRegistry = new Map<HTMLElement, ComponentContext>();

// Function to render or update a component
export const renderComponent = (Component: ComponentFunction, container: HTMLElement): void => {
  let componentContext = componentRegistry.get(container);

  if (!componentContext) {
    // First render: Create a new component context
    componentContext = {
      hooks: [],
      component: Component,
      domNode: null, // Will be set after initial render
      vDom: null,    // Will be set after initial render
      rerender: () => {
        if (componentContext) {
          renderComponent(componentContext.component, container);
        }
      },
    };
    componentRegistry.set(container, componentContext);
  } else {
    // Subsequent renders: Reset hook index for the existing context
    componentContext.hooks = [...componentContext.hooks]; // Maintain hook state continuity
    // Optionally: Clear previous effect cleanup functions here if not handled in useEffect
  }

  // Set the current component context for hooks
  setCurrentComponentContext(componentContext);

  // Execute the component function to get the new virtual DOM
  const newVDom = Component();

  // Perform the diffing and update the DOM
  if (componentContext.domNode === null) {
    // Initial render
    container.innerHTML = ''; // Clear container
    const newDomNode = createDom(newVDom);
    container.appendChild(newDomNode);
    componentContext.domNode = newDomNode as HTMLElement; // Store the root DOM node
  } else {
    // Update existing DOM
    updateElement(container, newVDom, componentContext.vDom, 0);
  }

  // Update the component context with the latest vDOM
  componentContext.vDom = newVDom;

  // Reset the current component context after rendering
  setCurrentComponentContext(null);
};
