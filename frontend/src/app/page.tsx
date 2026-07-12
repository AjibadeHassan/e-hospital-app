'use client';

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Welcome to E-Hospital</h1>
        <p className="text-lg text-gray-600 mb-8">Healthcare Management System</p>
        <div className="flex gap-4">
          <button className="btn-primary">Login</button>
          <button className="btn-outline">Register</button>
        </div>
      </div>
    </div>
  );
}
