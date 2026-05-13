import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = (import.meta as { env?: { VITE_APP_NAME?: string } }).env?.VITE_APP_NAME ?? 'Laravel';


createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
    // name example: "Review/Summary"
    return pages[`./pages/${name}.tsx` as keyof typeof pages] as any;
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(<App {...props} />);
  },
  title: (title) => (title ? `${title} - ${appName}` : appName),
});