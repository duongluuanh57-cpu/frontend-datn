'use client';

import React from 'react';
import { Link } from '@/navigation';
import { Camera, Globe, Send, Mail, ChevronRight } from 'lucide-react';
import './footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-luxury">
      <div className="footer-container">
        {/* Column 1: Brand & Philosophy */}
        <div className="footer-col footer-brand">
          <h2>L'essence</h2>
          <p>
            Hành trình đánh thức giác quan thông qua những nốt hương haute couture.
            Mỗi sản phẩm là một tác phẩm nghệ thuật, mang tâm hồn và sự lãng mạn của nước Pháp.
          </p>
          <div className="social-links mt-8">
            <a href="#" aria-label="Instagram"><Camera size={18} /></a>
            <a href="#" aria-label="Facebook"><Globe size={18} /></a>
            <a href="#" aria-label="Twitter"><Send size={18} /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col footer-links">
          <h4>Khám Phá</h4>
          <ul>
            <li><Link href="/shop">Bộ Sưu Tập</Link></li>
            <li><Link href="/new-arrivals">Sản Phẩm Mới</Link></li>
            <li><Link href="/about">Câu Chuyện Thương Hiệu</Link></li>
            <li><Link href="/contact">Liên Hệ</Link></li>
            <li><Link href="/stores">Cửa Hàng</Link></li>
          </ul>
        </div>

        {/* Column 3: Connect & Newsletter */}
        <div className="footer-col footer-newsletter">
          <h4>Kết Nối</h4>
          <p>Đăng ký nhận những đặc quyền riêng biệt và thông tin mới nhất từ L'essence.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email của bạn..." />
            <button type="submit">
              <span className="hidden md:inline">Đăng ký</span>
              <ChevronRight size={16} className="md:ml-2" />
            </button>
          </form>
          <div className="contact-info flex items-center gap-3 text-sm opacity-60">
            <Mail size={16} />
            <span>concierge@lessence.com</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} L'essence. Trang web là sản phẩm của trường Cao đẳng FPT Polytechnic không có mục đích thương mại.</p>
        <div className="footer-legal">
          <Link href="/privacy">Bảo mật</Link>
          <Link href="/terms">Điều khoản</Link>
          <Link href="/shipping">Vận chuyển</Link>
        </div>
      </div>
    </footer>
  );
}
