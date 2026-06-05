'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Grid3x3, Image as ImageIcon, Star, Ticket, Settings, UserCog, LogOut, Gem,
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/categories', label: 'Categories', icon: Grid3x3 },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/users', label: 'Admin Users', icon: UserCog },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1a1410] text-[#e8d49b] min-h-screen flex flex-col flex-shrink-0">
      <div className="px-6 py-6 border-b border-[#b8893a]/20">
        <Link href="/admin" className="flex items-center gap-2">
          <Gem className="text-[#b8893a]" size={20} />
          <div>
            <div className="display text-sm tracking-[2px] font-semibold text-white">
              OM GAURI
            </div>
            <div className="text-[8px] tracking-[2px] text-[#b8893a] uppercase mt-0.5">
              Admin Panel
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-all border-l-2 ${
                isActive
                  ? 'bg-[#b8893a]/10 text-[#b8893a] border-l-[#b8893a]'
                  : 'text-[#e8d49b]/70 border-l-transparent hover:text-[#b8893a] hover:bg-[#b8893a]/5'
              }`}
            >
              <item.icon size={16} />
              <span className="tracking-[0.5px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#b8893a]/20 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-xs text-[#e8d49b]/70 hover:text-[#b8893a]"
        >
          <LogOut size={14} />
          <span>Back to Store</span>
        </Link>
      </div>
    </aside>
  );
}