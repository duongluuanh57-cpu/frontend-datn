export interface FAQItem {
  id: string;
  question: { vi: string; en: string };
  answer: { vi: string; en: string };
  category: { vi: string; en: string };
}

export const FAQ_DATA: FAQItem[] = [
  // ---- Tài khoản & Đăng nhập (1-7) ----
  {
    id: 'faq-1',
    question: {
      vi: 'Làm thế nào để tạo tài khoản mới?',
      en: 'How do I create a new account?'
    },
    answer: {
      vi: 'Bạn có thể tạo tài khoản mới bằng cách nhấn vào biểu tượng người dùng ở góc trên bên phải màn hình, chọn "Đăng ký" và điền đầy đủ thông tin bao gồm họ tên, email, số điện thoại và mật khẩu. Sau khi đăng ký, bạn sẽ nhận được email xác nhận từ chúng tôi.',
      en: 'You can create a new account by clicking the user icon in the top right corner, selecting "Register", and filling in your full name, email, phone number, and password. After registering, you will receive a confirmation email from us.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },
  {
    id: 'faq-2',
    question: {
      vi: 'Tôi quên mật khẩu, phải làm sao?',
      en: 'I forgot my password, what should I do?'
    },
    answer: {
      vi: 'Trên trang đăng nhập, nhấn vào "Quên mật khẩu". Nhập email đã đăng ký, hệ thống sẽ gửi đường dẫn đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra cả hộp thư spam nếu không thấy email trong hộp thư đến.',
      en: 'On the login page, click "Forgot Password". Enter your registered email, and the system will send a password reset link to your email. Please also check your spam folder if you do not see the email in your inbox.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },
  {
    id: 'faq-3',
    question: {
      vi: 'Làm sao để cập nhật thông tin cá nhân?',
      en: 'How do I update my personal information?'
    },
    answer: {
      vi: 'Đăng nhập vào tài khoản, vào mục "Hồ sơ" hoặc "Thông tin tài khoản". Tại đây bạn có thể thay đổi họ tên, số điện thoại, địa chỉ giao hàng mặc định và ảnh đại diện. Nhấn "Lưu thay đổi" để cập nhật.',
      en: 'Log in to your account, go to "Profile" or "Account Information". Here you can change your name, phone number, default shipping address, and avatar. Click "Save Changes" to update.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },
  {
    id: 'faq-4',
    question: {
      vi: 'Tôi có thể đặt hàng mà không cần tạo tài khoản không?',
      en: 'Can I place an order without creating an account?'
    },
    answer: {
      vi: 'Hiện tại chúng tôi khuyến khích bạn tạo tài khoản để theo dõi đơn hàng và lịch sử mua sắm dễ dàng hơn. Tuy nhiên, bạn vẫn có thể thanh toán với tư cách khách vãng lai bằng cách điền thông tin giao hàng trực tiếp tại trang thanh toán.',
      en: 'We currently encourage you to create an account for easier order tracking and purchase history. However, you can still checkout as a guest by filling in shipping information directly at the checkout page.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },
  {
    id: 'faq-5',
    question: {
      vi: 'Làm sao để xóa tài khoản của tôi?',
      en: 'How do I delete my account?'
    },
    answer: {
      vi: 'Để xóa tài khoản, vui lòng liên hệ bộ phận hỗ trợ khách hàng qua email hoặc chat trực tuyến. Chúng tôi sẽ xác minh danh tính của bạn và tiến hành xóa tài khoản trong vòng 7 ngày làm việc.',
      en: 'To delete your account, please contact our customer support team via email or live chat. We will verify your identity and process the account deletion within 7 business days.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },
  {
    id: 'faq-6',
    question: {
      vi: 'Tôi không nhận được email xác nhận đăng ký?',
      en: 'I did not receive the registration confirmation email?'
    },
    answer: {
      vi: 'Vui lòng kiểm tra hộp thư spam hoặc thư rác. Nếu vẫn không thấy, bạn có thể yêu cầu gửi lại email xác nhận từ trang đăng nhập. Nếu vẫn gặp vấn đề, hãy liên hệ hỗ trợ để chúng tôi kích hoạt tài khoản thủ công.',
      en: 'Please check your spam or junk folder. If you still cannot find it, you can request a new confirmation email from the login page. If the issue persists, contact support for manual account activation.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },
  {
    id: 'faq-7',
    question: {
      vi: 'Tôi có thể đăng nhập bằng Google hoặc Facebook không?',
      en: 'Can I log in with Google or Facebook?'
    },
    answer: {
      vi: 'Hiện tại chúng tôi hỗ trợ đăng nhập bằng Google. Tính năng đăng nhập bằng Facebook sẽ sớm được ra mắt. Bạn có thể chọn "Đăng nhập với Google" trên trang đăng nhập để liên kết tài khoản Google của mình.',
      en: 'We currently support login with Google. Facebook login will be available soon. You can select "Sign in with Google" on the login page to link your Google account.'
    },
    category: { vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' }
  },

  // ---- Đặt hàng & Thanh toán (8-15) ----
  {
    id: 'faq-8',
    question: {
      vi: 'Các phương thức thanh toán nào được chấp nhận?',
      en: 'What payment methods are accepted?'
    },
    answer: {
      vi: 'Chúng tôi chấp nhận thanh toán bằng thẻ tín dụng/ghi nợ (Visa, Mastercard), chuyển khoản ngân hàng, thanh toán khi nhận hàng (COD) và các ví điện tử như MoMo, ZaloPay. Đối với đơn hàng quốc tế, chúng tôi chấp nhận PayPal.',
      en: 'We accept credit/debit cards (Visa, Mastercard), bank transfer, cash on delivery (COD), and e-wallets such as MoMo and ZaloPay. For international orders, we accept PayPal.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-9',
    question: {
      vi: 'Làm sao để theo dõi đơn hàng của tôi?',
      en: 'How do I track my order?'
    },
    answer: {
      vi: 'Sau khi đơn hàng được xác nhận, bạn sẽ nhận được email chứa mã theo dõi. Bạn cũng có thể đăng nhập vào tài khoản, vào mục "Đơn hàng của tôi" để xem trạng thái cập nhật mới nhất của đơn hàng.',
      en: 'After your order is confirmed, you will receive an email with a tracking number. You can also log in to your account and go to "My Orders" to view the latest status updates for your order.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-10',
    question: {
      vi: 'Tôi có thể hủy đơn hàng không?',
      en: 'Can I cancel my order?'
    },
    answer: {
      vi: 'Bạn có thể hủy đơn hàng trong vòng 2 giờ kể từ khi đặt hàng, miễn là đơn hàng chưa được xử lý. Vào mục "Đơn hàng của tôi", chọn đơn hàng cần hủy và nhấn "Hủy đơn hàng". Sau thời gian này, vui lòng liên hệ hỗ trợ khách hàng để được hỗ trợ.',
      en: 'You can cancel your order within 2 hours of placing it, as long as the order has not been processed. Go to "My Orders", select the order you want to cancel, and click "Cancel Order". After this period, please contact customer support for assistance.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-11',
    question: {
      vi: 'Thời gian xử lý đơn hàng mất bao lâu?',
      en: 'How long does order processing take?'
    },
    answer: {
      vi: 'Đơn hàng thường được xử lý trong vòng 1-2 ngày làm việc (không tính thứ Bảy, Chủ nhật và ngày lễ). Đối với đơn hàng đặt trước (pre-order), thời gian xử lý sẽ được thông báo cụ thể trên trang sản phẩm.',
      en: 'Orders are typically processed within 1-2 business days (excluding Saturdays, Sundays, and holidays). For pre-order items, the processing time will be specified on the product page.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-12',
    question: {
      vi: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt hàng không?',
      en: 'Can I change my shipping address after placing an order?'
    },
    answer: {
      vi: 'Có, bạn có thể thay đổi địa chỉ giao hàng nếu đơn hàng chưa được vận chuyển. Vui lòng liên hệ bộ phận hỗ trợ khách hàng ngay lập tức qua chat trực tuyến hoặc email để được hỗ trợ thay đổi.',
      en: 'Yes, you can change your shipping address if the order has not been shipped yet. Please contact our customer support team immediately via live chat or email for assistance.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-13',
    question: {
      vi: 'Làm sao để tôi in hóa đơn cho đơn hàng?',
      en: 'How do I print an invoice for my order?'
    },
    answer: {
      vi: 'Đăng nhập vào tài khoản, vào mục "Đơn hàng của tôi", chọn đơn hàng bạn muốn in hóa đơn. Nhấn vào "Xem chi tiết", sau đó chọn "In hóa đơn". Hóa đơn sẽ được tải xuống dưới dạng PDF để bạn in ra.',
      en: 'Log in to your account, go to "My Orders", select the order you want to print an invoice for. Click "View Details", then select "Print Invoice". The invoice will be downloaded as a PDF for you to print.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-14',
    question: {
      vi: 'Thanh toán online có an toàn không?',
      en: 'Is online payment secure?'
    },
    answer: {
      vi: 'Chúng tôi sử dụng công nghệ mã hóa SSL 256-bit và tuân thủ tiêu chuẩn bảo mật PCI DSS để đảm bảo mọi giao dịch thanh toán đều được bảo vệ an toàn. Thông tin thẻ tín dụng của bạn không được lưu trữ trên hệ thống của chúng tôi.',
      en: 'We use 256-bit SSL encryption technology and comply with PCI DSS security standards to ensure all payment transactions are securely protected. Your credit card information is not stored on our systems.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },
  {
    id: 'faq-15',
    question: {
      vi: 'Tôi có thể thanh toán bằng ngoại tệ không?',
      en: 'Can I pay in foreign currency?'
    },
    answer: {
      vi: 'Hiện tại chúng tôi chỉ hỗ trợ thanh toán bằng Việt Nam Đồng (VND) cho khách hàng trong nước. Đối với khách hàng quốc tế, thanh toán qua PayPal sẽ tự động quy đổi sang ngoại tệ tương ứng.',
      en: 'We currently only support payment in Vietnamese Dong (VND) for domestic customers. For international customers, PayPal payments will be automatically converted to the corresponding foreign currency.'
    },
    category: { vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' }
  },

  // ---- Vận chuyển & Giao nhận (16-22) ----
  {
    id: 'faq-16',
    question: {
      vi: 'Phí vận chuyển được tính như thế nào?',
      en: 'How are shipping fees calculated?'
    },
    answer: {
      vi: 'Phí vận chuyển được tính dựa trên tổng giá trị đơn hàng, địa chỉ giao hàng và phương thức vận chuyển. Đơn hàng trên 500.000 VND được miễn phí vận chuyển trong nội thành. Bạn có thể xem chi tiết phí vận chuyển tại trang thanh toán trước khi đặt hàng.',
      en: 'Shipping fees are calculated based on the total order value, delivery address, and shipping method. Orders over 500,000 VND qualify for free shipping within the city. You can view detailed shipping fees at the checkout page before placing your order.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },
  {
    id: 'faq-17',
    question: {
      vi: 'Thời gian giao hàng dự kiến là bao lâu?',
      en: 'What is the estimated delivery time?'
    },
    answer: {
      vi: 'Giao hàng nội thành mất 1-2 ngày làm việc, ngoại thành 2-4 ngày làm việc, và các tỉnh xa 4-7 ngày làm việc. Đối với đơn hàng quốc tế, thời gian giao hàng có thể từ 7-14 ngày làm việc tùy thuộc vào quốc gia.',
      en: 'Local delivery takes 1-2 business days, suburban areas 2-4 business days, and remote provinces 4-7 business days. For international orders, delivery time may range from 7-14 business days depending on the destination country.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },
  {
    id: 'faq-18',
    question: {
      vi: 'Làm sao để thay đổi địa chỉ giao hàng?',
      en: 'How do I change my delivery address?'
    },
    answer: {
      vi: 'Bạn có thể cập nhật địa chỉ giao hàng mặc định trong mục "Hồ sơ" hoặc thay đổi địa chỉ tại trang thanh toán trước khi đặt hàng. Nếu đơn hàng đã được xác nhận, vui lòng liên hệ hỗ trợ khách hàng để thay đổi.',
      en: 'You can update your default shipping address in the "Profile" section or change the address at the checkout page before placing an order. If the order has been confirmed, please contact customer support for changes.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },
  {
    id: 'faq-19',
    question: {
      vi: 'Tôi có thể chọn đơn vị vận chuyển không?',
      en: 'Can I choose the shipping carrier?'
    },
    answer: {
      vi: 'Hiện tại chúng tôi hợp tác với các đơn vị vận chuyển uy tín như Giao Hàng Nhanh, Giao Hàng Tiết Kiệm, Viettel Post và DHL (cho quốc tế). Bạn có thể chọn đơn vị vận chuyển mong muốn tại trang thanh toán nếu có nhiều lựa chọn.',
      en: 'We currently partner with reputable carriers such as Giao Hang Nhanh, Giao Hang Tiet Kiem, Viettel Post, and DHL (for international). You can select your preferred carrier at the checkout page if multiple options are available.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },
  {
    id: 'faq-20',
    question: {
      vi: 'Nếu tôi không có nhà khi nhận hàng thì sao?',
      en: 'What if I am not home when delivery arrives?'
    },
    answer: {
      vi: 'Nhân viên giao hàng sẽ cố gắng gọi điện cho bạn trước khi giao. Nếu không liên lạc được, đơn hàng sẽ được chuyển về điểm giao dịch gần nhất và lưu kho trong 7 ngày. Bạn có thể sắp xếp thời gian nhận lại hoặc yêu cầu giao lại.',
      en: 'The delivery staff will try to call you before delivery. If unreachable, the order will be returned to the nearest pickup point and held for 7 days. You can arrange a new delivery time or pick it up yourself.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },
  {
    id: 'faq-21',
    question: {
      vi: 'Có giao hàng vào cuối tuần không?',
      en: 'Do you deliver on weekends?'
    },
    answer: {
      vi: 'Có, chúng tôi có giao hàng vào thứ Bảy. Tuy nhiên, giao hàng Chủ nhật và ngày lễ có thể bị hạn chế tùy theo khu vực và đơn vị vận chuyển. Bạn có thể chọn ngày giao hàng mong muốn tại trang thanh toán.',
      en: 'Yes, we deliver on Saturdays. However, Sunday and holiday deliveries may be limited depending on the area and carrier. You can select your preferred delivery date at the checkout page.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },
  {
    id: 'faq-22',
    question: {
      vi: 'Tôi có thể theo dõi đơn hàng quốc tế không?',
      en: 'Can I track international orders?'
    },
    answer: {
      vi: 'Có, tất cả đơn hàng quốc tế đều được cung cấp mã theo dõi. Bạn có thể theo dõi trên website của chúng tôi hoặc trực tiếp trên trang web của đơn vị vận chuyển (DHL, FedEx) bằng mã theo dõi được gửi qua email.',
      en: 'Yes, all international orders are provided with a tracking number. You can track on our website or directly on the carrier\'s website (DHL, FedEx) using the tracking number sent via email.'
    },
    category: { vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' }
  },

  // ---- Đổi trả & Hoàn tiền (23-29) ----
  {
    id: 'faq-23',
    question: {
      vi: 'Chính sách đổi trả như thế nào?',
      en: 'What is the return policy?'
    },
    answer: {
      vi: 'Chúng tôi chấp nhận đổi trả trong vòng 14 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem niêm phong, chưa qua sử dụng và còn đầy đủ hộp đựng, giấy tờ kèm theo. Một số sản phẩm khuyến mãi đặc biệt có thể không áp dụng đổi trả.',
      en: 'We accept returns within 14 days of receiving the product. The item must be unopened, unused, and in its original packaging with all accompanying documents. Some promotional items may not be eligible for returns.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },
  {
    id: 'faq-24',
    question: {
      vi: 'Quy trình đổi trả diễn ra như thế nào?',
      en: 'How does the return process work?'
    },
    answer: {
      vi: 'Liên hệ bộ phận hỗ trợ qua email hoặc chat, cung cấp mã đơn hàng và lý do đổi trả. Chúng tôi sẽ hướng dẫn bạn gửi hàng về kho. Sau khi nhận được hàng và kiểm tra, chúng tôi sẽ xử lý hoàn tiền hoặc gửi hàng đổi trong vòng 5-7 ngày làm việc.',
      en: 'Contact our support team via email or chat, providing your order number and reason for return. We will guide you on sending the item back. After receiving and inspecting the item, we will process the refund or send the replacement within 5-7 business days.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },
  {
    id: 'faq-25',
    question: {
      vi: 'Ai chịu phí vận chuyển khi đổi trả?',
      en: 'Who pays for return shipping?'
    },
    answer: {
      vi: 'Nếu sản phẩm bị lỗi hoặc sai hàng, chúng tôi sẽ chịu toàn bộ phí vận chuyển đổi trả. Nếu bạn đổi ý hoặc không ưng ý sản phẩm, bạn sẽ chịu phí vận chuyển gửi hàng về kho. Phí gửi hàng đổi sẽ được miễn phí cho lần đầu tiên.',
      en: 'If the product is defective or incorrect, we will cover all return shipping costs. If you change your mind or are not satisfied with the product, you will be responsible for the return shipping fee. The replacement shipping fee will be waived for the first time.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },
  {
    id: 'faq-26',
    question: {
      vi: 'Bao lâu thì tôi nhận được tiền hoàn lại?',
      en: 'How long does it take to receive my refund?'
    },
    answer: {
      vi: 'Sau khi chúng tôi nhận được hàng trả về và kiểm tra đạt yêu cầu, tiền hoàn sẽ được xử lý trong vòng 5-7 ngày làm việc. Thời gian nhận được tiền phụ thuộc vào phương thức thanh toán: 1-3 ngày với thẻ tín dụng, 3-5 ngày với chuyển khoản ngân hàng.',
      en: 'After we receive and inspect the returned item, the refund will be processed within 5-7 business days. The time to receive the money depends on the payment method: 1-3 days for credit cards, 3-5 days for bank transfers.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },
  {
    id: 'faq-27',
    question: {
      vi: 'Tôi có thể đổi sang sản phẩm khác không?',
      en: 'Can I exchange for a different product?'
    },
    answer: {
      vi: 'Có, bạn có thể đổi sang sản phẩm khác có giá trị bằng hoặc cao hơn. Nếu sản phẩm mới có giá cao hơn, bạn cần thanh toán thêm phần chênh lệch. Nếu giá thấp hơn, chúng tôi sẽ hoàn lại tiền chênh lệch cho bạn.',
      en: 'Yes, you can exchange for a different product of equal or higher value. If the new product costs more, you will need to pay the difference. If it costs less, we will refund the difference to you.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },
  {
    id: 'faq-28',
    question: {
      vi: 'Sản phẩm khuyến mãi có được đổi trả không?',
      en: 'Are promotional items eligible for returns?'
    },
    answer: {
      vi: 'Sản phẩm khuyến mãi và quà tặng kèm thường không được áp dụng đổi trả trừ khi có lỗi từ nhà sản xuất. Vui lòng kiểm tra điều khoản khuyến mãi trước khi mua. Đối với sản phẩm giảm giá trên 50%, chính sách đổi trả có thể bị giới hạn.',
      en: 'Promotional items and free gifts are generally not eligible for returns unless they have manufacturer defects. Please check the promotion terms before purchasing. For items discounted over 50%, the return policy may be limited.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },
  {
    id: 'faq-29',
    question: {
      vi: 'Sản phẩm bị lỗi do vận chuyển thì xử lý thế nào?',
      en: 'What if the product is damaged during shipping?'
    },
    answer: {
      vi: 'Nếu sản phẩm bị hư hỏng do vận chuyển, vui lòng chụp ảnh sản phẩm và bao bì ngay khi nhận hàng, sau đó liên hệ với chúng tôi trong vòng 48 giờ. Chúng tôi sẽ tiến hành đổi mới hoặc hoàn tiền toàn bộ mà bạn không mất thêm chi phí nào.',
      en: 'If the product is damaged during shipping, please take photos of the product and packaging immediately upon receipt, then contact us within 48 hours. We will arrange a full replacement or refund at no additional cost to you.'
    },
    category: { vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' }
  },

  // ---- Sản phẩm & Hương thơm (30-36) ----
  {
    id: 'faq-30',
    question: {
      vi: 'Làm thế nào để chọn nước hoa phù hợp?',
      en: 'How do I choose the right perfume?'
    },
    answer: {
      vi: 'Chúng tôi khuyên bạn nên dựa vào sở thích mùi hương cá nhân: hương hoa cỏ, hương gỗ, hương cam chanh hay hương phương Đông. Bạn có thể tham khảo bộ sưu tập của chúng tôi theo nhóm hương, hoặc sử dụng tính năng gợi ý thông minh trên website. Ghé cửa hàng để thử trực tiếp cũng là cách tuyệt vời!',
      en: 'We recommend basing your choice on personal scent preferences: floral, woody, citrus, or oriental. You can browse our collection by fragrance family, or use our smart recommendation feature on the website. Visiting our store for a test is also a great idea!'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },
  {
    id: 'faq-31',
    question: {
      vi: 'Nước hoa chính hãng có gì khác biệt?',
      en: 'What makes authentic perfumes different?'
    },
    answer: {
      vi: 'Nước hoa chính hãng được sản xuất bởi thương hiệu gốc, sử dụng nguyên liệu chất lượng cao, có độ lưu hương lâu hơn và tầng hương rõ rệt hơn so với hàng giả, hàng nhái. Mỗi sản phẩm đều có tem chống hàng giả và mã QR để bạn kiểm tra nguồn gốc.',
      en: 'Authentic perfumes are produced by the original brand using high-quality ingredients, offering longer longevity and more distinct fragrance layers compared to counterfeit products. Each product has an authenticity seal and QR code for origin verification.'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },
  {
    id: 'faq-32',
    question: {
      vi: 'Làm sao để kiểm tra hàng thật - hàng giả?',
      en: 'How do I verify authenticity?'
    },
    answer: {
      vi: 'Tất cả sản phẩm của chúng tôi đều có tem chống hàng giả và mã QR trên bao bì. Bạn có thể quét mã QR bằng điện thoại để xác thực sản phẩm trực tiếp trên hệ thống của chúng tôi. Ngoài ra, bạn cũng có thể kiểm tra mã vạch và số lot number trên website của hãng.',
      en: 'All our products come with an authenticity seal and QR code on the packaging. You can scan the QR code with your phone to verify the product directly on our system. Additionally, you can check the barcode and lot number on the brand\'s official website.'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },
  {
    id: 'faq-33',
    question: {
      vi: 'Có bán mẫu thử (sample) không?',
      en: 'Do you sell samples?'
    },
    answer: {
      vi: 'Có, chúng tôi cung cấp bộ mẫu thử (Discovery Set) với nhiều mùi hương khác nhau để bạn trải nghiệm trước khi quyết định mua chai full size. Bạn có thể chọn bộ 5 mẫu hoặc 10 mẫu với giá ưu đãi, và được hoàn tiền nếu mua chai full size sau đó.',
      en: 'Yes, we offer Discovery Sets with various scents for you to try before committing to a full-size bottle. You can choose a set of 5 or 10 samples at a special price, with the amount refundable when purchasing a full-size bottle later.'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },
  {
    id: 'faq-34',
    question: {
      vi: 'Nước hoa có hạn sử dụng không?',
      en: 'Do perfumes have an expiration date?'
    },
    answer: {
      vi: 'Nước hoa thường có hạn sử dụng 3-5 năm kể từ ngày sản xuất nếu được bảo quản đúng cách. Trên bao bì sản phẩm có in hạn sử dụng (PAO - Period After Opening) thường là 24-36 tháng sau khi mở nắp. Chúng tôi luôn đảm bảo sản phẩm đến tay bạn còn hạn sử dụng tối thiểu 2 năm.',
      en: 'Perfumes typically have a shelf life of 3-5 years from the manufacturing date if stored properly. The packaging shows the PAO (Period After Opening), usually 24-36 months after opening. We guarantee that products reach you with at least 2 years of remaining shelf life.'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },
  {
    id: 'faq-35',
    question: {
      vi: 'Cách bảo quản nước hoa đúng cách?',
      en: 'How should I store my perfume?'
    },
    answer: {
      vi: 'Bảo quản nước hoa ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nhiệt độ cao. Nhiệt độ lý tưởng là 15-20°C. Tránh để nước hoa trong phòng tắm vì độ ẩm cao. Đậy nắp kín sau khi sử dụng và giữ chai trong hộp khi không dùng đến.',
      en: 'Store perfume in a cool, dry place away from direct sunlight and high temperatures. The ideal temperature is 15-20°C. Avoid storing perfume in the bathroom due to high humidity. Close the cap tightly after use and keep the bottle in its box when not in use.'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },
  {
    id: 'faq-36',
    question: {
      vi: 'Xịt nước hoa ở đâu để lưu hương lâu nhất?',
      en: 'Where should I spray perfume for the longest lasting effect?'
    },
    answer: {
      vi: 'Xịt lên các điểm mạch trên cơ thể như cổ tay, sau tai, khuỷu tay trong, sau gối và ngực. Những khu vực này có thân nhiệt cao hơn, giúp khuếch tán hương thơm tốt hơn. Không xoa xát cổ tay sau khi xịt vì sẽ làm vỡ các phân tử hương.',
      en: 'Spray on pulse points such as wrists, behind the ears, inner elbows, behind the knees, and chest. These areas have higher body temperature, which helps diffuse the fragrance better. Do not rub your wrists together after spraying as it breaks down the fragrance molecules.'
    },
    category: { vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' }
  },

  // ---- Khuyến mãi & Voucher (37-43) ----
  {
    id: 'faq-37',
    question: {
      vi: 'Làm sao để nhận được mã giảm giá?',
      en: 'How do I get discount codes?'
    },
    answer: {
      vi: 'Bạn có thể nhận mã giảm giá bằng cách đăng ký nhận bản tin email của chúng tôi, theo dõi fanpage trên Facebook và Instagram, hoặc tham gia chương trình khách hàng thân thiết. Chúng tôi thường xuyên gửi mã giảm giá vào các dịp đặc biệt và sinh nhật của bạn.',
      en: 'You can receive discount codes by subscribing to our email newsletter, following our Facebook and Instagram pages, or joining our loyalty program. We regularly send discount codes on special occasions and your birthday.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },
  {
    id: 'faq-38',
    question: {
      vi: 'Cách áp dụng mã giảm giá khi mua hàng?',
      en: 'How do I apply a discount code at checkout?'
    },
    answer: {
      vi: 'Tại trang thanh toán, bạn sẽ thấy ô "Nhập mã giảm giá". Nhập mã của bạn vào và nhấn "Áp dụng". Hệ thống sẽ tự động tính lại tổng tiền. Mỗi đơn hàng chỉ được sử dụng một mã giảm giá, trừ khi có thông báo khác.',
      en: 'At the checkout page, you will see an "Enter discount code" field. Enter your code and click "Apply". The system will automatically recalculate the total. Each order can only use one discount code, unless otherwise stated.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },
  {
    id: 'faq-39',
    question: {
      vi: 'Mã giảm giá có thời hạn bao lâu?',
      en: 'How long are discount codes valid?'
    },
    answer: {
      vi: 'Mỗi mã giảm giá có thời hạn sử dụng khác nhau, thường được ghi rõ trong email hoặc thông báo khuyến mãi. Thời hạn phổ biến là 7-30 ngày kể từ ngày phát hành. Mã đã hết hạn sẽ không thể sử dụng hoặc gia hạn.',
      en: 'Each discount code has a different validity period, usually stated in the email or promotional notification. The common validity period is 7-30 days from issuance. Expired codes cannot be used or renewed.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },
  {
    id: 'faq-40',
    question: {
      vi: 'Tôi có thể kết hợp nhiều mã giảm giá không?',
      en: 'Can I combine multiple discount codes?'
    },
    answer: {
      vi: 'Thông thường, mỗi đơn hàng chỉ được áp dụng một mã giảm giá. Tuy nhiên, trong một số chương trình đặc biệt, bạn có thể kết hợp mã giảm giá với các ưu đãi khác như free ship hoặc quà tặng kèm. Chi tiết được ghi rõ trong điều khoản của từng chương trình.',
      en: 'Generally, each order can only use one discount code. However, in some special programs, you can combine a discount code with other offers such as free shipping or free gifts. Details are specified in each program\'s terms.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },
  {
    id: 'faq-41',
    question: {
      vi: 'Chương trình khách hàng thân thiết hoạt động thế nào?',
      en: 'How does the loyalty program work?'
    },
    answer: {
      vi: 'Chúng tôi có chương trình tích điểm thành viên với 3 hạng: Bạc, Vàng và Kim Cương. Bạn tích lũy điểm cho mỗi đơn hàng (10.000 VND = 1 điểm). Điểm có thể đổi lấy mã giảm giá, quà tặng hoặc nâng hạng với nhiều đặc quyền hơn.',
      en: 'We have a membership points program with 3 tiers: Silver, Gold, and Diamond. You earn points for each order (10,000 VND = 1 point). Points can be redeemed for discount codes, gifts, or tier upgrades with more privileges.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },
  {
    id: 'faq-42',
    question: {
      vi: 'Làm sao để kiểm tra điểm thưởng của tôi?',
      en: 'How do I check my reward points?'
    },
    answer: {
      vi: 'Đăng nhập vào tài khoản, vào mục "Điểm thưởng" hoặc "Chương trình thành viên". Tại đây bạn sẽ thấy tổng điểm hiện có, lịch sử tích điểm và các ưu đãi có thể đổi. Điểm thưởng có giá trị trong 12 tháng kể từ ngày tích lũy.',
      en: 'Log in to your account and go to "Reward Points" or "Membership Program". Here you will see your current total points, point history, and available rewards. Reward points are valid for 12 months from the date of accumulation.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },
  {
    id: 'faq-43',
    question: {
      vi: 'Có chương trình ưu đãi đặc biệt cho sinh nhật không?',
      en: 'Is there a special birthday promotion?'
    },
    answer: {
      vi: 'Có! Vào tháng sinh nhật của bạn, chúng tôi sẽ gửi mã giảm giá đặc biệt 15% cho toàn bộ đơn hàng cùng quà tặng tri ân. Hãy đảm bảo bạn đã cập nhật ngày sinh trong hồ sơ tài khoản để nhận được ưu đãi này.',
      en: 'Yes! During your birthday month, we will send you a special 15% discount code for your entire order along with a thank-you gift. Make sure you have updated your date of birth in your account profile to receive this offer.'
    },
    category: { vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' }
  },

  // ---- Kỹ thuật & Bảo mật (44-50) ----
  {
    id: 'faq-44',
    question: {
      vi: 'Website có bảo mật thông tin cá nhân không?',
      en: 'Is my personal information secure on this website?'
    },
    answer: {
      vi: 'Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt bao gồm mã hóa SSL, tường lửa và xác thực hai lớp. Thông tin cá nhân của bạn không bao giờ được chia sẻ với bên thứ ba khi chưa có sự đồng ý. Chúng tôi tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.',
      en: 'We implement strict security measures including SSL encryption, firewalls, and two-factor authentication. Your personal information is never shared with third parties without your consent. We comply with data protection regulations.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
  {
    id: 'faq-45',
    question: {
      vi: 'Làm sao để đăng xuất tài khoản trên thiết bị khác?',
      en: 'How do I log out of my account on another device?'
    },
    answer: {
      vi: 'Vào mục "Bảo mật" trong hồ sơ tài khoản, bạn sẽ thấy danh sách các thiết bị đang đăng nhập. Chọn "Đăng xuất khỏi tất cả thiết bị" hoặc đăng xuất từng thiết bị cụ thể. Bạn cũng nên đổi mật khẩu ngay lập tức nếu nghi ngờ tài khoản bị truy cập trái phép.',
      en: 'Go to "Security" in your account profile. You will see a list of devices currently logged in. Select "Log out of all devices" or log out of specific devices. You should also change your password immediately if you suspect unauthorized access.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
  {
    id: 'faq-46',
    question: {
      vi: 'Trang web không tải được, tôi phải làm sao?',
      en: 'The website is not loading, what should I do?'
    },
    answer: {
      vi: 'Thử làm mới trang (F5), xóa cache trình duyệt, hoặc thử truy cập bằng trình duyệt khác. Kiểm tra kết nối internet của bạn. Nếu vẫn không được, vui lòng liên hệ hỗ trợ kỹ thuật qua email hoặc chat, kèm theo ảnh chụp màn hình lỗi để chúng tôi hỗ trợ nhanh nhất.',
      en: 'Try refreshing the page (F5), clearing your browser cache, or using a different browser. Check your internet connection. If the issue persists, please contact technical support via email or chat, attaching a screenshot of the error for faster assistance.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
  {
    id: 'faq-47',
    question: {
      vi: 'Tôi có thể đặt hàng qua điện thoại không?',
      en: 'Can I place an order by phone?'
    },
    answer: {
      vi: 'Có, bạn có thể gọi đến hotline của chúng tôi để đặt hàng trực tiếp. Nhân viên tư vấn sẽ hỗ trợ bạn chọn sản phẩm, xác nhận đơn hàng và thông báo phương thức thanh toán. Hình thức này đặc biệt phù hợp với khách hàng không tiện sử dụng internet.',
      en: 'Yes, you can call our hotline to place an order directly. Our consultants will help you choose products, confirm the order, and advise on payment methods. This option is especially suitable for customers who are not comfortable using the internet.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
  {
    id: 'faq-48',
    question: {
      vi: 'Làm sao để liên hệ bộ phận hỗ trợ?',
      en: 'How do I contact customer support?'
    },
    answer: {
      vi: 'Bạn có thể liên hệ chúng tôi qua các kênh sau: Chat trực tuyến (widget góc dưới bên phải màn hình), Email: support@elessence.com, Hotline: 1900 123 456 (8:00 - 21:00 hàng ngày), hoặc gửi tin nhắn qua fanpage Facebook. Chúng tôi thường phản hồi trong vòng 2 giờ làm việc.',
      en: 'You can contact us through the following channels: Live chat (widget at the bottom right of the screen), Email: support@elessence.com, Hotline: 1900 123 456 (8:00 - 21:00 daily), or via Facebook fanpage messages. We typically respond within 2 business hours.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
  {
    id: 'faq-49',
    question: {
      vi: 'Tôi muốn góp ý hoặc khiếu nại, gửi ở đâu?',
      en: 'Where can I submit feedback or complaints?'
    },
    answer: {
      vi: 'Chúng tôi luôn trân trọng mọi góp ý từ khách hàng. Bạn có thể gửi phản hồi qua email khiếu nại: complaint@elessence.com, hoặc điền form "Góp ý" ở cuối trang web. Mọi khiếu nại sẽ được xử lý trong vòng 24 giờ làm việc và phản hồi lại cho bạn.',
      en: 'We always value customer feedback. You can submit your comments via our complaint email: complaint@elessence.com, or fill out the "Feedback" form at the bottom of our website. All complaints will be processed within 24 business hours with a response back to you.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
  {
    id: 'faq-50',
    question: {
      vi: 'Ứng dụng di động có hỗ trợ không?',
      en: 'Is there a mobile app available?'
    },
    answer: {
      vi: 'Hiện tại chúng tôi đang phát triển ứng dụng di động cho cả iOS và Android, dự kiến ra mắt trong quý 3 năm 2026. Bạn có thể đăng ký nhận thông báo qua email để được cập nhật khi ứng dụng chính thức phát hành. Hiện tại, website của chúng tôi đã được tối ưu hóa tốt cho trình duyệt di động.',
      en: 'We are currently developing mobile apps for both iOS and Android, expected to launch in Q3 2026. You can register for email notifications to receive updates when the app is officially released. Currently, our website is well-optimized for mobile browsers.'
    },
    category: { vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' }
  },
];
