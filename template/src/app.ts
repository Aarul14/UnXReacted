    // src/app.ts
    import { createElement, useState, renderComponent } from './index'; // Import from your library's entry point

    // --- EXAMPLE COMPONENT --- 
    // This is just an example component (CounterComponent).
    // You should replace this with your own main application component.
    // 1. Create your component file (e.g., src/MyApp.tsx).
    // 2. Import your component here:
    // import MyApp from './MyApp'; // Example import

    // Define a simple counter component (EXAMPLE)
    function CounterComponent() {
      const [count, setCount] = useState(0);

      console.log('Rendering CounterComponent, count:', count); // For debugging

      return createElement(
        'div',
        {}, // Props for the div
        createElement('h1', {}, `Count: ${count}`),
        createElement(
          'button',
          {
            // Add an event listener using the 'on' prefix
            onclick: () => {
                console.log('Increment button clicked!');
                setCount(count + 1);
            }
          },
          'Increment'
        ),
        // Add the Decrement button
        createElement(
            'button',
            {
              onclick: () => {
                console.log('Decrement button clicked!');
                setCount(count - 1);
              },
              style: { marginLeft: '5px' } // Add some spacing
            },
            'Decrement'
          )
      );
    }
    // --- END EXAMPLE COMPONENT ---

    // Get the root element from the HTML
    const container = document.getElementById('root');

    if (container) {
      // --- RENDER YOUR APP ---
      // Replace 'CounterComponent' below with your main app component.
      renderComponent(CounterComponent, container); // Render the example component

      // Example: Uncomment the line below after importing your component
      // renderComponent(MyApp, container);
      // --- END RENDER YOUR APP ---

    } else {
      console.error('Root container not found!');
    }