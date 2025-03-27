import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

export const metadata = {
  title: 'CanvasFlow',
  description: 'Upload, Edit, Download Photos and Videos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}