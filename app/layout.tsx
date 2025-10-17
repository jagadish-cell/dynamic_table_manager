import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dynamic Data Table Manager',
  description: 'A dynamic data table manager built with Next.js, Redux, and Material UI',
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