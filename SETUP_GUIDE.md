# Phase 1 Setup Guide - Authentication & Payment

This guide will walk you through setting up the authentication and payment infrastructure.

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project (if not already done)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (~2 minutes)

### 1.2 Run Database Schema
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `supabase_schema.sql`
5. Paste and click **Run**
6. Verify tables were created successfully

### 1.3 Get Your Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxx.supabase.co`)
3. Copy your **anon/public** key
4. Keep these for the next step

---

## Step 2: Configure Environment Variables

### 2.1 Create `.env` File
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

### 2.2 Fill in Supabase Credentials
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Choose Payment Gateway

**For Iran (Recommended):**
```env
VITE_PAYMENT_GATEWAY=zarinpal
VITE_PAYMENT_SANDBOX=true
VITE_ZARINPAL_MERCHANT_ID=your-merchant-id
```

**To get ZarinPal Merchant ID:**
1. Go to [zarinpal.com](https://www.zarinpal.com)
2. Sign up for an account
3. Go to Dashboard → Merchant ID
4. Copy your Merchant ID
5. For testing, use sandbox mode: `VITE_PAYMENT_SANDBOX=true`

**Alternative: IDPay**
```env
VITE_PAYMENT_GATEWAY=idpay
VITE_PAYMENT_SANDBOX=true
VITE_IDPAY_API_KEY=your-api-key
```

---

## Step 3: Create Your Admin Account

### 3.1 Sign Up Through the App
1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:5173/#/signup`
3. Create your account with your email and password
4. You'll be automatically logged in

### 3.2 Make Yourself Admin
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user and copy the **User ID** (UUID)
3. Go to **SQL Editor** and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-ID-HERE';
   ```
4. Verify:
   ```sql
   SELECT * FROM profiles WHERE role = 'admin';
   ```

---

## Step 4: Test Authentication

### 4.1 Test Login
1. Go to `http://localhost:5173/#/login`
2. Enter your credentials
3. You should be redirected to the shop

### 4.2 Test Protected Route
1. Log out (if you have a logout button)
2. Try to access `http://localhost:5173/#/checkout`
3. You should be redirected to login
4. Log in and you should reach checkout

### 4.3 Test Signup
1. Create a new account with a different email
2. Verify it appears in Supabase → Authentication → Users

---

## Step 5: Test Payment Flow (Sandbox)

### 5.1 Add Items to Cart
1. Browse the shop
2. Add products to cart
3. Go to cart and click "Checkout"

### 5.2 Fill Checkout Form
1. Enter your details (name, phone, address)
2. Click "Continue to Payment"

### 5.3 Test Payment (Currently Simulated)
- The payment integration is ready but needs the next phase
- For now, it will show a 2-second delay
- Next step: We'll integrate the actual payment gateway

---

## Step 6: Verify Everything Works

### Checklist
- [ ] Supabase tables created (profiles, orders)
- [ ] Environment variables configured
- [ ] Can sign up new users
- [ ] Can log in
- [ ] Protected routes redirect to login
- [ ] Admin account created
- [ ] No TypeScript errors in console

---

## Common Issues & Solutions

### Issue: "Property 'env' does not exist on type 'ImportMeta'"
**Solution:** Make sure `vite-env.d.ts` exists in your project root.

### Issue: "Invalid login credentials"
**Solution:** 
- Check your email/password
- Verify user exists in Supabase → Authentication → Users
- Try resetting password

### Issue: "Failed to fetch" when signing up
**Solution:**
- Check your Supabase URL and anon key
- Verify your internet connection
- Check Supabase project is active

### Issue: Can't access admin panel
**Solution:**
- Verify your user has `role = 'admin'` in profiles table
- Log out and log back in
- Check browser console for errors

---

## Next Steps

Once everything is working:
1. ✅ Authentication is complete
2. ✅ Protected routes are working
3. ⏭️ Next: Integrate real payment gateway
4. ⏭️ Next: Update checkout to save orders to database
5. ⏭️ Next: Create order history page

---

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify environment variables are loaded
4. Try clearing browser cache and localStorage

**Ready to continue? Let me know and we'll move to the next phase!**
