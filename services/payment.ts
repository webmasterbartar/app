/**
 * Payment Service Layer
 * Supports multiple payment gateways for Iranian market
 */

export type PaymentGateway = 'zarinpal' | 'idpay' | 'zibal';

interface PaymentRequest {
    amount: number; // In Toman
    orderId: string;
    description?: string;
    email?: string;
    mobile?: string;
}

interface PaymentResponse {
    success: boolean;
    authority?: string; // Payment token
    paymentUrl?: string;
    error?: string;
}

interface VerificationResponse {
    success: boolean;
    refId?: string;
    cardPan?: string;
    error?: string;
}

/**
 * ZarinPal Payment Gateway
 * Docs: https://docs.zarinpal.com/paymentGateway/
 */
class ZarinPalGateway {
    private merchantId: string;
    private sandbox: boolean;

    constructor() {
        this.merchantId = import.meta.env.VITE_ZARINPAL_MERCHANT_ID || '';
        this.sandbox = import.meta.env.VITE_PAYMENT_SANDBOX === 'true';
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const baseUrl = this.sandbox
                ? 'https://sandbox.zarinpal.com/pg/v4/payment'
                : 'https://api.zarinpal.com/pg/v4/payment';

            const response = await fetch(`${baseUrl}/request.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    amount: request.amount * 10, // Convert Toman to Rial
                    callback_url: `${window.location.origin}/payment/verify`,
                    description: request.description || `سفارش ${request.orderId}`,
                    metadata: {
                        email: request.email || '',
                        mobile: request.mobile || '',
                        order_id: request.orderId
                    }
                })
            });

            const data = await response.json();

            if (data.data && data.data.code === 100) {
                const authority = data.data.authority;
                const paymentUrl = this.sandbox
                    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
                    : `https://www.zarinpal.com/pg/StartPay/${authority}`;

                return {
                    success: true,
                    authority,
                    paymentUrl
                };
            }

            return {
                success: false,
                error: data.errors?.message || 'خطا در ایجاد درخواست پرداخت'
            };
        } catch (error) {
            console.error('ZarinPal payment error:', error);
            return {
                success: false,
                error: 'خطا در برقراری ارتباط با درگاه پرداخت'
            };
        }
    }

    async verifyPayment(authority: string, amount: number): Promise<VerificationResponse> {
        try {
            const baseUrl = this.sandbox
                ? 'https://sandbox.zarinpal.com/pg/v4/payment'
                : 'https://api.zarinpal.com/pg/v4/payment';

            const response = await fetch(`${baseUrl}/verify.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_id: this.merchantId,
                    amount: amount * 10, // Convert Toman to Rial
                    authority
                })
            });

            const data = await response.json();

            if (data.data && data.data.code === 100) {
                return {
                    success: true,
                    refId: data.data.ref_id.toString(),
                    cardPan: data.data.card_pan
                };
            }

            return {
                success: false,
                error: this.getErrorMessage(data.data?.code)
            };
        } catch (error) {
            console.error('ZarinPal verification error:', error);
            return {
                success: false,
                error: 'خطا در تایید پرداخت'
            };
        }
    }

    private getErrorMessage(code: number): string {
        const errors: Record<number, string> = {
            101: 'تراکنش وریفای شده است',
            '-9': 'خطای اعتبار سنجی',
            '-10': 'آی پی و یا مرچنت کد پذیرنده صحیح نیست',
            '-11': 'مرچنت کد فعال نیست',
            '-12': 'تلاش بیش از حد در یک بازه زمانی کوتاه',
            '-15': 'ترمینال شما به حالت تعلیق در آمده',
            '-16': 'سطح تایید پذیرنده پایین تر از سطح نقره ای است'
        };
        return errors[code] || 'خطای نامشخص در پرداخت';
    }
}

/**
 * IDPay Payment Gateway
 * Docs: https://idpay.ir/web-service/v1.1
 */
class IDPayGateway {
    private apiKey: string;
    private sandbox: boolean;

    constructor() {
        this.apiKey = import.meta.env.VITE_IDPAY_API_KEY || '';
        this.sandbox = import.meta.env.VITE_PAYMENT_SANDBOX === 'true';
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await fetch('https://api.idpay.ir/v1.1/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': this.apiKey,
                    'X-SANDBOX': this.sandbox ? '1' : '0'
                },
                body: JSON.stringify({
                    order_id: request.orderId,
                    amount: request.amount * 10, // Convert Toman to Rial
                    callback: `${window.location.origin}/payment/verify`,
                    desc: request.description || `سفارش ${request.orderId}`,
                    mail: request.email,
                    phone: request.mobile
                })
            });

            const data = await response.json();

            if (response.ok && data.id && data.link) {
                return {
                    success: true,
                    authority: data.id,
                    paymentUrl: data.link
                };
            }

            return {
                success: false,
                error: data.error_message || 'خطا در ایجاد درخواست پرداخت'
            };
        } catch (error) {
            console.error('IDPay payment error:', error);
            return {
                success: false,
                error: 'خطا در برقراری ارتباط با درگاه پرداخت'
            };
        }
    }

    async verifyPayment(authority: string, orderId: string): Promise<VerificationResponse> {
        try {
            const response = await fetch('https://api.idpay.ir/v1.1/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': this.apiKey,
                    'X-SANDBOX': this.sandbox ? '1' : '0'
                },
                body: JSON.stringify({
                    id: authority,
                    order_id: orderId
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 100) {
                return {
                    success: true,
                    refId: data.track_id.toString(),
                    cardPan: data.payment?.card_no
                };
            }

            return {
                success: false,
                error: data.error_message || 'خطا در تایید پرداخت'
            };
        } catch (error) {
            console.error('IDPay verification error:', error);
            return {
                success: false,
                error: 'خطا در تایید پرداخت'
            };
        }
    }
}

/**
 * Payment Service - Main Interface
 */
class PaymentService {
    private gateway: ZarinPalGateway | IDPayGateway;
    private gatewayType: PaymentGateway;

    constructor(gatewayType: PaymentGateway = 'zarinpal') {
        this.gatewayType = gatewayType;

        switch (gatewayType) {
            case 'zarinpal':
                this.gateway = new ZarinPalGateway();
                break;
            case 'idpay':
                this.gateway = new IDPayGateway();
                break;
            default:
                this.gateway = new ZarinPalGateway();
        }
    }

    async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
        return this.gateway.createPayment(request);
    }

    async verifyPayment(authority: string, amount: number, orderId?: string): Promise<VerificationResponse> {
        if (this.gatewayType === 'idpay' && orderId) {
            return (this.gateway as IDPayGateway).verifyPayment(authority, orderId);
        }
        return (this.gateway as ZarinPalGateway).verifyPayment(authority, amount);
    }
}

// Export singleton instance
const gatewayType = (import.meta.env.VITE_PAYMENT_GATEWAY as PaymentGateway) || 'zarinpal';
export const paymentService = new PaymentService(gatewayType);
