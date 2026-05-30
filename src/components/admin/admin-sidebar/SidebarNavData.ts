'use client';

import { LayoutDashboard, Package, Users, ShoppingBag, Settings, Sparkles, BarChart3, Activity, Image as ImageIcon, Newspaper, FileText, Ticket, Boxes, Award, Tag as TagIcon, Layers, LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  isPlaceholder?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function getNavSections(pathname: string): NavSection[] {
  const isVi = pathname.includes('/vi');

  return [
    {
      title: isVi ? 'Tổng Quan' : 'Overview',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: isVi ? 'Báo cáo & Thống kê' : 'Reports & Analytics', icon: BarChart3, href: '#', isPlaceholder: true },
        { name: isVi ? 'Nhật ký hoạt động' : 'Activity Log', icon: Activity, href: '#', isPlaceholder: true },
      ]
    },
    {
      title: isVi ? 'Quản lý Nội dung' : 'Content Management',
      items: [
        { name: isVi ? 'Cấu hình Trang chủ' : 'Homepage Config', icon: Sparkles, href: '/admin/homepage?minimal=true' },
        { name: isVi ? 'Banner & Quảng cáo' : 'Banners & Ads', icon: ImageIcon, href: '/admin/homepage?tab=banners&minimal=true' },
        { name: isVi ? 'Bài viết & Tin tức' : 'Articles & News', icon: Newspaper, href: '#', isPlaceholder: true },
        { name: isVi ? 'Các trang chính sách' : 'Policy Pages', icon: FileText, href: '#', isPlaceholder: true },
      ]
    },
    {
      title: isVi ? 'Quản lý Cửa hàng' : 'Store Management',
      items: [
        { name: isVi ? 'Sản phẩm' : 'Products', icon: Package, href: '/admin/products?minimal=true' },
        { name: isVi ? 'Thương hiệu' : 'Brands', icon: Award, href: '/admin/brands?minimal=true' },
        { name: isVi ? 'Danh mục sản phẩm' : 'Product Categories', icon: Layers, href: '/admin/categories?minimal=true' },
        { name: isVi ? 'Quản lý chung' : 'Centralized Management', icon: TagIcon, href: '/admin/taxonomy?minimal=true' },
        { name: isVi ? 'Đơn hàng' : 'Orders', icon: ShoppingBag, href: '/admin/orders?minimal=true' },
        { name: isVi ? 'Mã giảm giá' : 'Discount Codes', icon: Ticket, href: '/admin/vouchers?minimal=true' },
        { name: isVi ? 'Quản lý Kho hàng' : 'Inventory Management', icon: Boxes, href: '#', isPlaceholder: true },
      ]
    },
    {
      title: isVi ? 'Hệ thống' : 'System',
      items: [
        { name: isVi ? 'Người dùng' : 'Users', icon: Users, href: '/admin/users?minimal=true' },
        { name: isVi ? 'Cài đặt' : 'Settings', icon: Settings, href: '/admin/settings?minimal=true' },
      ]
    }
  ];
}