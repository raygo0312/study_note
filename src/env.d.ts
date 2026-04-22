/// <reference types="astro/client" />

interface Window {
  MathJax?: {
    typesetPromise?: () => Promise<void>;
    [key: string]: unknown;
  };
}

declare module "*?url" {
  const src: string;
  export default src;
}

declare module "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs" {
  const mermaid: {
    initialize: (config: {
      startOnLoad?: boolean;
      theme?: string;
      securityLevel?: string;
    }) => void;
  };

  export default mermaid;
}

declare module "https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.es.js" {
  type PanzoomInstance = {
    zoomWithWheel: (event: WheelEvent) => void;
  };

  const Panzoom: (
    element: HTMLElement,
    options?: {
      contain?: string;
    },
  ) => PanzoomInstance;

  export default Panzoom;
}
