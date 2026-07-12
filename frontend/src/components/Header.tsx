'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          E-Hospital
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-primary">
            Login
          </Link>
          <Link href="/register" className="text-gray-600 hover:text-primary">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
