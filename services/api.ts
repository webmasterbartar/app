import { supabase } from '../lib/supabase';
import { Product, Post, BlogPost } from '../db';
import { Type } from '@google/genai';

// Helper to handle network errors specifically
const handleApiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);

  const msg = error.message || '';
  // Check for common network error strings
  if (
    msg === 'Failed to fetch' ||
    msg.includes('NetworkError') ||
    msg.includes('connection')
  ) {
    throw new Error("خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت یا فیلترشکن (VPN) خود را بررسی کنید.");
  }

  throw error;
};

/**
 * API SERVICE LAYER
 * Acts as the bridge between Frontend and Supabase (PostgreSQL)
 */

export const api = {
  // --- CATEGORIES ---
  categories: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (err) {
        handleApiError(err, 'categories.getAll');
        return [];
      }
    }
  },

  // --- PRODUCTS ---
  products: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        return data as Product[];
      } catch (err) {
        handleApiError(err, 'products.getAll');
        return [];
      }
    },

    async getById(id: number) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },

    async create(product: Partial<Product>) {
      // Remove id if it exists and is falsy/0
      const { id, ...productData } = product;

      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        return data as Product;
      } catch (err) {
        handleApiError(err, 'products.create');
      }
    },

    async update(id: number, updates: Partial<Product>) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as Product;
      } catch (err) {
        handleApiError(err, 'products.update');
      }
    },

    async delete(id: number) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async uploadImage(file: File) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (!data || !data.publicUrl) {
          throw new Error("تصویر آپلود شد اما لینک دریافت نشد.");
        }

        return data.publicUrl;
      } catch (err) {
        handleApiError(err, 'uploadImage');
        return '';
      }
    }
  },

  // --- ORDERS ---
  orders: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (err) {
        handleApiError(err, 'orders.getAll');
        return [];
      }
    },

    async updateStatus(id: number, status: 'pending' | 'shipped' | 'cancelled') {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getStats() {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('total_price, status, created_at');

        if (error) throw error;

        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
        const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders?.filter(o => o.created_at?.startsWith(today)).length || 0;

        return { totalRevenue, pendingOrders, todayOrders };
      } catch (err) {
        console.error("Error fetching stats:", err);
        return { totalRevenue: 0, pendingOrders: 0, todayOrders: 0 };
      }
    }
  },

  // --- SOCIAL (REELS/STORIES) ---
  social: {
    async getReels() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Post[];
      } catch (err) {
        console.error(err);
        return [];
      }
    },

    async createReel(reelData: Partial<Post>) {
      const { id, ...dataToInsert } = reelData;
      const { data, error } = await supabase.from('posts').insert(dataToInsert).select().single();
      if (error) throw error;
      return data;
    },

    async deleteReel(id: number) {
      await supabase.from('posts').delete().eq('id', id);
    },

    async getProfile() {
      // Mock for now or create table if needed
      return { name: "DigiGram Store", bio: "Best Tech Store" };
    },

    async updateProfile(updates: any) {
      // Placeholder
    }
  },

  // --- COMMENTS ---
  comments: {
    async getPending() {
      // Return empty if table not exists yet
      return [];
    },

    async approve(id: number) {
      // Placeholder
    },

    async delete(id: number) {
      // Placeholder
    }
  },

  // --- BLOGS ---
  blogs: {
    async getAll() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as BlogPost[];
      } catch (err) {
        handleApiError(err, 'blogs.getAll');
        return [];
      }
    },

    async create(blogData: Partial<BlogPost>) {
      const { id, ...dataToInsert } = blogData;
      const { data, error } = await supabase.from('blogs').insert([dataToInsert]).select().single();
      if (error) throw error;
      return data;
    },

    async update(id: number, updates: Partial<BlogPost>) {
      const { error } = await supabase.from('blogs').update(updates).eq('id', id);
      if (error) throw error;
    },

    async delete(id: number) {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
