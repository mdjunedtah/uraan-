// Master jewellery data

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  description: string;
  tag?: 'new' | 'bestseller' | 'sale' | 'soldout';
  material: string;
  weight?: string;
  purity?: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  count: number;
};

export type Review = {
  id: string;
  name: string;
  city: string;
  avatar: string;
  rating: number;
  text: string;
  product?: string;
  date: string;
  verified: boolean;
};

export const categories: Category[] = [
  { slug: 'gold', name: 'Gold Jewellery', description: '916 Hallmarked Gold', image: '/images/collection1.jpg', count: 124 },
  { slug: 'silver', name: 'Silver Jewellery', description: '92.5% Pure Silver', image: '/images/collection2.jpg', count: 98 },
  { slug: 'diamond', name: 'Diamond', description: 'Certified Diamonds', image: '/images/collection3.jpg', count: 56 },
  { slug: 'gems', name: 'Precious Gems', description: 'Ruby, Emerald, Sapphire', image: '/images/diamond-set.jpg', count: 42 },
  { slug: 'rudraksh', name: 'Rudraksh', description: '1 to 21 Mukhi Certified', image: '/images/necklace.jpg', count: 38 },
  { slug: 'necklaces', name: 'Necklaces', description: 'Statement & Daily Wear', image: '/images/necklace.jpg', count: 87 },
  { slug: 'earrings', name: 'Earrings', description: 'Jhumkas, Studs, Chandbalis', image: '/images/earrings.jpg', count: 112 },
  { slug: 'rings', name: 'Rings', description: 'Engagement & Cocktail', image: '/images/ring.jpg', count: 64 },
  { slug: 'bangles', name: 'Bangles', description: 'Traditional & Modern', image: '/images/bracelet.jpg', count: 78 },
  { slug: 'bracelets', name: 'Bracelets', description: 'Chain & Charm', image: '/images/bracelet.jpg', count: 45 },
  { slug: 'pendants', name: 'Pendants', description: 'Religious & Designer', image: '/images/necklace.jpg', count: 52 },
  { slug: 'bridal', name: 'Bridal Sets', description: 'Complete Bridal', image: '/images/bridal-set.jpg', count: 28 },
];

