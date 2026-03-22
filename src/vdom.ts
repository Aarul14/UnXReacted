// Define the structure for a virtual DOM element
export interface VDomNode {
  type: string;
  props: Record<string, any>; // Simple props handling, can be enhanced
  children: (VDomNode | string | number)[];
}

// Create a virtual DOM element
export const createElement = (
  type: string,
  props: Record<string, any> = {},
  ...children: (VDomNode | string | number)[]
): VDomNode => {
  return { type, props, children };
};

// Render a vDOM object into a real DOM node
export const render = (vdom: VDomNode | string | number, container: HTMLElement): void => {
  // Handle text and number nodes
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    const textNode = document.createTextNode(String(vdom));
    container.appendChild(textNode);
    return;
  }

  // Create a DOM element from the vDOM type
  const domElement = document.createElement(vdom.type);

  // Assign props
  updateProps(domElement, vdom.props);

  // Render children recursively
  vdom.children.forEach(child => render(child, domElement));
  container.appendChild(domElement);
};

// Helper: convert vDOM to a DOM node (used in diffing)
export const createDom = (vdom: VDomNode | string | number): Node => {
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(String(vdom));
  }
  const dom = document.createElement(vdom.type);
  updateProps(dom, vdom.props);

  vdom.children.forEach(child => {
    dom.appendChild(createDom(child));
  });
  return dom;
};

// Update properties on a DOM element
export const updateProps = (
    dom: HTMLElement,
    newProps: Record<string, any> = {},
    oldProps: Record<string, any> = {}
  ): void => {

    // Remove old properties or attributes
    Object.keys(oldProps).forEach(key => {
      if (!(key in newProps)) {
        if (key.startsWith('on')) {
          // Remove old event listener
          const eventName = key.substring(2).toLowerCase();
          if (typeof oldProps[key] === 'function') {
            dom.removeEventListener(eventName, oldProps[key]);
          }
        } else if (key === 'children') {
          // Ignore children prop
        } else if (key === 'style') {
           // Clear inline styles if style object removed
           dom.style.cssText = '';
        } else if (key === 'className') {
            dom.removeAttribute('class');
        } else if (typeof (dom as any)[key] === 'boolean') {
            // Reset boolean properties like checked, disabled
             (dom as any)[key] = false;
             dom.removeAttribute(key); // Also remove attribute
        } else {
          // Remove attribute for others
          dom.removeAttribute(key);
        }
      }
    });

    // Set new or updated properties or attributes
    Object.keys(newProps).forEach(key => {
      if (newProps[key] !== oldProps[key]) {
        if (key.startsWith('on')) {
          // Update event listener
          const eventName = key.substring(2).toLowerCase();
          // Remove potential old listener from oldProps first
          if (typeof oldProps[key] === 'function') {
            dom.removeEventListener(eventName, oldProps[key]);
          }
          // Add new listener
          if (typeof newProps[key] === 'function') {
            dom.addEventListener(eventName, newProps[key]);
          } else if (newProps[key] != null) {
             console.warn(`Invalid event handler for ${eventName}:`, newProps[key]);
          }
        } else if (key === 'children') {
           // Ignore children prop, handled by recursion
        } else if (key === 'style' && typeof newProps.style === 'object') {
            // Handle style objects
            const style = newProps.style;
            dom.style.cssText = ''; // Clear existing inline styles first
            Object.keys(style).forEach(styleName => {
                (dom.style as any)[styleName] = style[styleName];
            });
        } else if (key === 'className') {
            dom.setAttribute('class', newProps[key]);
        } else if (typeof (dom as any)[key] === 'boolean') {
             // Handle boolean properties like checked, disabled
             const value = Boolean(newProps[key]);
             (dom as any)[key] = value;
             // Reflect boolean property as attribute
             if (value) {
                 dom.setAttribute(key, ''); // Add attribute like <input disabled>
             } else {
                 dom.removeAttribute(key);
             }
        } else if (key === 'value' && (dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement || dom instanceof HTMLSelectElement)) {
            // Handle value property specifically for form elements to avoid cursor issues
            if (dom.value !== newProps[key]) {
                dom.value = newProps[key];
            }
            // Also set attribute if needed, although property is usually preferred
            dom.setAttribute(key, newProps[key]);
        } else {
           // Set attribute for all other cases
           dom.setAttribute(key, newProps[key]);
        }
      }
    });
};

// Diffing and updating the DOM
export const updateElement = (
  parent: HTMLElement,
  newNode: VDomNode | string | number | null,
  oldNode: VDomNode | string | number | null,
  index = 0
): void => {

  const childNodes = parent.childNodes;
  const targetNode = childNodes[index] as HTMLElement; // Cast for property access

  if (oldNode === null) {
    // Add new node if oldNode doesn't exist
    if (newNode !== null) {
        parent.appendChild(createDom(newNode));
    }
  } else if (newNode === null) {
    // Remove node if newNode doesn't exist
    if (index < childNodes.length) {
        parent.removeChild(targetNode);
    }
  } else if (
    (typeof newNode !== typeof oldNode) ||
    ((typeof newNode === 'string' || typeof newNode === 'number') && newNode !== oldNode) ||
    (typeof newNode === 'object' && typeof oldNode === 'object' && newNode.type !== oldNode.type)
  ) {
    // Replace node if types are different or text content differs
     if (index < childNodes.length) {
         parent.replaceChild(createDom(newNode), targetNode);
     }
  } else if (typeof newNode === 'object' && typeof oldNode === 'object' && newNode.type) {
    // Update props if types are the same and it's an element node
    updateProps(targetNode, newNode.props, oldNode.props);

    // Recursively diff children
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = 0; i < newLength || i < oldLength; i++) {
      updateElement(
        targetNode,
        newNode.children[i] || null,
        oldNode.children[i] || null,
        i
      );
    }
  }
};
