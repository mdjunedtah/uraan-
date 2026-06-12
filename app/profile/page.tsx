'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import {
  User, Package, Heart, MapPin, CreditCard, Settings,
  LogOut, ChevronRight, Edit2, Phone, Mail, ShoppingBag,
} from 'lucide-react';
import { orders as allOrders, getStatusColor } from '@/lib/orders';
import { getCurrentUser, logoutUser, type AuthUser } from '@/lib/auth';

type Tab = 'overview' | 'orders' | 'addresses' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [account, setAccount] = useState<AuthUser | null>(null);

  // New customers must sign in before seeing the profile.
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace('/login');
    } else {
      setAccount(u);
    }
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  if (!account) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="py-32 text-center text-sm text-[#9a8c75] tracking-[2px] uppercase">
          Checking your account…
        </div>
      </main>
    );
  }

  const user = {
    name: account.name,
    email: account.email,
    phone: account.phone,
    memberSince: account.joinedOn,
    totalOrders: 0,
    totalSpent: 0,
  };

  // New accounts start with no order history.
  const userOrders: typeof allOrders = [];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />

      <div className="max-w-7xl mx-auto px-4 py-3 text-[11px] text-[#9a8c75]">
        <Link href="/" className="text-[#b8893a] font-medium">Home</Link>
        <span className="mx-2 opacity-50">›</span>
        <span>My Profile</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-4">
        <h1 className="serif text-4xl text-[#1a1410] mb-1">My Account</h1>
        <p className="text-sm text-[#6b5d4c]">Welcome back, {user.name}!</p>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#f8f2e6] border border-[rgba(184,137,58,0.18)] p-5 text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#b8893a]/20 grid place-items-center text-[#b8893a] mx-auto mb-3">
              <User size={36} />
            </div>
            <div className="serif text-lg text-[#1a1410] font-semibold">{user.name}</div>
            <div className="text-[10px] text-[#9a8c75] tracking-[1px] uppercase">Member since {user.memberSince}</div>
          </div>

          <nav className="bg-white border border-[rgba(184,137,58,0.18)]">
            {[
              { id: 'overview' as Tab, label: 'Overview', icon: User },
              { id: 'orders' as Tab, label: 'My Orders', icon: Package },
              { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
              { id: 'settings' as Tab, label: 'Settings', icon: Settings },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm border-l-2 ${
                  activeTab === t.id
                    ? 'border-l-[#b8893a] bg-[#fbf8f1] text-[#b8893a] font-semibold'
                    : 'border-l-transparent text-[#1a1410] hover:bg-[#fbf8f1]'
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
            <Link
              href="/wishlist"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm border-l-2 border-l-transparent text-[#1a1410] hover:bg-[#fbf8f1]"
            >
              <Heart size={14} /> Wishlist
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#7a2e2e] hover:bg-[#7a2e2e]/5 border-l-2 border-l-transparent">
              <LogOut size={14} /> Logout
            </button>
          </nav>
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[rgba(184,137,58,0.18)] rounded-xl p-5">
                  <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Total Orders</div>
                  <div className="serif lining-nums text-3xl font-bold text-[#1a1410]">{user.totalOrders}</div>
                </div>
                <div className="bg-white border border-[rgba(184,137,58,0.18)] rounded-xl p-5">
                  <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Total Spent</div>
                  <div className="serif lining-nums text-3xl font-bold text-[#b8893a]">
                    ₹{user.totalSpent.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-white border border-[rgba(184,137,58,0.18)] rounded-xl p-5">
                  <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Loyalty Tier</div>
                  <div className="serif text-3xl font-bold text-[#3d6b5a]">SILVER</div>
                </div>
              </div>

              <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410]">
                    Personal Info
                  </h3>
                  <button className="text-[10px] tracking-[1.5px] uppercase text-[#b8893a] font-semibold hover:underline flex items-center gap-1">
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Name</div>
                    <div className="text-[#1a1410]">{user.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Email</div>
                    <div className="text-[#1a1410] flex items-center gap-1"><Mail size={12} /> {user.email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Phone</div>
                    <div className="text-[#1a1410] flex items-center gap-1"><Phone size={12} /> {user.phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Member Since</div>
                    <div className="text-[#1a1410] lining-nums">{user.memberSince}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410]">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[10px] tracking-[1.5px] uppercase text-[#b8893a] font-semibold hover:underline">View All</button>
                </div>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag size={32} className="mx-auto mb-3 text-[#b8893a]/50" />
                    <p className="text-sm text-[#6b5d4c] mb-4">You haven&apos;t placed any orders yet.</p>
                    <Link href="/collections" className="inline-block px-6 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userOrders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-[#fbf8f1] text-sm">
                        <div>
                          <div className="font-semibold text-[#1a1410]">{o.id}</div>
                          <div className="text-[10px] text-[#9a8c75]">{o.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#1a1410] lining-nums">₹{o.amount.toLocaleString('en-IN')}</div>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold ${getStatusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
              <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-4">All Orders</h3>
              {userOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={32} className="mx-auto mb-3 text-[#b8893a]/50" />
                  <p className="text-sm text-[#6b5d4c] mb-4">No orders yet. Your orders will appear here.</p>
                  <Link href="/collections" className="inline-block px-6 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]">
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {userOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-[#fbf8f1] text-sm">
                      <div>
                        <div className="font-semibold text-[#1a1410]">{o.id}</div>
                        <div className="text-[10px] text-[#9a8c75]">{o.date} · {o.payment}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#1a1410] lining-nums">₹{o.amount.toLocaleString('en-IN')}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410]">My Addresses</h3>
                <button className="text-[10px] tracking-[1.5px] uppercase text-[#b8893a] font-semibold hover:underline">+ Add New</button>
              </div>
              <div className="text-center py-10">
                <MapPin size={32} className="mx-auto mb-3 text-[#b8893a]/50" />
                <p className="text-sm text-[#6b5d4c]">No saved addresses yet. Add one during checkout.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5 space-y-5">
              <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410]">Settings</h3>
              <div className="space-y-3">
                {[
                  'Email notifications', 'SMS alerts', 'WhatsApp updates', 'Marketing offers',
                ].map((s, i) => (
                  <label key={i} className="flex items-center justify-between p-3 bg-[#fbf8f1] cursor-pointer">
                    <span className="text-sm text-[#1a1410]">{s}</span>
                    <input type="checkbox" defaultChecked className="accent-[#b8893a]" />
                  </label>
                ))}
              </div>
              <button className="px-6 py-2 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}