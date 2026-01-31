// Re-exporting interfaces to match Supabase Schema
export interface Variant {
  name: string;
  price: number;
  original_price?: number; // changed from originalPrice
  image?: string;
  stock?: number;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  original_price?: number; // snake_case
  image_url: string;       // snake_case
  category: string;
  description: string;
  rating: number;
  is_amazing?: boolean;    // snake_case
  stock_count?: number;    // snake_case
  variants?: Variant[];
  specifications?: Specification[];
}

export interface Post {
  id: number;
  video_url: string;       // snake_case
  thumbnail: string;
  caption: string;
  likes: number;
  product_ids: number[];   // snake_case
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  read_time: number;
  created_at: string;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
}

// Keeping Dexie for Local Cart only, or as a cache (optional)
// For this migration, we primarily focus on API types.
// If you use Dexie for products, you must migrate the data or clear DB.
import Dexie, { Table } from 'dexie';

export class AppDatabase extends Dexie {
  products!: Table<Product>;
  posts!: Table<Post>;
  cart!: Table<CartItem>;
  blogs!: Table<BlogPost>;

  constructor() {
    super('DigiGramDB');
    this.version(5).stores({
      products: '++id, category, is_amazing',
      posts: '++id',
      cart: '++id, productId',
      blogs: '++id, category'
    });
  }
}

export const db = new AppDatabase();

