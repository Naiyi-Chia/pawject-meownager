import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isDevPreview = mode === 'dev-preview';
  return {
    base: isDevPreview ? '/pawject-meownager/dev/' : '/pawject-meownager/',
    plugins: [
      {
        name: 'preview-identification',
        transformIndexHtml(html) {
          if (!isDevPreview) return html;
          return {
            html: html.replace(
              '<title>Pawject Meownager</title>',
              '<title>[DEV] Pawject Meownager</title>',
            ),
            tags: [
              {
                tag: 'meta',
                attrs: { name: 'robots', content: 'noindex, nofollow' },
                injectTo: 'head',
              },
            ],
          };
        },
      },
    ],
  };
});
