/* =========================================================
   AREES LOOP — CORE DATA TYPES
   Central TypeScript definitions for the platform
   ========================================================= */

/* =========================
   COMMON
   ========================= */

export type ID = string;

export type Currency = "SAR";

export type RecordStatus =
  | "active"
  | "inactive"
  | "pending"
  | "suspended"
  | "archived";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

/* =========================
   USERS & ACCESS
   ========================= */

export type UserRole =
  | "customer"
  | "partner_owner"
  | "partner_admin"
  | "partner_operations"
  | "partner_finance"
  | "partner_viewer"
  | "admin"
  | "super_admin";

export interface User extends TimestampedEntity {
  id: ID;

  firstName: string;
  lastName: string;

  email?: string;
  phone: string;

  avatarUrl?: string;

  role: UserRole;

  status: RecordStatus;
  verificationStatus: VerificationStatus;

  lastLoginAt?: string;
}

/* =========================
   PARTNER
   ========================= */

export type PartnerCapability =
  | "service_provider"
  | "loyalty_earn"
  | "loyalty_redeem";

export type PartnerApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "preliminary_approved"
  | "awaiting_agreement"
  | "awaiting_final_approval"
  | "approved"
  | "rejected"
  | "suspended";

export type PartnerCategory =
  | "tourism_experience"
  | "tourism_destination"
  | "travel_agency"
  | "travel_services"
  | "tour_organizer"
  | "hospitality_booking"
  | "tour_guide"
  | "restaurant_cafe"
  | "transport_services"
  | "visitor_retail"
  | "loyalty_partner"
  | "other";

export interface Partner extends TimestampedEntity {
  id: ID;

  applicationNumber?: string;

  tradeNameAr: string;
  tradeNameEn?: string;

  legalNameAr: string;
  legalNameEn?: string;

  descriptionAr?: string;
  descriptionEn?: string;

  logoUrl?: string;
  websiteUrl?: string;

  categories: PartnerCategory[];
  capabilities: PartnerCapability[];

  unifiedNumber?: string;
  commercialRegistrationNumber?: string;
  vatRegistrationNumber?: string;

  city?: string;
  country: string;

  status: RecordStatus;
  verificationStatus: VerificationStatus;
  applicationStatus: PartnerApplicationStatus;

  areesLoopCommissionRate?: number;

  loyaltyEnabled: boolean;
}

/* =========================
   PARTNER TEAM
   ========================= */

export type PartnerPermission =
  | "bookings.view"
  | "bookings.manage"
  | "services.view"
  | "services.manage"
  | "invoices.view"
  | "settlements.view"
  | "reports.view"
  | "team.view"
  | "team.manage"
  | "partner_profile.view"
  | "partner_profile.manage"
  | "agreement.view"
  | "rewards.view"
  | "rewards.manage";

export interface PartnerTeamMember extends TimestampedEntity {
  id: ID;

  partnerId: ID;
  userId: ID;

  jobTitle: string;

  permissions: PartnerPermission[];

  status: RecordStatus;
}

/* =========================
   SERVICES / EXPERIENCES
   ========================= */

export type ServiceStatus =
  | "draft"
  | "under_review"
  | "active"
  | "paused"
  | "rejected"
  | "archived";

export interface Service extends TimestampedEntity {
  id: ID;

  partnerId: ID;

  nameAr: string;
  nameEn?: string;

  descriptionAr: string;
  descriptionEn?: string;

  category: PartnerCategory;

  city: string;
  locationName?: string;

  coverImageUrl?: string;
  galleryUrls?: string[];

  basePrice: number;
  currency: Currency;

  vatRate: number;

  status: ServiceStatus;

  loyaltyEarnEnabled: boolean;
  loyaltyRedeemEnabled: boolean;

  pointsEarnedPerBooking?: number;
}

/* =========================
   BOOKINGS
   ========================= */

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "ready"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export interface Booking extends TimestampedEntity {
  id: ID;

  bookingNumber: string;

  customerId: ID;
  partnerId: ID;
  serviceId: ID;

  bookingDate: string;
  serviceDate: string;

  quantity: number;

  subtotal: number;
  vatAmount: number;
  totalAmount: number;

  currency: Currency;

  status: BookingStatus;

  paymentId?: ID;
  invoiceId?: ID;

  qrCode?: string;

  pointsEarned?: number;
  pointsRedeemed?: number;
}

