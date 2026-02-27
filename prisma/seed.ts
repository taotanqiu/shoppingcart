// prisma/seed.product.ts
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始 seeding 商品数据...')

  // 清空现有商品（可选，避免重复）
  await prisma.product.deleteMany()
  console.log('已清空商品表')

  // 创建示例商品
  const products = [
    {
      name: '经典T恤',
      description: '纯棉舒适，夏季必备',
      price: new Prisma.Decimal(99.99),
      stock: 100,
      imageUrl: '/images/tshirt.jpg',
      isActive: true,
    },
    {
      name: '运动鞋',
      description: '轻便透气，适合跑步',
      price: new Prisma.Decimal(299.0),
      stock: 50,
      imageUrl: '/images/sneakers.jpg',
      isActive: true,
    },
    {
      name: '背包',
      description: '大容量，防水面料',
      price: new Prisma.Decimal(159.5),
      stock: 30,
      imageUrl: '/images/backpack.jpg',
      isActive: true,
    },
    {
      name: '太阳镜',
      description: '防紫外线，时尚款式',
      price: new Prisma.Decimal(89.9),
      stock: 20,
      imageUrl: '/images/sunglasses.jpg',
      isActive: true,
    },
    {
      name: '帽子',
      description: '遮阳透气，多种颜色',
      price: new Prisma.Decimal(49.9),
      stock: 150,
      imageUrl: '/images/hat.jpg',
      isActive: false, // 测试未上架商品
    },
  ]

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    })
    console.log(`创建商品: ${created.name} (ID: ${created.id})`)
  }

  console.log('商品 seeding 完成！')
}

main()
  .catch((e) => {
    console.error('Seeding 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })