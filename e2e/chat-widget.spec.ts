import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Giả sử widget được render trên trang chủ
    await page.goto('/');
  });

  test('should open and close the chat window', async ({ page }) => {
    const trigger = page.locator('.chat-trigger');
    await expect(trigger).toBeVisible();

    // Click để mở
    await trigger.click();
    const chatWindow = page.locator('.chat-window-elite');
    await expect(chatWindow).toBeVisible();

    // Kiểm tra tin nhắn chào mừng
    await expect(page.getByText("L'essence Concierge")).toBeVisible();

    // Click để đóng
    await trigger.click();
    await expect(chatWindow).not.toBeVisible();
  });

  test('should allow sending a message', async ({ page }) => {
    await page.locator('.chat-trigger').click();
    
    const input = page.locator('textarea[placeholder="Bạn cần tư vấn gì..."]');
    await input.fill('Tôi muốn tìm nước hoa mùi gỗ');
    await page.keyboard.press('Enter');

    // Kiểm tra tin nhắn người dùng xuất hiện
    await expect(page.getByText('Tôi muốn tìm nước hoa mùi gỗ')).toBeVisible();
    
    // Kiểm tra trạng thái đang tải (loading dots)
    await expect(page.locator('.loading-dots')).toBeVisible();
  });

  test('should show feedback form', async ({ page }) => {
    await page.locator('.chat-trigger').click();
    
    // Mở menu
    await page.locator('button:has(svg.lucide-chevron-down)').click();
    
    // Chọn đánh giá
    await page.getByText('Đánh giá tư vấn').click();
    
    // Kiểm tra form feedback
    await expect(page.getByText('Bạn cảm thấy buổi tư vấn thế nào?')).toBeVisible();
  });
});
