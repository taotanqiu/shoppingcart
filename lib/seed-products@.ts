// lib/seed-products.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma'; // Ensure this exports your Prisma client

/**
 * Seed the database with 100 random products.
 * @param clearExisting - If true, all existing products will be deleted first (default: true)
 * @returns The number of products inserted
 */
export async function seedProducts(clearExisting: boolean = true): Promise<number> {
  if (clearExisting) {
  
 await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.cartItem.deleteMany(),
      prisma.product.deleteMany(),
    ]);



    console.log('✅ Existing products cleared.');
  }

  // Helper: random price between 5 and 500 with two decimals
  const randomPrice = (min = 5, max = 500): Prisma.Decimal => {
    const price = Math.round((Math.random() * (max - min) + min) * 100) / 100;
    return new Prisma.Decimal(price);
  };

  // Helper: random stock between 0 and 100
  const randomStock = (max = 100): number => Math.floor(Math.random() * (max + 1));

  // Helper: random active status (80% chance of being active)
  const randomActive = (activeProbability = 0.8): boolean => Math.random() < activeProbability;

  // Word banks
  const adjectives = [
    'Premium', 'Deluxe', 'Eco', 'Smart', 'Wireless', 'Portable', 'Ergonomic',
    'Sleek', 'Compact', 'Durable', 'Lightweight', 'Waterproof', 'Stainless',
    'Modern', 'Classic', 'Professional', 'Advanced', 'Essential', 'Luxury',
    'Versatile', 'High-Performance', 'Energy-Efficient', 'User-Friendly', 'Innovative'
  ];

  const nouns = [
    'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Speaker', 'Keyboard',
    'Mouse', 'Monitor', 'Printer', 'Router', 'External Drive', 'Power Bank',
    'Charger', 'Cable', 'Adapter', 'Webcam', 'Microphone', 'Tripod', 'Bag',
    'Backpack', 'Watch', 'Fitness Tracker', 'E-Reader', 'Camera', 'Drone',
    'VR Headset', 'Game Console', 'Controller', 'Desk Lamp', 'Notebook',
    'Pen', 'Whiteboard', 'Calculator', 'Calendar', 'Organizer', 'Coffee Maker',
    'Blender', 'Toaster', 'Air Purifier', 'Fan', 'Heater', 'Humidifier',
    'Vacuum Cleaner', 'Iron', 'Hair Dryer', 'Shaver', 'Toothbrush', 'Scale',
    'Massager', 'Yoga Mat', 'Dumbbell', 'Resistance Band', 'Water Bottle',
    'Lunch Box', 'Umbrella', 'Sunglasses', 'Wallet', 'Belt', 'Hat', 'Scarf',
    'Gloves', 'Socks', 'Shoes', 'Jacket', 'T‑Shirt', 'Jeans', 'Dress', 'Skirt'
  ];

  const categories = [
    'Electronics', 'Office', 'Home & Kitchen', 'Sports', 'Fashion', 'Health',
    'Outdoor', 'Automotive', 'Toys', 'Books', 'Music', 'Gaming', 'Pet Supplies'
  ];

  // Generate 100 products
  const products = [];
  for (let i = 0; i < 100; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    // Add a random suffix to name to avoid unique constraint collisions
    const name = `${adj} ${noun} ${Math.floor(Math.random() * 1000)}`;
    const description = `A ${adj.toLowerCase()} ${noun.toLowerCase()} for ${cat.toLowerCase()}. Perfect for daily use.`;
    const price = randomPrice();
    const stock = randomStock();
    const isActive = randomActive();
    // Use Picsum images with IDs 1‑100 cycled
    const imageId = (i % 100) + 1;
    const imageUrl = `https://picsum.photos/id/${imageId}/400/400`;

    products.push({
      name,
      description,
      price,
      stock,
      imageUrl,
      isActive,
    });
  }

  // Insert all products (skip duplicates in case any name conflict occurs)
  const result = await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log(`✅ ${result.count} products inserted.`);
  return result.count;
}