// Seed Data logic
export const seedDatabase = async () => {
  const productCount = await db.products.count();

  // If data exists, we assume it's seeded. 
  // In a real "Background Sync" scenario, we would version check or overwrite here.
  if (productCount > 0) {
    console.log("Database already seeded. Offline mode ready.");
    return;
  }

  console.log("Seeding local database for offline capability...");

  const products: Product[] = [
    {
      id: 1,
      title: "هدفون بی‌سیم مدل Sony WH-1000XM5",
      price: 12500000,
      originalPrice: 14000000,
      image: "https://picsum.photos/400/400?random=1",
      category: "هدفون",
      description: "بهترین هدفون نویز کنسلینگ سونی با کیفیت صدای بی‌نظیر.",
      rating: 4.8,
      isAmazing: true,
      stock_count: 5,
      specifications: [{ label: 'وزن', value: '250 گرم' }, { label: 'باتری', value: '30 ساعت' }],
      variants: [
        { name: "مشکی", price: 12500000, originalPrice: 14000000, stock: 5 },
        { name: "نقره‌ای", price: 13200000, originalPrice: 15500000, image: "https://picsum.photos/400/400?random=11", stock: 2 }
      ]
    },
    {
      id: 2,
      title: "ساعت هوشمند اپل واچ سری ۹",
      price: 18900000,
      image: "https://picsum.photos/400/400?random=2",
      category: "ساعت",
      description: "صفحه نمایش همیشه روشن، سنسورهای سلامتی پیشرفته.",
      rating: 4.9,
      isAmazing: false,
      stock_count: 12,
      specifications: [{ label: 'اندازه', value: '45mm' }, { label: 'ضدآب', value: 'بله' }],
      variants: [
        { name: "41 میلی‌متر", price: 18900000, stock: 10 },
        { name: "45 میلی‌متر", price: 19800000, image: "https://picsum.photos/400/400?random=22", stock: 2 }
      ]
    },
    {
      id: 3,
      title: "کفش ورزشی نایکی مدل Air Zoom",
      price: 4500000,
      originalPrice: 5200000,
      image: "https://picsum.photos/400/400?random=3",
      category: "مد و پوشاک",
      description: "مناسب برای دویدن‌های طولانی و استفاده روزمره.",
      rating: 4.5,
      isAmazing: true,
      stock_count: 20,
      variants: [
        { name: "سایز ۴۰", price: 4500000, originalPrice: 5200000, stock: 5 },
        { name: "سایز ۴۱", price: 4500000, originalPrice: 5200000, stock: 5 },
        { name: "سایز ۴۲", price: 4500000, originalPrice: 5200000, stock: 0 }
      ]
    },
    {
      id: 4,
      title: "دوربین عکاسی کانون EOS R5",
      price: 145000000,
      image: "https://picsum.photos/400/400?random=4",
      category: "عکاسی",
      description: "دوربین فول فریم بدون آینه با قابلیت فیلمبرداری 8K.",
      rating: 5.0,
      isAmazing: false,
      stock_count: 3
    },
    {
      id: 5,
      title: "کوله پشتی کوهنوردی دیوتر",
      price: 3200000,
      image: "https://picsum.photos/400/400?random=5",
      category: "سفر و ورزش",
      description: "مقاوم در برابر آب، مناسب سفرهای ۳ روزه.",
      rating: 4.7,
      isAmazing: false,
      stock_count: 15
    },
    {
      id: 6,
      title: "لپ‌تاپ مک‌بوک پرو M3",
      price: 85000000,
      originalPrice: 89000000,
      image: "https://picsum.photos/400/400?random=6",
      category: "لپ‌تاپ",
      description: "قدرتمندترین لپ‌تاپ اپل با پردازنده M3.",
      rating: 4.9,
      isAmazing: true,
      stock_count: 8,
      specifications: [{ label: 'پردازنده', value: 'M3 Pro' }, { label: 'رم', value: '18GB' }]
    },
    {
      id: 7,
      title: "کیف چرمی دوشی زنانه",
      price: 1200000,
      image: "https://picsum.photos/400/400?random=7",
      category: "کیف",
      description: "چرم طبیعی دست‌دوز با طراحی کلاسیک.",
      rating: 4.3,
      isAmazing: false,
      stock_count: 0
    },
    {
      id: 8,
      title: "پاوربانک ۲۰۰۰۰ میلی‌آمپر انکر",
      price: 2500000,
      image: "https://picsum.photos/400/400?random=8",
      category: "لوازم الکترونیکی",
      description: "شارژ سریع با قابلیت شارژ همزمان سه دستگاه.",
      rating: 4.6,
      isAmazing: true,
      stock_count: 50
    }
  ];

  await db.products.bulkPut(products);

  const posts: Post[] = [
    {
      id: 1,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: "https://picsum.photos/400/600?random=101",
      caption: "تجربه سکوت مطلق با Sony WH-1000XM5 🎧 #سونی #هدفون #موسیقی",
      likes: 1205,
      productIds: [1]
    },
    {
      id: 2,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://picsum.photos/400/600?random=102",
      caption: "دویدن صبحگاهی با اپل واچ سری ۹ 🏃‍♀️ #AppleWatch #ورزش",
      likes: 3400,
      productIds: [2]
    },
    {
      id: 3,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnail: "https://picsum.photos/400/600?random=103",
      caption: "رکوردشکنی امروز با نایکی 👟 #Nike #JustDoIt",
      likes: 859,
      productIds: [3]
    },
    {
      id: 4,
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnail: "https://picsum.photos/400/600?random=104",
      caption: "مناظر زیبا در ارتفاعات 🏔️ #کوهنوردی #طبیعت",
      likes: 2100,
      productIds: [5]
    }
  ];

  await db.posts.bulkPut(posts);

  const blogs: BlogPost[] = [
    {
      id: 1,
      title: "راهنمای خرید بهترین هدفون نویز کنسلینگ ۲۰۲۴",
      excerpt: "اگر به دنبال سکوت مطلق هستید و می‌خواهید از موسیقی لذت ببرید، این راهنما برای شماست.",
      content: "در دنیای شلوغ امروز، داشتن یک هدفون نویز کنسلینگ خوب از نان شب واجب‌تر است. در این مقاله به بررسی مدل‌های سونی، اپل و بوز می‌پردازیم. \n\n سونی WH-1000XM5: پادشاه سکوت...",
      cover_image: "https://picsum.photos/800/600?random=201",
      author: "تیم تحریریه",
      category: "تکنولوژی",
      read_time: 5,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "۵ ترفند مخفی اپل واچ که باید بدانید",
      excerpt: "با این ترفندها از ساعت هوشمند خود حرفه‌ای‌تر استفاده کنید.",
      content: "اپل واچ فقط یک ساعت نیست، یک کامپیوتر مچی است. آیا می‌دانستید می‌توانید با ژست‌های حرکتی به تماس‌ها پاسخ دهید؟",
      cover_image: "https://picsum.photos/800/600?random=202",
      author: "علی محمدی",
      category: "آموزش",
      read_time: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "استایل ورزشی ترند تابستان امسال",
      excerpt: "چه لباس‌هایی برای ورزش در هوای گرم مناسب هستند؟",
      content: "انتخاب لباس ورزشی مناسب نه تنها به زیبایی شما کمک می‌کند، بلکه عملکرد ورزشی شما را نیز بهبود می‌بخشد.",
      cover_image: "https://picsum.photos/800/600?random=203",
      author: "سارا فراهانی",
      category: "مد و استایل",
      read_time: 4,
      created_at: new Date().toISOString()
    }
  ];

  await db.blogs.bulkPut(blogs);

  console.log("Database seeded successfully with Offline Content.");
};
