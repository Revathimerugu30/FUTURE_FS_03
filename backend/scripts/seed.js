require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const PRODUCTS = [
  { name: 'Andhra Avakaya Pickle', category: 'Avakaya Pickle', price: 349, mrp: 399, stock: 50, isFeatured: true, description: 'The legendary Andhra raw-mango pickle in mustard and sesame oil. Bold, fiery, and unforgettable.', ingredients: ['Raw mango', 'Mustard', 'Red chilli', 'Sesame oil', 'Salt'], image: 'https://images.unsplash.com/photo-1599056407101-7c557a4a0144?w=900&auto=format&fit=crop' },
  { name: 'Gongura Pachadi', category: 'Gongura Pickle', price: 299, mrp: 349, stock: 40, isFeatured: true, description: 'Tangy sorrel leaves slow-cooked with red chillies, garlic and traditional tempering.', ingredients: ['Gongura leaves', 'Garlic', 'Red chilli', 'Sesame oil'], image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=900&auto=format&fit=crop' },
  { name: 'Lemon Pickle', category: 'Lemon Pickle', price: 219, mrp: 249, stock: 60, description: 'Sun-cured lemon wedges in aromatic spices — sweet, sour and intensely flavourful.', ingredients: ['Lemon', 'Salt', 'Red chilli', 'Fenugreek'], image: 'https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?w=900&auto=format&fit=crop' },
  { name: 'Garlic Pickle', category: 'Garlic Pickle', price: 259, mrp: 299, stock: 45, description: 'Whole garlic cloves marinated in tempered chilli oil. A powerhouse condiment.', ingredients: ['Garlic', 'Red chilli', 'Sesame oil', 'Spices'], image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900&auto=format&fit=crop' },
  { name: 'Sweet Mango Pickle', category: 'Mango Pickle', price: 279, mrp: 319, stock: 55, isFeatured: true, description: 'Tender mango pieces in jaggery and spice — the perfect balance of sweet and tangy.', ingredients: ['Mango', 'Jaggery', 'Spices'], image: 'https://images.unsplash.com/photo-1601001435957-74f0958a93c5?w=900&auto=format&fit=crop' },
  { name: 'Chicken Pickle (Boneless)', category: 'Chicken Pickle', price: 549, mrp: 599, stock: 30, isFeatured: true, description: 'Slow-cooked boneless chicken in a robust masala and pure sesame oil.', ingredients: ['Chicken', 'Spices', 'Sesame oil', 'Vinegar'], image: 'https://images.unsplash.com/photo-1626777553635-46df8ecedf24?w=900&auto=format&fit=crop' },
  { name: 'Mutton Pickle', category: 'Mutton Pickle', price: 749, mrp: 799, stock: 20, description: 'Tender mutton chunks cured in a fiery Andhra masala. A festive favourite.', ingredients: ['Mutton', 'Spices', 'Sesame oil'], image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900&auto=format&fit=crop' },
  { name: 'Fish Pickle', category: 'Fish Pickle', price: 599, mrp: 649, stock: 25, description: 'Boneless fish cubes preserved in tangy spice and oil — coastal Andhra style.', ingredients: ['Fish', 'Spices', 'Vinegar', 'Sesame oil'], image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop' },
  { name: 'Prawn Pickle', category: 'Prawn Pickle', price: 699, mrp: 749, stock: 22, description: 'Plump prawns in a spicy garlic-chilli oil base. Coastal indulgence in a jar.', ingredients: ['Prawns', 'Garlic', 'Spices', 'Sesame oil'], image: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=900&auto=format&fit=crop' },
];

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Promise.all(PRODUCTS.map((product) => Product.create(product)));
  console.log(`✅ Seeded ${PRODUCTS.length} products`);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vasistapickles.com';
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Vasista Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  const demoCustomer = await User.findOne({ email: 'customer@test.com' });
  if (!demoCustomer) {
    await User.create({
      name: 'Demo Customer',
      email: 'customer@test.com',
      password: 'Customer@123',
      role: 'customer',
    });
    console.log('✅ Demo customer created');
  }

  process.exit(0);
})();
