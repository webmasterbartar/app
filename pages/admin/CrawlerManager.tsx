
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Download, Instagram, Play, CheckCircle, Loader2, AlertCircle, Terminal, Package, Clapperboard, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toPersianDigits } from '../../utils/persianUtils';

interface ScrapedItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
  likes: number;
  status: 'pending' | 'imported';
}

const CrawlerManager: React.FC = () => {
  const [targetUsername, setTargetUsername] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scrapedItems, setScrapedItems] = useState<ScrapedItem[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('fa-IR');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startCrawl = async () => {
    if (!targetUsername) return alert('لطفا نام کاربری اینستاگرام را وارد کنید');
    
    setIsCrawling(true);
    setLogs([]);
    setScrapedItems([]);
    
    // Simulation Sequence
    try {
        addLog(`شروع فرآیند اتصال به صفحه @${targetUsername}...`);
        await new Promise(r => setTimeout(r, 1500));
        addLog("اتصال امن برقرار شد (Token: xyz_secure_bridge)");
        await new Promise(r => setTimeout(r, 1000));
        addLog("در حال دریافت اطلاعات پروفایل...");
        addLog(`پروفایل پیدا شد: ${targetUsername} | ۱۰.۵k دنبال‌کننده`);
        await new Promise(r => setTimeout(r, 1500));
        addLog("شروع اسکن پست‌های اخیر...");
        
        // Mock Data Generation
        const mockPosts: ScrapedItem[] = [
            {
                id: '1',
                type: 'video',
                url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                thumbnail: 'https://picsum.photos/400/600?random=crawl1',
                caption: 'ویدیو جدید ما از سری محصولات تابستانه! این ست ورزشی عالیه برای باشگاه و پیاده‌روی. قیمت: ۸۵۰,۰۰۰ تومان. #ورزش #ست_ورزشی #باشگاه',
                likes: 1250,
                status: 'pending'
            },
            {
                id: '2',
                type: 'image',
                url: 'https://picsum.photos/400/400?random=crawl2',
                caption: 'هدفون نویز کنسلینگ جدید رسید! کیفیت صدای بی‌نظیر و باتری ۳۰ ساعته. موجود در ۳ رنگ. قیمت: ۳,۲۰۰,۰۰۰ تومان.',
                likes: 890,
                status: 'pending'
            },
            {
                id: '3',
                type: 'image',
                url: 'https://picsum.photos/400/400?random=crawl3',
                caption: 'ساعت هوشمند طرح اولترا. صفحه نمایش همیشه روشن. سنسور اکسیژن خون. فقط ۱,۵۰۰,۰۰۰ تومان.',
                likes: 2100,
                status: 'pending'
            }
        ];

        for (let i = 0; i < mockPosts.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            addLog(`پست ${i+1} شناسایی شد (Likes: ${mockPosts[i].likes})`);
            addLog(`دانلود مدیا: ${mockPosts[i].type.toUpperCase()} - 100%`);
        }

        addLog("پایان عملیات. ۳ پست جدید یافت شد.");
        setScrapedItems(mockPosts);

    } catch (error) {
        addLog("خطا در ارتباط با سرور اینستاگرام.");
    } finally {
        setIsCrawling(false);
    }
  };

  const handleImport = async (item: ScrapedItem, type: 'product' | 'reel') => {
    setImportingId(item.id);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let payload: any = {};

        if (type === 'product') {
            // AI Processing for Product
            addLog(`در حال آنالیز محصول (ID: ${item.id}) با هوش مصنوعی...`);
            
            const prompt = `Analyze this Instagram caption and extract a product title and price (number only). Caption: "${item.caption}". Return JSON: { "title": string, "price": number, "description": string }`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            
            const aiData = JSON.parse(response.text || '{}');
            
            payload = {
                title: aiData.title || 'محصول اینستاگرامی',
                price: aiData.price || 0,
                description: aiData.description || item.caption,
                image_url: item.url, // In real app, re-upload this URL to Supabase Storage
                category: 'Imported',
                stock_count: 5
            };
            
            await api.products.create(payload);
            addLog(`محصول "${payload.title}" با موفقیت ایجاد شد.`);

        } else {
            // Import as Reel
            payload = {
                video_url: item.type === 'video' ? item.url : '', // In real app, logic to handle image-as-reel
                thumbnail: item.thumbnail || item.url,
                caption: item.caption,
                product_ids: []
            };
            await api.social.createReel(payload);
            addLog(`ریلز جدید با موفقیت منتشر شد.`);
        }

        // Mark as imported locally
        setScrapedItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'imported' } : p));

    } catch (error) {
        console.error(error);
        alert("خطا در ایمپورت");
    } finally {
        setImportingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-persian pb-20">
      
      <div className="flex items-center justify-between">
         <div>
             <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                 <Download className="text-[#ef394e]" />
                 خزنده اینستاگرام (Crawler)
             </h1>
             <p className="text-gray-500 text-sm mt-1">دانلود و انتشار خودکار محتوا از صفحات بیزینسی</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Configuration Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white">
                  <Instagram size={32} />
                  <div>
                      <h3 className="font-bold">اتصال به اینستاگرام</h3>
                      <p className="text-xs opacity-90">پست‌ها را مستقیماً به محصول تبدیل کنید</p>
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">نام کاربری (Username)</label>
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus-within:border-pink-500 transition-colors">
                          <span className="text-gray-400 font-bold">@</span>
                          <input 
                            type="text" 
                            dir="ltr"
                            className="bg-transparent w-full outline-none text-sm font-bold text-gray-800"
                            placeholder="digigram_store"
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                      <AlertCircle size={16} className="text-orange-500 shrink-0" />
                      <p>سیستم به صورت خودکار ۱۰ پست آخر را بررسی می‌کند.</p>
                  </div>

                  <button 
                    onClick={startCrawl}
                    disabled={isCrawling}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      {isCrawling ? <Loader2 className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                      {isCrawling ? 'در حال اسکن...' : 'شروع عملیات'}
                  </button>
              </div>
          </div>

          {/* Terminal / Logs */}
          <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-3xl shadow-lg border border-gray-800 font-mono text-left flex flex-col h-[400px]">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
                  <Terminal size={18} className="text-green-400" />
                  <span className="text-gray-300 text-xs font-bold">System Console</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {logs.length === 0 ? (
                      <span className="text-gray-600 text-sm">Waiting for command...</span>
                  ) : logs.map((log, i) => (
                      <div key={i} className="text-xs text-green-400/90 font-mono border-l-2 border-green-500/30 pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
                          {log}
                      </div>
                  ))}
                  <div ref={logsEndRef} />
              </div>
          </div>
      </div>

      {/* Results Grid */}
      {scrapedItems.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" />
                  محتوای یافت شده ({toPersianDigits(scrapedItems.length)})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scrapedItems.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 group hover:border-pink-200 transition-colors">
                          <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                              {item.type === 'video' ? (
                                  <video src={item.url} className="w-full h-full object-cover" />
                              ) : (
                                  <img src={item.url} className="w-full h-full object-cover" />
                              )}
                              <div className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded-md">
                                  {item.type === 'video' ? <Clapperboard size={12} /> : <Instagram size={12} />}
                              </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                              <p className="text-xs text-gray-600 line-clamp-3 leading-5 mb-2">{item.caption}</p>
                              
                              {item.status === 'imported' ? (
                                  <div className="bg-green-50 text-green-600 py-2 rounded-xl text-xs font-bold text-center border border-green-100">
                                      ایمپورت شد
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                      <button 
                                        onClick={() => handleImport(item, 'product')}
                                        disabled={importingId === item.id}
                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-xl text-[10px] font-bold transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                                      >
                                          {importingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                                          تبدیل به محصول
                                      </button>
                                      <button 
                                        onClick={() => handleImport(item, 'reel')}
                                        disabled={importingId === item.id}
                                        className="bg-pink-50 text-pink-600 hover:bg-pink-100 py-2 rounded-xl text-[10px] font-bold transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                                      >
                                          {importingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Clapperboard size={14} />}
                                          افزودن به ریلز
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
};

export default CrawlerManager;
