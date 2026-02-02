/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_PAYMENT_GATEWAY: 'zarinpal' | 'idpay' | 'zibal'
    readonly VITE_PAYMENT_SANDBOX: string
    readonly VITE_ZARINPAL_MERCHANT_ID: string
    readonly VITE_IDPAY_API_KEY: string
    readonly VITE_GA_MEASUREMENT_ID: string
    readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