export const products: Product[] = [
  { id: 'p001', name: 'Diamond Floral Necklace', slug: 'diamond-floral-necklace', category: 'necklaces', price: 49999, oldPrice: 69999, image: '/images/necklace.jpg', description: 'Exquisite floral-inspired diamond necklace crafted in 18K gold. Perfect for weddings and special occasions.', tag: 'new', material: '18K Gold + Diamond', weight: '24g', purity: '750', inStock: true, rating: 4.8, reviewCount: 42 },
  { id: 'p002', name: 'Gold Temple Necklace', slug: 'gold-temple-necklace', category: 'necklaces', price: 64999, oldPrice: 89999, image: '/images/necklace.jpg', description: 'Traditional temple-design necklace in 22K gold, inspired by South Indian heritage.', tag: 'bestseller', material: '22K Gold', weight: '32g', purity: '916', inStock: true, rating: 4.9, reviewCount: 67 },
  { id: 'p003', name: 'Pearl & Gold Necklace', slug: 'pearl-gold-necklace', category: 'necklaces', price: 29999, oldPrice: 39999, image: '/images/necklace.jpg', description: 'Delicate pearl and gold combination — light, elegant, perfect for daily wear.', tag: 'sale', material: '18K Gold + Pearl', weight: '14g', purity: '750', inStock: true, rating: 4.7, reviewCount: 38 },
  { id: 'p004', name: 'Kundan Bridal Necklace', slug: 'kundan-bridal-necklace', category: 'bridal', price: 54999, oldPrice: 74999, image: '/images/bridal-set.jpg', description: 'Royal kundan necklace with uncut stones, ideal for the modern bride.', tag: 'bestseller', material: 'Kundan + Gold', weight: '38g', inStock: true, rating: 4.9, reviewCount: 89 },
  { id: 'p005', name: 'Ruby Gold Necklace', slug: 'ruby-gold-necklace', category: 'gems', price: 59999, oldPrice: 79999, image: '/images/necklace.jpg', description: 'Burmese ruby studded gold necklace — vibrant, rare, and certified.', tag: 'new', material: '22K Gold + Ruby', weight: '28g', purity: '916', inStock: true, rating: 4.8, reviewCount: 24 },
  { id: 'p006', name: 'Polki Diamond Necklace', slug: 'polki-diamond-necklace', category: 'diamond', price: 89999, oldPrice: 119999, image: '/images/diamond-set.jpg', description: 'Uncut polki diamonds set in 22K gold — a timeless heritage piece.', tag: 'bestseller', material: 'Polki + Gold', weight: '42g', purity: '916', inStock: true, rating: 5.0, reviewCount: 31 },
  { id: 'p101', name: 'Gold Jhumka Earrings', slug: 'gold-jhumka-earrings', category: 'earrings', price: 24999, oldPrice: 32999, image: '/images/earrings.jpg', description: 'Traditional bell-shaped jhumkas in 22K gold with pearl drops.', tag: 'new', material: '22K Gold + Pearl', weight: '12g', purity: '916', inStock: true, rating: 4.8, reviewCount: 56 },
  { id: 'p102', name: 'Diamond Stud Earrings', slug: 'diamond-stud-earrings', category: 'earrings', price: 19999, oldPrice: 26999, image: '/images/earrings.jpg', description: 'Classic round-cut diamond studs — your everyday luxury.', tag: 'bestseller', material: '18K Gold + Diamond', weight: '4g', purity: '750', inStock: true, rating: 4.9, reviewCount: 124 },
  { id: 'p103', name: 'Hoop Earrings', slug: 'hoop-earrings', category: 'earrings', price: 14999, oldPrice: 19999, image: '/images/earrings.jpg', description: 'Sleek gold hoops with intricate detailing.', tag: 'sale', material: '18K Gold', weight: '6g', purity: '750', inStock: true, rating: 4.6, reviewCount: 42 },
  { id: 'p104', name: 'Kundan Chandbali Earrings', slug: 'kundan-chandbali-earrings', category: 'earrings', price: 22999, oldPrice: 29999, image: '/images/earrings.jpg', description: 'Moon-shaped kundan chandbalis with emerald & pearl drops.', tag: 'new', material: 'Kundan + Gold', weight: '14g', inStock: true, rating: 4.8, reviewCount: 38 },
  { id: 'p105', name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings', category: 'earrings', price: 18999, oldPrice: 24999, image: '/images/earrings.jpg', description: 'Three-tier pearl drops — graceful and refined.', tag: 'bestseller', material: '18K Gold + Pearl', weight: '8g', purity: '750', inStock: true, rating: 4.7, reviewCount: 51 },
  { id: 'p201', name: 'Solitaire Diamond Ring', slug: 'solitaire-diamond-ring', category: 'rings', price: 39999, oldPrice: 54999, image: '/images/ring.jpg', description: 'Classic solitaire — for the moment that matters most.', tag: 'bestseller', material: '18K Gold + Diamond', weight: '4g', purity: '750', inStock: true, rating: 5.0, reviewCount: 88 },
  { id: 'p202', name: 'Emerald Cocktail Ring', slug: 'emerald-cocktail-ring', category: 'gems', price: 28999, oldPrice: 38999, image: '/images/ring.jpg', description: 'Colombian emerald set in 18K gold with diamond halo.', tag: 'new', material: '18K Gold + Emerald', weight: '5g', purity: '750', inStock: true, rating: 4.8, reviewCount: 22 },
  { id: 'p301', name: 'Silver Oxidised Necklace', slug: 'silver-oxidised-necklace', category: 'silver', price: 4999, oldPrice: 7999, image: '/images/necklace.jpg', description: '92.5% pure silver oxidised necklace with antique finish.', tag: 'sale', material: '92.5 Silver', weight: '22g', purity: '925', inStock: true, rating: 4.6, reviewCount: 67 },
  { id: 'p302', name: 'Silver Jhumka', slug: 'silver-jhumka', category: 'silver', price: 2999, oldPrice: 4499, image: '/images/earrings.jpg', description: 'Traditional silver jhumkas with mirror & bead work.', tag: 'new', material: '92.5 Silver', weight: '8g', purity: '925', inStock: true, rating: 4.7, reviewCount: 45 },
  { id: 'p303', name: 'Silver Pendant Set', slug: 'silver-pendant-set', category: 'silver', price: 3499, oldPrice: 4999, image: '/images/necklace.jpg', description: 'Sterling silver pendant with matching chain.', tag: 'bestseller', material: '92.5 Silver', weight: '6g', purity: '925', inStock: true, rating: 4.5, reviewCount: 33 },
  { id: 'p401', name: '5 Mukhi Rudraksh Mala', slug: '5-mukhi-rudraksh-mala', category: 'rudraksh', price: 1999, oldPrice: 2999, image: '/images/necklace.jpg', description: '108 beads, certified 5 Mukhi Nepali Rudraksh — for peace & wisdom.', tag: 'bestseller', material: 'Rudraksh (Nepal)', inStock: true, rating: 4.9, reviewCount: 156 },
  { id: 'p402', name: '1 Mukhi Rudraksh Pendant', slug: '1-mukhi-rudraksh-pendant', category: 'rudraksh', price: 8999, oldPrice: 12999, image: '/images/necklace.jpg', description: 'Rare 1 Mukhi Rudraksh in silver capping — for divine blessings.', tag: 'new', material: 'Rudraksh + Silver', inStock: true, rating: 5.0, reviewCount: 29 },
  { id: 'p403', name: '7 Mukhi Rudraksh Bracelet', slug: '7-mukhi-rudraksh-bracelet', category: 'rudraksh', price: 3499, oldPrice: 4999, image: '/images/bracelet.jpg', description: 'Wealth-attracting 7 Mukhi Rudraksh bracelet on elastic thread.', tag: 'sale', material: 'Rudraksh', inStock: true, rating: 4.8, reviewCount: 78 },
  { id: 'p501', name: 'Gold Kada Bangle', slug: 'gold-kada-bangle', category: 'bangles', price: 44999, oldPrice: 59999, image: '/images/bracelet.jpg', description: 'Solid 22K gold kada with traditional engravings.', tag: 'bestseller', material: '22K Gold', weight: '22g', purity: '916', inStock: true, rating: 4.9, reviewCount: 41 },
  { id: 'p502', name: 'Diamond Tennis Bracelet', slug: 'diamond-tennis-bracelet', category: 'bracelets', price: 79999, oldPrice: 99999, image: '/images/bracelet.jpg', description: 'Classic diamond tennis bracelet in 18K white gold.', tag: 'new', material: '18K White Gold + Diamond', weight: '12g', purity: '750', inStock: true, rating: 4.9, reviewCount: 27 },
  { id: 'p601', name: 'Om Gold Pendant', slug: 'om-gold-pendant', category: 'pendants', price: 7999, oldPrice: 10999, image: '/images/necklace.jpg', description: 'Sacred Om symbol pendant in 22K gold.', tag: 'bestseller', material: '22K Gold', weight: '4g', purity: '916', inStock: true, rating: 4.8, reviewCount: 92 },
  { id: 'p602', name: 'Ganesha Diamond Pendant', slug: 'ganesha-diamond-pendant', category: 'pendants', price: 15999, oldPrice: 21999, image: '/images/necklace.jpg', description: 'Lord Ganesha pendant studded with diamonds in 18K gold.', tag: 'new', material: '18K Gold + Diamond', weight: '5g', purity: '750', inStock: true, rating: 4.9, reviewCount: 48 },
];

export const reviews: Review[] = [
  { id: 'r001', name: 'Priya Sharma', city: 'Mumbai', avatar: '/images/model.jpg', rating: 5, text: 'The jewellery is absolutely stunning! Amazing quality and delivered on time. The packaging was so elegant.', product: 'Diamond Floral Necklace', date: '2025-03-15', verified: true },
  { id: 'r002', name: 'Ankit Verma', city: 'Delhi', avatar: '/images/model.jpg', rating: 5, text: 'Om Gauri Pulta is my go-to store now. Beautiful designs and great service. Bought a gift for my wife.', product: 'Pearl Drop Earrings', date: '2025-03-20', verified: true },
  { id: 'r003', name: 'Neha & Raj', city: 'Bangalore', avatar: '/images/model.jpg', rating: 5, text: 'I bought a necklace for my wife and she loved it! The craftsmanship is truly outstanding.', product: 'Kundan Bridal Necklace', date: '2025-04-02', verified: true },
  { id: 'r004', name: 'Suresh Iyer', city: 'Chennai', avatar: '/images/model.jpg', rating: 5, text: 'Authentic Rudraksh, beautifully packaged with certificate. Highly recommend.', product: '5 Mukhi Rudraksh Mala', date: '2025-04-10', verified: true },
  { id: 'r005', name: 'Meera Joshi', city: 'Pune', avatar: '/images/model.jpg', rating: 5, text: 'My daughter\'s wedding set was crafted to perfection. Heirloom quality that will be passed down generations.', product: 'Bridal Collection', date: '2025-04-18', verified: true },
  { id: 'r006', name: 'Rahul Mehta', city: 'Ahmedabad', avatar: '/images/model.jpg', rating: 5, text: 'Excellent service and genuine hallmarked jewellery. Will definitely shop again.', product: 'Gold Temple Necklace', date: '2025-04-25', verified: true },
  { id: 'r007', name: 'Anjali Kapoor', city: 'Jaipur', avatar: '/images/model.jpg', rating: 5, text: 'Beautiful silver collection at very reasonable prices. The oxidised necklace is my new favourite.', product: 'Silver Oxidised Necklace', date: '2025-05-01', verified: true },
  { id: 'r008', name: 'Vikram Singh', city: 'Lucknow', avatar: '/images/model.jpg', rating: 4, text: 'Great experience overall. Diamond stud earrings for my wife\'s birthday — she was thrilled.', product: 'Diamond Stud Earrings', date: '2025-05-08', verified: true },
  { id: 'r009', name: 'Kavita Nair', city: 'Kochi', avatar: '/images/model.jpg', rating: 5, text: 'Three generations of trust truly shows in the craftsmanship. Bought a temple necklace for my mother.', product: 'Gold Temple Necklace', date: '2025-05-12', verified: true },
];

export const instagramImages = [
  '/images/insta1.jpg',
  '/images/insta2.jpg',
  '/images/insta3.jpg',
  '/images/insta4.jpg',
  '/images/insta1.jpg',
  '/images/insta2.jpg',
];

export const heroSlides = [
  { eyebrow: 'Timeless Elegance', title:   '  Shine Every', titleEm: 'Moment', desc: 'Discover exquisite jewellery crafted with passion for every occasion.', cta: 'Shop Now', href: '/collections', image: '/images/hero.jpg' },
  { eyebrow: 'Bridal Collection', title: 'Heritage in', titleEm: 'Gold', desc: 'Handcrafted bridal masterpieces — celebrating every sacred moment.', cta: 'Explore Bridal', href: '/collections?type=bridal', image: '/images/banner.jpg' },
  { eyebrow: 'Sacred Rudraksh', title: 'Divine', titleEm: 'Blessings', desc: 'Authentic, certified Rudraksh from Nepal — for prosperity & peace.', cta: 'Discover Sacred', href: '/collections?type=rudraksh', image: '/images/luxury-bg.jpg' },
];