/**
 * General constants
 */
export const enum ROLES {
    ALL = "All",
    ADMIN = "ADMIN",
    STAFF = "STAFF",
    CHECKER = "CHECKER",
    VERIFIER = "VERIFIER",
    APPROVER = "APPROVER",
    EXTERNAL = "EXTERNAL"
}

export const enum ENT_ROLES {
    AGENT = "AGENT",
    NORMAL = "NORMAL",
}

export const enum COUNTER {
    INVOICE_NUMBER = "invoice_number",
    REGISTRATION_ID = "registration_id",
    NAME_RESERVATION_ID = "name_reservation_id",
    CERT_ID = "cert_id",
    CERT_NO = "cert_no"
}

export const enum CONFIG {
    APP_URL = "app_url",
    CHANKITEK = "chankitek",
    ENCRYPT = "encrypt",
    MAIL = "email_config",
    INVOICE_CODE = "invoice_code",
    ABA_CONFIG = "aba_config"
}

export const enum MAIL {
    HOST = "email_host",
    PORT = "email_port",
    USER = "email_user",
    PASSWORD = "email_password"
}

export const enum LANGUAGE {
    KHMER = "KHMER",
    ENGLISH = "ENGLISH"
}

export const enum AUTH_APPS {
    ALL = "All",
    ABA = "ABA"
}

export const enum STATUS {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    CONFIRMED = "CONFIRMED",
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    APPROVED = "APPROVED",
    REVIEWING = "REVIEWING",
    REJECTED = "REJECTED",
    RETURNED = "RETURNED",
    ALLOCATE = "ALLOCATE",
    ASSIGN = "ASSIGN",
    SUSPENDED = "SUSPENDED",
    REOPENED = "REOPENED",
    CLOSED = "CLOSED",
    DENIED = "DENIED"
}

export const enum UTIL_STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export const enum PAYMENT_ITEM_TYPE {
    CONTRIBUTE = "CONTRIBUTE",
    PENALTY = "PENALTY"
}

export const enum PENALTY_TYPE {
    DOC_SUBMISSION = "DOC_SUBMISSION",
    CONTRIBUTE_PAYMENT = "CONTRIBUTE_PAYMENT",
    INTEREST = "INTEREST"
}

export const enum BANK {
    ABA = "ABA"
}

export const enum PAYMENT_STATUS {
    PAID = "PAID",
    UNPAID = "UNPAID"
}

export const enum CURRENCY {
    KHR = "KHR",
    USD = "USD",
    VND = "VND",
    THB = "THB"
}

export const enum HISTORY_TYPE {
    RECEIPT = "RECEIPT"
}

/**
 * For beneficiary
 */
export const enum BEN_DOC_TYPE {
    PHOTO = "photo",
    ID_CARD = "photo_id_card"
}

export const enum REQ_TYPE {
    CREATE = "CREATE",
    UPDATE = "UPDATE"
}

export const enum BEN_TRACK_CODE { // code in old system
    PHOTO = "PHOTO", // 2
    IDCARD = "IDCARD", // 3
    PHOTO_IDCARD = "PHOTO_IDCARD", // 1
    DENIED = "DENIED" // 4
}

export const enum GENDER {
    MALE = "M",
    FEMALE = "F"
}

export const enum BEN_DETAIL_STATUS {
    VALID = "VALID",
    INVALID = "INVALID",
    NOT_FOUND = "NOT_FOUND",
    BANNED = "BANNED",
    NOT_ALLOW_TO_PAY = "NOT_ALLOW_TO_PAY"
}

/**
 * For enterprise
 */
export const enum UPDATE_TYPE {
    ENT_NAME = "ENT_NAME",
    ENT_OWNER = "ENT_OWNER",
    ENT_HEAD_ADDRESS = "ENT_HEAD_ADDRESS",
    ENT_OFFICE_ADDRESS = "ENT_OFFICE_ADDRESS",
    ENT_REP = "ENT_REP",
    ENT_PROFILE = "ENT_PROFILE",
}

export const enum APP_TYPE {
    IN = "IN",
    OUT = "OUT"
}

export const enum PERSON_TYPE {
    OWNER = "OWNER",
    MANAGER = "MANAGER",
    REPRESENTATIVE = "REPRESENTATIVE"
}

export const enum FEE_TYPE {
    HC = "hc",
    WI = "wi",
    PS = "ps"
}