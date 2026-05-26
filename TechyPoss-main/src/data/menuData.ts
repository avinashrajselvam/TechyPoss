import { Category, MenuItem } from '../types';

export const categories: Category[] = [
  { id: 'all', name: 'All Items', icon: 'Grid3x3', color: 'bg-slate-600' },
  { id: 'starters', name: 'Starters', icon: 'Salad', color: 'bg-orange-500' },
  { id: 'mains', name: 'Main Course', icon: 'UtensilsCrossed', color: 'bg-red-500' },
  { id: 'breads', name: 'Breads', icon: 'Sandwich', color: 'bg-yellow-500' },
  { id: 'rice', name: 'Rice & Biryani', icon: 'ChefHat', color: 'bg-amber-600' },
  { id: 'desserts', name: 'Desserts', icon: 'IceCream', color: 'bg-pink-500' },
  { id: 'beverages', name: 'Beverages', icon: 'Coffee', color: 'bg-teal-500' },
  { id: 'soups', name: 'Soups', icon: 'Soup', color: 'bg-green-600' },
];

export const menuItems: MenuItem[] = [
  // Starters
  {
    id: 'S001', name: 'Paneer Tikka', category: 'starters', price: 280,
    description: 'Marinated cottage cheese grilled to perfection',
    image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular', 'spicy']
  },
  {
    id: 'S002', name: 'Chicken Tikka', category: 'starters', price: 320,
    description: 'Juicy chicken pieces marinated in spicy yogurt',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true, tags: ['popular']
  },
  {
    id: 'S003', name: 'Veg Spring Rolls', category: 'starters', price: 180,
    description: 'Crispy rolls filled with fresh vegetables',
    image: 'https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'S004', name: 'Seekh Kebab', category: 'starters', price: 340,
    description: 'Minced lamb with aromatic spices on skewers',
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true, tags: ['chef special']
  },
  {
    id: 'S005', name: 'Mushroom 65', category: 'starters', price: 220,
    description: 'Deep fried mushrooms with Indian spices',
    image: 'https://images.pexels.com/photos/3590401/pexels-photo-3590401.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'S006', name: 'Fish Finger', category: 'starters', price: 360,
    description: 'Crispy battered fish fillets with tartar sauce',
    image: 'https://images.pexels.com/photos/8697534/pexels-photo-8697534.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true
  },

  // Mains
  {
    id: 'M001', name: 'Butter Chicken', category: 'mains', price: 380,
    description: 'Creamy tomato-based curry with tender chicken',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true, tags: ['bestseller', 'popular']
  },
  {
    id: 'M002', name: 'Palak Paneer', category: 'mains', price: 300,
    description: 'Cottage cheese in rich spinach gravy',
    image: 'https://images.pexels.com/photos/6645924/pexels-photo-6645924.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular']
  },
  {
    id: 'M003', name: 'Dal Makhani', category: 'mains', price: 260,
    description: 'Slow-cooked black lentils with cream',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'M004', name: 'Lamb Rogan Josh', category: 'mains', price: 450,
    description: 'Kashmiri style braised lamb curry',
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true, tags: ['chef special']
  },
  {
    id: 'M005', name: 'Paneer Butter Masala', category: 'mains', price: 320,
    description: 'Rich and creamy paneer curry',
    image: 'https://images.pexels.com/photos/9609846/pexels-photo-9609846.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['bestseller']
  },
  {
    id: 'M006', name: 'Chicken Kadai', category: 'mains', price: 390,
    description: 'Spicy wok-cooked chicken with peppers',
    image: 'https://images.pexels.com/photos/6542707/pexels-photo-6542707.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true
  },

  // Breads
  {
    id: 'B001', name: 'Butter Naan', category: 'breads', price: 60,
    description: 'Soft leavened bread with butter',
    image: 'https://images.pexels.com/photos/8887008/pexels-photo-8887008.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'B002', name: 'Garlic Naan', category: 'breads', price: 70,
    description: 'Naan topped with garlic and coriander',
    image: 'https://images.pexels.com/photos/6646085/pexels-photo-6646085.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular']
  },
  {
    id: 'B003', name: 'Tandoori Roti', category: 'breads', price: 40,
    description: 'Whole wheat bread from the tandoor',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'B004', name: 'Cheese Kulcha', category: 'breads', price: 100,
    description: 'Stuffed bread with melted cheese',
    image: 'https://images.pexels.com/photos/9609846/pexels-photo-9609846.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'B005', name: 'Paratha', category: 'breads', price: 50,
    description: 'Flaky layered whole wheat bread',
    image: 'https://images.pexels.com/photos/8887008/pexels-photo-8887008.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },

  // Rice & Biryani
  {
    id: 'R001', name: 'Chicken Biryani', category: 'rice', price: 380,
    description: 'Fragrant basmati rice with spiced chicken',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true, tags: ['bestseller', 'popular']
  },
  {
    id: 'R002', name: 'Veg Biryani', category: 'rice', price: 280,
    description: 'Aromatic rice with mixed vegetables',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'R003', name: 'Mutton Biryani', category: 'rice', price: 450,
    description: 'Slow-cooked rice with tender mutton',
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true, tags: ['chef special']
  },
  {
    id: 'R004', name: 'Jeera Rice', category: 'rice', price: 160,
    description: 'Cumin-flavored steamed basmati rice',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },

  // Desserts
  {
    id: 'D001', name: 'Gulab Jamun', category: 'desserts', price: 120,
    description: 'Soft milk dumplings in rose syrup',
    image: 'https://images.pexels.com/photos/6941041/pexels-photo-6941041.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular']
  },
  {
    id: 'D002', name: 'Rasgulla', category: 'desserts', price: 100,
    description: 'Soft cottage cheese balls in sugar syrup',
    image: 'https://images.pexels.com/photos/8477483/pexels-photo-8477483.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'D003', name: 'Ice Cream (2 Scoops)', category: 'desserts', price: 140,
    description: 'Premium vanilla and chocolate ice cream',
    image: 'https://images.pexels.com/photos/1352196/pexels-photo-1352196.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'D004', name: 'Kulfi', category: 'desserts', price: 120,
    description: 'Traditional Indian frozen dessert',
    image: 'https://images.pexels.com/photos/1352196/pexels-photo-1352196.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },

  // Beverages
  {
    id: 'V001', name: 'Mango Lassi', category: 'beverages', price: 120,
    description: 'Chilled yogurt drink with fresh mango',
    image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular']
  },
  {
    id: 'V002', name: 'Masala Chai', category: 'beverages', price: 60,
    description: 'Spiced Indian tea with milk',
    image: 'https://images.pexels.com/photos/1813124/pexels-photo-1813124.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'V003', name: 'Fresh Lime Soda', category: 'beverages', price: 80,
    description: 'Refreshing lime with soda water',
    image: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'V004', name: 'Soft Drinks', category: 'beverages', price: 50,
    description: 'Pepsi, Coke, Sprite, 7-Up',
    image: 'https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'V005', name: 'Cold Coffee', category: 'beverages', price: 140,
    description: 'Chilled blended coffee with ice cream',
    image: 'https://images.pexels.com/photos/1813124/pexels-photo-1813124.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular']
  },

  // Soups
  {
    id: 'SP001', name: 'Tomato Soup', category: 'soups', price: 140,
    description: 'Classic creamy tomato soup with croutons',
    image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true
  },
  {
    id: 'SP002', name: 'Sweet Corn Soup', category: 'soups', price: 160,
    description: 'Thick corn soup with vegetables',
    image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true, isAvailable: true, tags: ['popular']
  },
  {
    id: 'SP003', name: 'Chicken Clear Soup', category: 'soups', price: 180,
    description: 'Light chicken broth with vegetables',
    image: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: false, isAvailable: true
  },
];
