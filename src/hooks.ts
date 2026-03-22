import type { VDomNode } from './vdom'; // Assuming VDomNode is defined in vdom.ts. PLEASE DEFINE IT.

// Define the structure for the component context
export interface ComponentContext {
  hooks: any[];
  component: () => VDomNode;
  domNode: HTMLElement | null;
  vDom: VDomNode | null;
  rerender: () => void;
}

// Globals to track the current component and hook index
let currentComponent: ComponentContext | null = null;
let hookIndex = 0;

// useState hook
export const useState = <T>(initialValue: T): [T, (newValue: T) => void] => {
  if (!currentComponent) {
    throw new Error("useState must be called within a component context");
  }

  // Capture the component context *for this specific hook call*
  const componentForHook = currentComponent;
  const hooks = componentForHook.hooks;
  const currentIndex = hookIndex;

  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = initialValue;
  }

  // The setState function closes over componentForHook and currentIndex
  const setState = (newValue: T) => {
      // No need to check componentForHook here if the outer check passed,
      // but we *must* use componentForHook, not the global currentComponent.

      // Check if the state actually changed using the captured context's hooks
      if (componentForHook.hooks[currentIndex] !== newValue) {
        componentForHook.hooks[currentIndex] = newValue;
        // Trigger re-render using the captured context's rerender function
        componentForHook.rerender();
      }
  };

  // Increment global hookIndex for the next hook call within the *same* component render
  hookIndex++;
  return [hooks[currentIndex] as T, setState];
};

// useEffect hook
export const useEffect = (effect: () => (void | (() => void)), deps?: any[]): void => {
  if (!currentComponent) {
    throw new Error("useEffect must be called within a component context");
  }

  const hooks = currentComponent.hooks;
  const oldDeps = hooks[hookIndex] as any[] | undefined;
  let hasChanged = true; // Assume dependencies have changed initially

  if (deps && oldDeps) {
    // If dependencies are provided, check if they have changed
    hasChanged = deps.length !== oldDeps.length || deps.some((dep, i) => dep !== oldDeps[i]);
  } else if (!deps && !oldDeps) {
    // If no dependencies provided ever, it should only run once (like componentDidMount)
    // But if called again without deps, it should run again. The check `!oldDeps` handles the first run.
    hasChanged = !oldDeps; // Will be true only on the first render
  }

  if (hasChanged) {
    hooks[hookIndex] = deps; // Store the new dependencies
    // Run the effect after the component has rendered (using setTimeout)
    // Store the cleanup function if the effect returns one
    setTimeout(() => {
      const cleanup = effect();
      if (typeof cleanup === 'function') {
        // We need a way to store and call cleanup functions before the next effect runs
        // This simple implementation doesn't handle cleanup properly yet.
        // A more robust solution would involve storing cleanup functions in the component context.
        // console.log("Effect cleanup function registered but not executed.");
        hooks[currentIndex + 0.5] = cleanup; // Store cleanup function
      }
    }, 0);
  }
    const currentIndex = hookIndex;

  // Clean up the previous effect if dependencies changed or component unmounts
  const cleanup = hooks[currentIndex + 0.5] as (() => void) | undefined;
  if (hasChanged && typeof cleanup === 'function') {
      cleanup();
      hooks[currentIndex + 0.5] = undefined; // Clear cleanup function
  }

  hookIndex++; // Increment for the next hook call
};

// Function to set the current component context (to be used in rendering)
export const setCurrentComponentContext = (component: ComponentContext | null): void => {
  currentComponent = component;
  hookIndex = 0; // Reset hook index for the new component rendering cycle
};

// Getter for the current component context (might be useful for debugging or advanced features)
export const getCurrentComponentContext = (): ComponentContext | null => {
  return currentComponent;
};
