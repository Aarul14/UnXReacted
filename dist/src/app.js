import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/vdom.ts
var createElement = (type, props = {}, ...children) => {
  return { type, props, children };
};
var createDom = (vdom) => {
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(String(vdom));
  }
  const dom = document.createElement(vdom.type);
  updateProps(dom, vdom.props);
  vdom.children.forEach((child) => {
    dom.appendChild(createDom(child));
  });
  return dom;
};
var updateProps = (dom, newProps = {}, oldProps = {}) => {
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        if (typeof oldProps[key] === "function") {
          dom.removeEventListener(eventName, oldProps[key]);
        }
      } else if (key === "children") {} else if (key === "style") {
        dom.style.cssText = "";
      } else if (key === "className") {
        dom.removeAttribute("class");
      } else if (typeof dom[key] === "boolean") {
        dom[key] = false;
        dom.removeAttribute(key);
      } else {
        dom.removeAttribute(key);
      }
    }
  });
  Object.keys(newProps).forEach((key) => {
    if (newProps[key] !== oldProps[key]) {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        if (typeof oldProps[key] === "function") {
          dom.removeEventListener(eventName, oldProps[key]);
        }
        if (typeof newProps[key] === "function") {
          dom.addEventListener(eventName, newProps[key]);
        } else if (newProps[key] != null) {
          console.warn(`Invalid event handler for ${eventName}:`, newProps[key]);
        }
      } else if (key === "children") {} else if (key === "style" && typeof newProps.style === "object") {
        const style = newProps.style;
        dom.style.cssText = "";
        Object.keys(style).forEach((styleName) => {
          dom.style[styleName] = style[styleName];
        });
      } else if (key === "className") {
        dom.setAttribute("class", newProps[key]);
      } else if (typeof dom[key] === "boolean") {
        const value = Boolean(newProps[key]);
        dom[key] = value;
        if (value) {
          dom.setAttribute(key, "");
        } else {
          dom.removeAttribute(key);
        }
      } else if (key === "value" && (dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement || dom instanceof HTMLSelectElement)) {
        if (dom.value !== newProps[key]) {
          dom.value = newProps[key];
        }
        dom.setAttribute(key, newProps[key]);
      } else {
        dom.setAttribute(key, newProps[key]);
      }
    }
  });
};
var updateElement = (parent, newNode, oldNode, index = 0) => {
  const childNodes = parent.childNodes;
  const targetNode = childNodes[index];
  if (oldNode === null) {
    if (newNode !== null) {
      parent.appendChild(createDom(newNode));
    }
  } else if (newNode === null) {
    if (index < childNodes.length) {
      parent.removeChild(targetNode);
    }
  } else if (typeof newNode !== typeof oldNode || (typeof newNode === "string" || typeof newNode === "number") && newNode !== oldNode || typeof newNode === "object" && typeof oldNode === "object" && newNode.type !== oldNode.type) {
    if (index < childNodes.length) {
      parent.replaceChild(createDom(newNode), targetNode);
    }
  } else if (typeof newNode === "object" && typeof oldNode === "object" && newNode.type) {
    updateProps(targetNode, newNode.props, oldNode.props);
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = 0;i < newLength || i < oldLength; i++) {
      updateElement(targetNode, newNode.children[i] || null, oldNode.children[i] || null, i);
    }
  }
};
// src/hooks.ts
var currentComponent = null;
var hookIndex = 0;
var useState = (initialValue) => {
  if (!currentComponent) {
    throw new Error("useState must be called within a component context");
  }
  const componentForHook = currentComponent;
  const hooks = componentForHook.hooks;
  const currentIndex = hookIndex;
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = initialValue;
  }
  const setState = (newValue) => {
    if (componentForHook.hooks[currentIndex] !== newValue) {
      componentForHook.hooks[currentIndex] = newValue;
      componentForHook.rerender();
    }
  };
  hookIndex++;
  return [hooks[currentIndex], setState];
};
var setCurrentComponentContext = (component) => {
  currentComponent = component;
  hookIndex = 0;
};
// src/renderer.ts
var componentRegistry = new Map;
var renderComponent = (Component, container) => {
  let componentContext = componentRegistry.get(container);
  if (!componentContext) {
    componentContext = {
      hooks: [],
      component: Component,
      domNode: null,
      vDom: null,
      rerender: () => {
        if (componentContext) {
          renderComponent(componentContext.component, container);
        }
      }
    };
    componentRegistry.set(container, componentContext);
  } else {
    componentContext.hooks = [...componentContext.hooks];
  }
  setCurrentComponentContext(componentContext);
  const newVDom = Component();
  if (componentContext.domNode === null) {
    container.innerHTML = "";
    const newDomNode = createDom(newVDom);
    container.appendChild(newDomNode);
    componentContext.domNode = newDomNode;
  } else {
    updateElement(container, newVDom, componentContext.vDom, 0);
  }
  componentContext.vDom = newVDom;
  setCurrentComponentContext(null);
};
// src/app.ts
function CounterComponent() {
  const [count, setCount] = useState(0);
  console.log("Rendering CounterComponent, count:", count);
  return createElement("div", {}, createElement("h1", {}, `Count: ${count}`), createElement("button", {
    onclick: () => {
      console.log("Increment button clicked!");
      setCount(count + 1);
    }
  }, "Increment"), createElement("button", {
    onclick: () => {
      console.log("Decrement button clicked!");
      setCount(count - 1);
    },
    style: { marginLeft: "5px" }
  }, "Decrement"));
}
var container = document.getElementById("root");
if (container) {
  renderComponent(CounterComponent, container);
} else {
  console.error("Root container not found!");
}
