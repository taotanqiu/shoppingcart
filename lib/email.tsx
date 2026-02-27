// lib/email.tsx
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// 初始化 Resend（确保 RESEND_API_KEY 在环境变量中）
const resend = new Resend(process.env.RESEND_API_KEY);

// 定义订单类型（可根据你的 Prisma 模型扩展）
type Order = {
  id: string;
  total: number;
  createdAt: Date;
  items: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
};

// PDF 样式
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  text: { fontSize: 12, marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between' },
});

// PDF 收据组件
const OrderReceiptPdf = ({ order }: { order: Order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Order Receipt #{order.id}</Text>
      <Text style={styles.text}>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.text}>Total: ${order.total.toFixed(2)}</Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 14, marginBottom: 10 }}>Item Details:</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text>{item.product.name} x {item.quantity}</Text>
            <Text>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

/**
 * 发送订单收据邮件
 * @param order 订单对象（必须包含 items 和 product 关联）
 * @param recipientEmail 收件人邮箱
 */
export async function sendOrderReceipt(order: Order | null, recipientEmail: string) {
  // 1. 校验环境变量
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  if (!process.env.RESEND_EMAIL) {
    throw new Error('RESEND_EMAIL (sender address) is not set in environment variables');
  }

  // 2. 校验订单数据
  if (!order) {
    throw new Error('Order data is missing, cannot generate PDF');
  }

  try {
    // 3. 生成 PDF 文件 Buffer
    const pdfBuffer = await renderToBuffer(<OrderReceiptPdf order={order} />);

    // 4. 发送邮件
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL,     // 发件人地址（如 "Acme <onboarding@resend.dev>"）
      to: recipientEmail,                  // 收件人邮箱
      subject: `Order Confirmation #${order.id}`,
      html: '<p>Thank you for your purchase! Your electronic receipt is attached to the email。</p>',
      attachments: [
        {
          filename: `order-${order.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (err) {
    console.error('Failed to send receipt email:', err);
    throw err; // 让上层处理
  }
}