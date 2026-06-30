'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Globe, Send, Mail } from 'lucide-react';
import './footer.css';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: <Camera size={18} />,
  facebook: <Globe size={18} />,
  twitter: <Send size={18} />,
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  const brand = {
    title: "L'essence",
    description: 'Hành trình đánh thức giác quan thông qua những nốt hương haute couture. Mỗi sản phẩm là một tác phẩm nghệ thuật, mang tâm hồn và sự lãng mạn của nước Pháp.',
  };

  const columns = [
    {
      id: 'col-0',
      title: 'Khám Phá',
      links: [
        { label: 'Bộ Sưu Tập', href: '/shop' },
        { label: 'Sản Phẩm Mới', href: '/new-arrivals' },
        { label: 'Câu Chuyện Thương Hiệu', href: '/about' },
        { label: 'Liên Hệ', href: '/contact' },
        { label: 'Cửa Hàng', href: '/stores' },
      ],
    },
    {
      id: 'col-1',
      title: 'Về chúng tôi',
      links: [
        { label: 'Giới thiệu', href: '/about' },
        { label: 'Câu chuyện thương hiệu', href: '/about#story' },
        { label: 'Tuyển dụng', href: '/careers' },
        { label: 'Liên hệ', href: '/contact' },
      ],
    },
  ];

  const socialLinks = [
    { platform: 'instagram', url: '#' },
    { platform: 'facebook', url: '#' },
    { platform: 'twitter', url: '#' },
  ];

  const newsletter = {
    title: 'Kết Nối',
    description: 'Đăng ký nhận những đặc quyền riêng biệt và thông tin mới nhất từ L\'essence.',
    email: 'concierge@lessence.com',
  };

  const copyrightText = "L'essence. Trang web là sản phẩm của trường Cao đẳng FPT Polytechnic không có mục đích thương mại.";

  return (
    <footer className="footer-luxury">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-col footer-brand">
          <h2>{brand.title}</h2>
          <p>{brand.description}</p>
          <div className="social-links">
            {socialLinks.map((sl, i) => (
              <a key={i} href={sl.url} aria-label={sl.platform}>
                {SOCIAL_ICONS[sl.platform] || <Globe size={18} />}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-col footer-newsletter">
          <h4>{newsletter.title}</h4>
          <p>{newsletter.description}</p>
          <div className="contact-info flex items-center gap-3 text-sm opacity-60">
            <Mail size={16} />
            <span>{newsletter.email}</span>
          </div>
        </div>

        {/* Link Columns */}
        {columns.map((col) => (
          <div key={col.id} className="footer-col footer-links">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link, i) => (
                <li key={i}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright Bottom */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} {copyrightText}</p>
        <div className="footer-legal">
          <Link href="/privacy">Bảo mật</Link>
          <Link href="/terms">Điều khoản</Link>
          <Link href="/shipping">Vận chuyển</Link>
        </div>
      </div>
    </footer>
  );
}
