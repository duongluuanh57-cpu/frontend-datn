/**
 * Foundational Email Template for Perfume Marketing
 * Uses standard HTML patterns for max compatibility.
 */

export function WelcomeEmailTemplate({ name }: { name: string }) {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #1a1a1a;">Chào mừng ${name} đến với Elite Perfume</h1>
      <p>Cảm ơn bạn đã quan tâm đến những mùi hương tinh tế nhất của chúng tôi.</p>
      <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <p><strong>Món quà dành cho bạn:</strong> Nhập mã <strong>ELITE10</strong> để được giảm 10% cho đơn hàng đầu tiên.</p>
      </div>
      <p>Hãy khám phá bộ sưu tập mới nhất của chúng tôi ngay hôm nay!</p>
      <a href="https://your-domain.com" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Mua sắm ngay</a>
    </div>
  `;
}
