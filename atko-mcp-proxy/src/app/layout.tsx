import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atko MCP Proxy',
  description: 'MCP request routing service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 