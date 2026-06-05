export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          Luxury Admin Dashboard
        </h1>

        <p className="text-gray-400 text-lg mb-8">
          Premium Store Management Panel
        </p>

        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">1,250</h2>
            <p>Total Orders</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">850</h2>
            <p>Customers</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">$52K</h2>
            <p>Revenue</p>
          </div>
        </div>
      </div>
    </main>
  );
}