
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, ArrowRight, Loader2, UploadCloud, Check, DollarSign, Package, Tag, Percent, AlertCircle, List, X, Sparkles, Wand2, Split, ChevronLeft } from 'lucide-react';
import { toPersianDigits } from '../../utils/persianUtils';
import { GoogleGenAI, Type } from "@google/genai";

// Interface matching the Supabase DB Schema more loosely to handle variations
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  original_price: number;
  image_url: string; 
  description: string;
  is_amazing: boolean;
  stock_count: number;
  specifications: { label: string; value: string }[] | null;
  variants: { name: string; price: number; original_price?: number; stock: number }[] | null;
}

const ProductManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // AI States
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);

  // Form State
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    price: 0,
    original_price: 0,
    description: '',
    is_amazing: false,
    stock_count: 10,
    category: '',
    image_url: '',
    variants: []
  });

  // Specifications State (Dynamic List)
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([]);

  // Variants State (Local builder state)
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<{ name: string; price: number; original_price?: number; stock: number }[]>([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '', original_price: '', stock: '10' });

  // Local state for file before upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // --- Shared Input Styles ---
  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#ef394e] focus:ring-4 focus:ring-[#ef394e]/5 transition-all duration-200";
  const labelClass = "block text-xs font-bold text-gray-700 mb-2";

  // --- Data Fetching ---
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const data = await api.products.getAll();
        // Map data to ensure consistency (handle image vs image_url)
        const mappedData = (data || []).map((p: any) => ({
            ...p,
            image_url: p.image_url || p.image || '',
            original_price: p.original_price || p.originalPrice || 0,
            stock_count: p.stock_count || p.stock || 0,
            is_amazing: p.is_amazing || p.isAmazing || false
        }));
        setProducts(mappedData);
    } catch (err) {
        console.error("Error fetching products:", err);
    } finally {
        setLoading(false);
    }
  };

  const fetchCategories = async () => {
      try {
          const data = await api.categories.getAll();
          setCategories(data);
      } catch (err) {
          console.error("Error fetching categories:", err);
      }
  };

  // --- Helpers ---
  const formatNumberInput = (num: number | undefined | string) => {
    if (!num) return '';
    return Number(num).toLocaleString();
  };

  const calculateDiscount = () => {
    if (!isVariable && formData.original_price && formData.price && formData.original_price > formData.price) {
      return Math.round(((formData.original_price - formData.price) / formData.original_price) * 100);
    }
    return 0;
  };

  // --- AI Handlers ---
  const handleGenerateDescription = async () => {
    if (!formData.title) return alert("لطفا ابتدا عنوان محصول را وارد کنید");
    
    setIsGeneratingDesc(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a persuasive and professional Persian product description (about 80 words) for an e-commerce product titled "${formData.title}" in the category "${formData.category || 'General'}". Focus on key features and benefits. Do not use markdown symbols like **.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        if (response.text) {
            setFormData(prev => ({ ...prev, description: response.text || '' }));
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("خطا در ارتباط با هوش مصنوعی. لطفا مجدد تلاش کنید.");
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const handleGenerateSpecs = async () => {
    if (!formData.title) return alert("لطفا ابتدا عنوان محصول را وارد کنید");
    
    setIsGeneratingSpecs(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Extract or infer 4 to 6 key technical specifications for the product "${formData.title}". Return ONLY a JSON array of objects with 'label' (Persian name of attribute) and 'value' (Persian value). Example: [{"label": "وزن", "value": "150 گرم"}]`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text;
        if (jsonText) {
            const generatedSpecs = JSON.parse(jsonText);
            setSpecs(prev => {
                const newSpecs = [...prev];
                generatedSpecs.forEach((gs: any) => {
                    if(!newSpecs.find(s => s.label === gs.label)) {
                        newSpecs.push(gs);
                    }
                });
                return newSpecs.length > 0 ? newSpecs : generatedSpecs;
            });
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("خطا در تولید مشخصات");
    } finally {
        setIsGeneratingSpecs(false);
    }
  };

  // --- Spec Handlers ---
  const addSpecRow = () => setSpecs([...specs, { label: '', value: '' }]);
  const removeSpecRow = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpecRow = (index: number, field: 'label' | 'value', text: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = text;
    setSpecs(newSpecs);
  };
  const addPresetSpec = (label: string) => setSpecs([...specs, { label, value: '' }]);

  // --- Variant Handlers ---
  const addVariant = () => {
      if (!newVariant.name || !newVariant.price) return alert("نام و قیمت تنوع الزامی است");
      setVariants([...variants, {
          name: newVariant.name,
          price: Number(newVariant.price),
          original_price: Number(newVariant.original_price) || 0,
          stock: Number(newVariant.stock) || 0
      }]);
      setNewVariant({ name: '', price: '', original_price: '', stock: '10' });
  };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  // --- Main Handlers ---
  const handleEdit = (product: any) => {
    setEditId(product.id);
    
    // Check for variants (handle both array or null)
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
    setIsVariable(hasVariants);
    setVariants(hasVariants ? product.variants : []);

    setFormData({
        title: product.title,
        price: product.price,
        original_price: product.original_price || product.originalPrice,
        description: product.description,
        is_amazing: product.is_amazing || product.isAmazing,
        stock_count: product.stock_count || product.stock || 0,
        category: product.category,
        image_url: product.image_url || product.image
    });
    
    // Safely set specs
    if (product.specifications && Array.isArray(product.specifications)) {
        setSpecs(product.specifications);
    } else {
        setSpecs([]);
    }

    setPreviewUrl(product.image_url || product.image || '');
    setSelectedFile(null);
    setView('form');
  };

  const handleCreate = () => {
    setEditId(null);
    setFormData({ 
        title: '', 
        price: 0, 
        original_price: 0,
        description: '', 
        is_amazing: false, 
        stock_count: 10,
        category: categories.length > 0 ? categories[0].name : '',
        image_url: ''
    });
    setSpecs([]); 
    setVariants([]);
    setIsVariable(false);
    setPreviewUrl('');
    setSelectedFile(null);
    setView('form');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
        alert("لطفا فیلدهای ضروری (عنوان، دسته‌بندی) را تکمیل کنید.");
        return;
    }

    if (!isVariable && !formData.price) {
        alert("لطفا قیمت محصول را وارد کنید.");
        return;
    }

    if (isVariable && variants.length === 0) {
        alert("لطفا حداقل یک تنوع (Variant) اضافه کنید یا حالت متغیر را غیرفعال کنید.");
        return;
    }

    setSaving(true);

    try {
        let finalImageUrl = formData.image_url;

        // Upload Image if selected
        if (selectedFile) {
            try {
                const uploadedUrl = await api.products.uploadImage(selectedFile);
                if (uploadedUrl) finalImageUrl = uploadedUrl;
            } catch (uploadError: any) {
                console.error("Image upload failed:", uploadError);
                alert("هشدار: آپلود تصویر انجام نشد. محصول بدون تصویر جدید ذخیره می‌شود.");
            }
        }

        // Determine price/stock logic
        let mainPrice = Number(formData.price);
        let mainOriginalPrice = Number(formData.original_price) || 0;
        let mainStock = Number(formData.stock_count) || 0;

        if (isVariable && variants.length > 0) {
            // Main price is the lowest variant price
            const lowestVariant = variants.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
            mainPrice = lowestVariant.price;
            mainOriginalPrice = lowestVariant.original_price || 0;
            mainStock = variants.reduce((sum, v) => sum + v.stock, 0);
        }

        const validSpecs = specs.filter(s => s.label.trim() !== '' && s.value.trim() !== '');

        const payload = {
            title: formData.title,
            price: mainPrice,
            original_price: mainOriginalPrice,
            description: formData.description || '',
            is_amazing: formData.is_amazing || false,
            stock_count: mainStock,
            category: formData.category,
            image_url: finalImageUrl,
            specifications: validSpecs,
            variants: isVariable ? variants : null
        };

        if (editId) {
            await api.products.update(editId, payload);
        } else {
            await api.products.create(payload);
        }

        alert(editId ? "محصول با موفقیت ویرایش شد" : "محصول جدید با موفقیت ایجاد شد");
        await fetchProducts();
        setView('list');

    } catch (err: any) {
        console.error("Save Error:", err);
        alert("خطا در ذخیره محصول: " + (err.message || "Unknown Error"));
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
    try {
        await api.products.delete(id);
        fetchProducts();
    } catch (err) {
        alert("خطا در حذف محصول");
    }
  };

  // --- Render ---

  if (view === 'list') {
    return (
      <div className="space-y-6 font-persian">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-800">مدیریت محصولات</h1>
          <button onClick={handleCreate} className="bg-[#ef394e] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-colors text-sm">
            <Plus size={20} /> افزودن محصول جدید
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 w-20">تصویر</th>
                    <th className="p-4 text-xs font-bold text-gray-500">عنوان محصول</th>
                    <th className="p-4 text-xs font-bold text-gray-500">دسته‌بندی</th>
                    <th className="p-4 text-xs font-bold text-gray-500">قیمت</th>
                    <th className="p-4 text-xs font-bold text-gray-500">موجودی</th>
                    <th className="p-4 text-xs font-bold text-gray-500 text-left">عملیات</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">در حال بارگذاری...</td></tr>
                ) : products.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">هیچ محصولی یافت نشد.</td></tr>
                ) : products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {p.image_url ? (
                            <img src={p.image_url} className="w-full h-full object-cover" alt={p.title} />
                            ) : (
                            <ImageIcon className="w-full h-full p-3 text-gray-300" />
                            )}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm line-clamp-1">{p.title}</span>
                            {p.variants && p.variants.length > 0 && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded w-fit mt-1">چند متغیره</span>
                            )}
                        </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{p.category || '-'}</span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">
                        {toPersianDigits(p.price?.toLocaleString())} <span className="text-[10px] text-gray-500">تومان</span>
                    </td>
                    <td className="p-4 text-sm font-bold">
                        <span className={`${(p.stock_count || 0) < 5 ? 'text-red-500' : 'text-green-600'}`}>
                            {toPersianDigits(p.stock_count || 0)}
                        </span>
                    </td>
                    <td className="p-4 text-left space-x-2 space-x-reverse">
                        <button onClick={() => handleEdit(p)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const discountPercent = calculateDiscount();

  return (
    <div className="max-w-7xl mx-auto font-persian pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-20">
         <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ChevronLeft size={24} className="rotate-180" />
            </button>
            <div>
                <h1 className="text-xl font-black text-gray-800">{editId ? 'ویرایش محصول' : 'ایجاد محصول جدید'}</h1>
                <p className="text-xs text-gray-500 hidden md:block">اطلاعات محصول را تکمیل کنید و دکمه ذخیره را بزنید</p>
            </div>
         </div>
         <div className="flex gap-2">
            <button 
                type="button"
                onClick={() => setView('list')}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
                انصراف
            </button>
            <button 
                onClick={handleSave} 
                disabled={loading || saving}
                className="bg-[#ef394e] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-[#d63044] transition-all flex items-center gap-2 text-sm"
            >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editId ? 'بروزرسانی' : 'انتشار محصول'}
            </button>
         </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Basic Information */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Tag size={20} className="text-[#ef394e]" />
                        اطلاعات پایه
                    </h3>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>عنوان محصول <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className={inputClass}
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="مثلا: هدفون بی‌سیم سونی مدل XM5"
                            required 
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className={labelClass}>توضیحات محصول</label>
                             <button 
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDesc || !formData.title}
                                className="flex items-center gap-1.5 text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                 تولید با هوش مصنوعی
                             </button>
                        </div>
                        <textarea 
                            className={`${inputClass} h-40 resize-none leading-7`}
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder={isGeneratingDesc ? "در حال نوشتن توضیحات جذاب برای شما..." : "توضیحات کامل محصول، ویژگی‌ها و مزایا..."}
                        />
                    </div>
                </div>
            </div>

            {/* 2. SPECIFICATIONS */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <List size={20} className="text-indigo-500" />
                        مشخصات فنی
                    </h3>
                    <button 
                        type="button"
                        onClick={handleGenerateSpecs}
                        disabled={isGeneratingSpecs || !formData.title}
                        className="flex items-center gap-1.5 text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingSpecs ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        پیشنهاد خودکار
                    </button>
                </div>
                
                {/* Specs List */}
                <div className="space-y-3 mb-4">
                    {specs.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input 
                                type="text" 
                                placeholder="ویژگی (مثلا: وزن)"
                                className={inputClass}
                                value={spec.label}
                                onChange={(e) => updateSpecRow(index, 'label', e.target.value)}
                            />
                            <div className="text-gray-300">:</div>
                            <input 
                                type="text" 
                                placeholder="مقدار (مثلا: ۱۵۰ گرم)"
                                className={inputClass}
                                value={spec.value}
                                onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={() => removeSpecRow(index)}
                                className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                    {specs.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/50">
                            <List size={24} className="opacity-20" />
                            <span className="text-sm font-bold">هنوز مشخصاتی اضافه نکرده‌اید</span>
                            <span className="text-xs text-gray-400">برای شروع دکمه افزودن سطر یا پیشنهاد خودکار را بزنید</span>
                        </div>
                    )}
                </div>

                {/* Add/Preset Actions */}
                <div className="flex flex-wrap gap-2">
                    <button 
                        type="button" 
                        onClick={addSpecRow}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <Plus size={14} /> افزودن سطر
                    </button>
                    
                    <div className="w-[1px] bg-gray-200 mx-1"></div>
                    <span className="text-xs text-gray-400 flex items-center">پیشنهادی:</span>
                    {['وزن', 'ابعاد', 'جنس', 'کشور سازنده', 'گارانتی'].map(preset => (
                        <button 
                            key={preset}
                            type="button"
                            onClick={() => addPresetSpec(preset)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-blue-100"
                        >
                            + {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Pricing & Inventory */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign size={20} className="text-green-500" />
                        قیمت‌گذاری و تنوع
                    </h3>
                    
                    {/* Variable Product Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button 
                            type="button"
                            onClick={() => setIsVariable(false)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isVariable ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                        >
                            ساده
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsVariable(true)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isVariable ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                        >
                            چند متغیره
                        </button>
                    </div>
                 </div>
                
                {!isVariable ? (
                    // SIMPLE PRODUCT MODE
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div className="relative">
                            <label className={labelClass}>قیمت نهایی (تومان) <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                className={`${inputClass} font-bold text-gray-800`}
                                value={formData.price || ''}
                                onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                                required={!isVariable}
                            />
                            {formData.price ? (
                                <div className="absolute top-full left-0 mt-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                                    {toPersianDigits(formatNumberInput(formData.price))} تومان
                                </div>
                            ) : null}
                        </div>

                        <div className="relative">
                            <label className={labelClass}>قیمت اصلی (خط خورده)</label>
                            <input 
                                type="number" 
                                className={inputClass}
                                value={formData.original_price || ''}
                                onChange={e => setFormData({...formData, original_price: parseInt(e.target.value)})}
                            />
                            {formData.original_price ? (
                                <div className="absolute top-full left-0 mt-1 text-xs text-gray-400 font-bold">
                                    {toPersianDigits(formatNumberInput(formData.original_price))}
                                </div>
                            ) : null}
                        </div>

                        {discountPercent > 0 && (
                            <div className="md:col-span-2 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                                <div className="bg-[#ef394e] text-white p-2 rounded-lg">
                                    <Percent size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#ef394e]">{discountPercent}% تخفیف محاسبه شده</p>
                                    <p className="text-[10px] text-gray-500">این محصول با نشان "فروش ویژه" نمایش داده خواهد شد.</p>
                                </div>
                            </div>
                        )}

                        <div className="h-[1px] bg-gray-100 w-full md:col-span-2 my-2"></div>

                        <div>
                            <label className={labelClass}>موجودی انبار</label>
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-100 p-3 rounded-xl text-gray-500">
                                    <Package size={20} />
                                </div>
                                <input 
                                    type="number" 
                                    className={`${inputClass} text-center font-bold`}
                                    value={formData.stock_count || ''}
                                    onChange={e => setFormData({...formData, stock_count: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // VARIABLE PRODUCT MODE
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex gap-3 items-start">
                            <Split size={20} className="text-blue-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm text-blue-800">مدیریت تنوع (Variants)</h4>
                                <p className="text-xs text-blue-600 leading-5 mt-1">
                                    در این بخش می‌توانید برای ویژگی‌های مختلف (مثل رنگ، سایز، گارانتی) قیمت و موجودی جداگانه تعریف کنید.
                                    قیمت محصول در فروشگاه از کمترین قیمت تنوع‌ها نمایش داده می‌شود.
                                </p>
                            </div>
                        </div>

                        {/* Variants Table */}
                        {variants.length > 0 && (
                            <div className="overflow-hidden border border-gray-200 rounded-xl mb-4 bg-gray-50">
                                <table className="w-full text-right">
                                    <thead className="bg-gray-100 text-xs font-bold text-gray-500 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3">نام تنوع</th>
                                            <th className="p-3">قیمت</th>
                                            <th className="p-3">موجودی</th>
                                            <th className="p-3">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {variants.map((v, idx) => (
                                            <tr key={idx} className="bg-white">
                                                <td className="p-3 font-bold">{v.name}</td>
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span>{toPersianDigits(v.price.toLocaleString())}</span>
                                                        {v.original_price && v.original_price > v.price && (
                                                            <span className="text-[10px] text-gray-400 line-through decoration-red-400">
                                                                {toPersianDigits(v.original_price.toLocaleString())}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">{toPersianDigits(v.stock)}</td>
                                                <td className="p-3">
                                                    <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Add Variant Form */}
                        <div className="grid grid-cols-12 gap-3 bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 items-end hover:border-blue-200 transition-colors">
                            <div className="col-span-12 md:col-span-4">
                                <label className={labelClass}>نام تنوع <span className="text-gray-400 font-normal">(قرمز / 256GB)</span></label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                                    placeholder="نام ویژگی..."
                                    value={newVariant.name}
                                    onChange={e => setNewVariant({...newVariant, name: e.target.value})}
                                />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <label className={labelClass}>قیمت</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                                    placeholder="تومان"
                                    value={newVariant.price}
                                    onChange={e => setNewVariant({...newVariant, price: e.target.value})}
                                />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <label className={labelClass}>موجودی</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                                    placeholder="تعداد"
                                    value={newVariant.stock}
                                    onChange={e => setNewVariant({...newVariant, stock: e.target.value})}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <button 
                                    type="button" 
                                    onClick={addVariant}
                                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-black transition-colors flex justify-center items-center gap-1 shadow-md h-[34px]"
                                >
                                    <Plus size={14} /> افزودن
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Global Flags */}
                <div className="flex items-center justify-start gap-4 pt-6 border-t border-gray-50 mt-4">
                     <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors w-full" onClick={() => setFormData({...formData, is_amazing: !formData.is_amazing})}>
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.is_amazing ? 'bg-[#ef394e] border-[#ef394e]' : 'border-gray-300 bg-white'}`}>
                             {formData.is_amazing && <Check size={14} className="text-white" />}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 select-none">پیشنهاد شگفت‌انگیز</span>
                            <span className="text-[10px] text-gray-500">نمایش در بخش تخفیف‌های ویژه</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Media & Categorization */}
        <div className="space-y-6">
            
            {/* 4. Media Upload */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm border-b border-gray-50 pb-3">
                    <ImageIcon size={18} className="text-blue-500" />
                    تصویر محصول
                </h3>
                
                {/* Preview Area */}
                <div className="mb-4">
                    {previewUrl ? (
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm">
                            <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">تغییر تصویر</p>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#ef394e] hover:bg-red-50 transition-all flex flex-col items-center justify-center text-gray-400 group cursor-pointer">
                            <UploadCloud size={40} className="mb-2 group-hover:text-[#ef394e] transition-colors" />
                            <span className="text-xs font-bold text-gray-500 group-hover:text-[#ef394e]">آپلود تصویر</span>
                            <span className="text-[10px] mt-1 text-gray-400">PNG, JPG (Max 2MB)</span>
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                {/* URL Input Fallback */}
                <div>
                     <label className="block text-[10px] font-bold text-gray-500 mb-1">یا لینک مستقیم وارد کنید:</label>
                     <input 
                        type="text" 
                        dir="ltr"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ef394e] transition-colors"
                        value={formData.image_url || ''}
                        onChange={e => {
                            setFormData({...formData, image_url: e.target.value});
                            if(e.target.value) setPreviewUrl(e.target.value);
                        }}
                        placeholder="https://..."
                     />
                </div>
            </div>

            {/* 5. Categorization */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm border-b border-gray-50 pb-3">
                    <Package size={18} className="text-orange-500" />
                    دسته‌بندی <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-3">
                    <label className={labelClass}>انتخاب دسته</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {categories.map(c => (
                            <div 
                                key={c.id}
                                onClick={() => setFormData({...formData, category: c.name})}
                                className={`cursor-pointer px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all border flex items-center justify-center gap-1 ${
                                    formData.category === c.name 
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {c.icon && <span>{c.icon}</span>}
                                {c.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </form>
    </div>
  );
};

export default ProductManager;
