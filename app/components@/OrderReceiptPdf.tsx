// components/OrderReceiptPdf.tsx
// 'use client'
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 1. Define styles (similar to CSS, using camelCase)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderInfo: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: '#666666',
    width: '30%',
  },
  value: {
    width: '70%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    padding: 8,
  },
  tableCol1: { width: '50%' },
  tableCol2: { width: '20%', textAlign: 'right' },
  tableCol3: { width: '15%', textAlign: 'right' },
  tableCol4: { width: '15%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    fontWeight: 'bold',
  },
});

// 2. Define Props type, receiving order data
interface OrderReceiptPdfProps {
  order: {
    id: string;
    total: number;
    createdAt: Date;
    items: Array<{
      product: { name: string };
      quantity: number;
      price: number;
    }>;
    user?: { email?: string } | null;
  };
}

// 3. Create Document component
const OrderReceiptPdf: React.FC<OrderReceiptPdfProps> = ({ order }) => {

  if (!order) {
    console.error('sendOrderReceipt 被调用时 order 为 null');
    return; // 或者 throw new Error('Order is missing');
  }
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Mall</Text>
        <Text>Order Receipt</Text>
      </View>

      {/* Order Information */}
      <View style={styles.orderInfo}>
        <View style={styles.row}>
          <Text style={styles.label}>Order Number:</Text>
          <Text style={styles.value}>{order.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Date:</Text>
          <Text style={styles.value}>{new Date(order.createdAt).toLocaleString('en-CA')}</Text>
        </View>
        {order.user?.email && (
          <View style={styles.row}>
            <Text style={styles.label}>Customer Email:</Text>
            <Text style={styles.value}>{order.user.email}</Text>
          </View>
        )}
      </View>

      {/* Items Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableCol1}>Product Name</Text>
        <Text style={styles.tableCol2}>Unit Price</Text>
        <Text style={styles.tableCol3}>Quantity</Text>
        <Text style={styles.tableCol4}>Subtotal</Text>
      </View>

      {/* Items Rows */}
      {order.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.tableCol1}>{item.product.name}</Text>
          <Text style={styles.tableCol2}>${item.price.toFixed(2)}</Text>
          <Text style={styles.tableCol3}>{item.quantity}</Text>
          <Text style={styles.tableCol4}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text>Total: ${order.total.toFixed(2)}</Text>
      </View>

      {/* Footer Note */}
      <Text style={{ position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', color: '#999', fontSize: 10 }}>
        This receipt is an electronic document and can be used as proof of payment.
      </Text>
    </Page>
  </Document>
);
}

export default OrderReceiptPdf;