/* =========================
   PAYMENTS
   ========================= */

export type PaymentMethod =
  | "mada"
  | "visa"
  | "mastercard"
  | "apple_pay"
  | "stc_pay"
  | "loop_points"
  | "other";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "partially_refunded"
  | "refunded";

export interface Payment extends TimestampedEntity {
  id: ID;

  bookingId: ID;
  customerId: ID;

  paymentReference: string;

  method: PaymentMethod;
  status: PaymentStatus;

  amount: number;
  currency: Currency;

  paidAt?: string;
}

/* =========================
   TAX INVOICES
   ========================= */

export interface InvoiceItem {
  id: ID;

  serviceId?: ID;

  descriptionAr: string;
  descriptionEn?: string;

  quantity: number;

  unitPriceExcludingVat: number;

  vatRate: number;
  vatAmount: number;

  totalIncludingVat: number;
}

export interface TaxInvoice extends TimestampedEntity {
  id: ID;

  invoiceNumber: string;

  bookingId: ID;
  paymentId?: ID;

  partnerId: ID;
  customerId: ID;

  issueDate: string;
  supplyDate: string;

  items: InvoiceItem[];

  subtotalExcludingVat: number;
  vatAmount: number;
  totalIncludingVat: number;

  currency: Currency;

  qrCodeData?: string;

  pdfUrl?: string;
}

/* =========================
   SETTLEMENTS
   ========================= */

export type SettlementStatus =
  | "pending"
  | "scheduled"
  | "processing"
  | "paid"
  | "failed"
  | "on_hold";

export interface Settlement extends TimestampedEntity {
  id: ID;

  settlementNumber: string;

  partnerId: ID;

  periodStart: string;
  periodEnd: string;

  grossSales: number;

  areesLoopCommission: number;
  paymentProcessingFees: number;
  transferFees: number;

  refunds: number;
  adjustments: number;

  netPayable: number;

  currency: Currency;

  status: SettlementStatus;

  scheduledPaymentDate?: string;
  paidAt?: string;
}

/* =========================
   REWARDS / LOOP POINTS
   ========================= */

export type RewardTransactionType =
  | "earn"
  | "redeem"
  | "expire"
  | "refund"
  | "adjustment"
  | "bonus";

export type RewardFundingSource =
  | "arees_loop"
  | "partner"
  | "sponsor";

export interface RewardTransaction extends TimestampedEntity {
  id: ID;

  customerId: ID;

  partnerId?: ID;
  bookingId?: ID;

  type: RewardTransactionType;

  points: number;

  fundingSource: RewardFundingSource;

  descriptionAr: string;
  descriptionEn?: string;

  expiresAt?: string;
}

export interface RewardsWallet extends TimestampedEntity {
  id: ID;

  customerId: ID;

  availablePoints: number;
  pendingPoints: number;
  lifetimeEarnedPoints: number;
  lifetimeRedeemedPoints: number;
}

/* =========================
   REWARD CATALOG
   ========================= */

export type RewardType =
  | "discount"
  | "free_service"
  | "voucher"
  | "partner_reward";

export interface RewardCatalogItem extends TimestampedEntity {
  id: ID;

  partnerId?: ID;

  titleAr: string;
  titleEn?: string;

  descriptionAr?: string;
  descriptionEn?: string;

  rewardType: RewardType;

  requiredPoints: number;

  status: RecordStatus;

  validFrom?: string;
  validUntil?: string;
}

/* =========================
   LOYALTY PARTNER SETTINGS
   ========================= */

export interface LoyaltySettings extends TimestampedEntity {
  id: ID;

  partnerId: ID;

  earnEnabled: boolean;
  redeemEnabled: boolean;

  minimumRedemptionPoints?: number;

  pointsPerEligibleRiyal?: number;

  maximumRedemptionPercentage?: number;

  fundingSource: RewardFundingSource;

  status: RecordStatus;
}

/* =========================
   AUDIT LOG
   ========================= */

export interface AuditLog extends TimestampedEntity {
  id: ID;

  userId?: ID;
  partnerId?: ID;

  action: string;
  entityType: string;
  entityId?: ID;

  ipAddress?: string;
  userAgent?: string;

  metadata?: Record<string, unknown>;
}