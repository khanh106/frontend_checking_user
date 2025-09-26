import { Metadata } from 'next';
import {
  BookOpen,
  History,
  LifeBuoy,
  MapPin,
  Search,
  User,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Trung tâm hỗ trợ',
  description: 'Tìm kiếm sự trợ giúp và câu hỏi thường gặp.',
};

const faqItems = [
  {
    question: 'Tôi không thể đăng nhập được?',
    answer:
      'Hãy đảm bảo bạn đã nhập đúng email và mật khẩu. Kiểm tra xem phím Caps Lock có đang bật hay không. Nếu vẫn không được, hãy thử sử dụng chức năng "Quên mật khẩu".',
  },
  {
    question: 'Làm thế nào để xem lịch sử chấm công?',
    answer:
      'Từ thanh điều hướng bên trái, chọn mục "Lịch sử". Tại đây bạn có thể xem toàn bộ lịch sử chấm công của mình và sử dụng các bộ lọc để tìm kiếm.',
  },
  {
    question: 'Làm sao để thêm một vị trí chấm công mới?',
    answer:
      'Chức năng thêm vị trí mới chỉ dành cho quản trị viên. Nếu bạn là quản trị viên, hãy vào mục "Địa điểm" và chọn nút "Thêm địa điểm".',
  },
  {
    question: 'Dữ liệu của tôi không được cập nhật?',
    answer:
      'Vui lòng thử làm mới trang. Nếu dữ liệu vẫn chưa cập nhật, có thể do lỗi kết nối mạng hoặc hệ thống đang trong quá trình bảo trì. Vui lòng liên hệ hỗ trợ nếu sự cố kéo dài.',
  },
];

const helpTopics = [
    {
      icon: <BookOpen size={24} className="text-blue-500" />,
      title: 'Bắt đầu sử dụng',
      description: 'Hướng dẫn cơ bản cho người mới.',
      href: '#',
    },
    {
      icon: <MapPin size={24} className="text-green-500" />,
      title: 'Quản lý địa điểm',
      description: 'Thêm, sửa, xóa các địa điểm chấm công.',
      href: '#',
    },
    {
      icon: <History size={24} className="text-purple-500" />,
      title: 'Lịch sử chấm công',
      description: 'Xem và xuất dữ liệu chấm công.',
      href: '#',
    },
    {
      icon: <User size={24} className="text-red-500" />,
      title: 'Tài khoản & Bảo mật',
      description: 'Thay đổi mật khẩu, thông tin cá nhân.',
      href: '#',
    },
  ];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight">
          Chúng tôi có thể giúp gì cho bạn?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tìm kiếm câu trả lời, hướng dẫn và thông tin chi tiết.
        </p>
        <div className="mt-8 max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm trong tài liệu..."
            className="w-full pl-12 h-12 text-base"
          />
        </div>
      </section>

      <section className="py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Các chủ đề phổ biến
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpTopics.map((topic) => (
            <Card
              key={topic.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {topic.icon}
                <CardTitle>{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{topic.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Câu hỏi thường gặp (FAQ)
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      
      <section className="py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center gap-4">
            <LifeBuoy size={28} />
            <div>
              <CardTitle className="text-2xl">Không tìm thấy câu trả lời?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              Nếu bạn không tìm thấy thông tin mình cần, đừng ngần ngại liên hệ
              với chúng tôi qua email: <strong>support@company.com</strong> hoặc
              hotline: <strong>1900-xxxx</strong>.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
