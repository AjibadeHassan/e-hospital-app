import type { Metadata } from 'next';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'E-Hospital - Healthcare Management System',
  description: 'A comprehensive healthcare management system for managing appointments, medical records, prescriptions, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
