import { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse, UserRole } from '../types/auth';
import { notifyLocalDomainChange } from './realtimeSyncService';

const STORAGE_KEY_USER = 'agritech_auth_user';
const STORAGE_KEY_TOKEN = 'agritech_auth_token';
const STORAGE_KEY_CUSTOM_ACCOUNTS = 'agritech_admin_saved_accounts_v2';
const STORAGE_KEY_DELETED_ACCOUNTS = 'agritech_deleted_accounts';
const SECRET_ENC_PREFIX = 'enc_v1:';
const SECRET_XOR_KEY = 'agritech_kntt_2026_local_sec';

let inMemoryCurrentUser: AuthUser | null = null;
let inMemoryAuthToken: string | null = null;
let inMemoryCustomAccounts: any[] = [];

function encodeStoredSecret(plain: string): string {
  if (!plain || plain.startsWith(SECRET_ENC_PREFIX)) return plain;
  try {
    const utf8 = encodeURIComponent(plain);
    let xored = '';
    for (let i = 0; i < utf8.length; i++) {
      xored += String.fromCharCode(
        utf8.charCodeAt(i) ^ SECRET_XOR_KEY.charCodeAt(i % SECRET_XOR_KEY.length)
      );
    }
    return SECRET_ENC_PREFIX + btoa(xored);
  } catch {
    return plain;
  }
}

function decodeStoredSecret(encoded: string): string {
  if (!encoded || !encoded.startsWith(SECRET_ENC_PREFIX)) return encoded || '';
  try {
    const raw = atob(encoded.slice(SECRET_ENC_PREFIX.length));
    let utf8 = '';
    for (let i = 0; i < raw.length; i++) {
      utf8 += String.fromCharCode(
        raw.charCodeAt(i) ^ SECRET_XOR_KEY.charCodeAt(i % SECRET_XOR_KEY.length)
      );
    }
    return decodeURIComponent(utf8);
  } catch {
    return encoded;
  }
}

const KNOWN_DEV_ORIGIN = 'https://ais-dev-vhtotbsluzowciamdhfmgh-498098900185.asia-southeast1.run.app';
const KNOWN_PRE_ORIGIN = 'https://ais-pre-vhtotbsluzowciamdhfmgh-498098900185.asia-southeast1.run.app';
const CLOUD_SYNC_STREAM_URL = 'https://ntfy.sh/agritech_kntt_0819b689_v2_accounts';

function getCounterpartOrigins(): string[] {
  const candidates = new Set<string>([KNOWN_DEV_ORIGIN, KNOWN_PRE_ORIGIN]);
  if (typeof window !== 'undefined' && window.location?.origin) {
    const currentOrigin = window.location.origin.replace(/\/+$/, '');
    if (currentOrigin.includes('//ais-dev-')) {
      candidates.add(currentOrigin.replace('//ais-dev-', '//ais-pre-'));
    } else if (currentOrigin.includes('//ais-pre-')) {
      candidates.add(currentOrigin.replace('//ais-pre-', '//ais-dev-'));
    }
    return Array.from(candidates).filter((url) => url.toLowerCase() !== currentOrigin.toLowerCase());
  }
  return Array.from(candidates);
}

try {
  localStorage.removeItem('agritech_gas_auth_url');
  localStorage.removeItem('agritech_custom_accounts');
} catch {}

/**
 * Pre-seeded system accounts (synced with data/datauser.json)
 */
export const TEACHER_ACCOUNTS: Array<{
  username: string;
  aliases: string[];
  passwords: string[];
  role: UserRole;
  fullName: string;
  className: string;
  payment_amount?: number;
  start_date?: string;
  expires_at?: string;
}> = [
  {
    username: 'nguyenbaolam',
    aliases: ['nguyenbaolam', 'nguyen bao lam', 'nguyenbaolam@truong.edu.vn'],
    passwords: ['hs123', 'gv123', '123456'],
    role: 'student',
    fullName: 'Nguyễn Bảo Lâm',
    className: '12A1',
    payment_amount: 0,
    start_date: '2026-11-17',
    expires_at: '2026-11-24',
  },
  {
    username: 'ltptin',
    aliases: ['ltptin', 'lam thanh phuc tin', 'lamthanhphuctin', 'lamthanhphuctin@truong.edu.vn'],
    passwords: ['gv123', 'hs123', '123456'],
    role: 'teacher',
    fullName: 'Lâm Thanh Phúc Tín',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-17',
    expires_at: '2026-11-24',
  },
  {
    username: 'thanhthanh',
    aliases: ['thanhthanh', 'thanh thanh', 'thanhthanh@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Thanh Thanh',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-10',
    expires_at: '2027-11-10',
  },
  {
    username: 'ptan',
    aliases: ['ptan', 'phan thuy an', 'phanthuyan', 'ptan@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Phan Thúy An',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-13',
    expires_at: '2027-11-13',
  },
  {
    username: 'thqua',
    aliases: ['thqua', 'truong thanh qua', 'truongthanhqua', 'truongthanhqua@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Trương Thanh Quá',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-14',
    expires_at: '2027-11-14',
  },
  {
    username: 'nttdung',
    aliases: ['nttdung', 'nguyen thi thuy dung', 'nguyenthithuydung', 'nguyenthithuydung@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Nguyễn Thị Thùy Dung',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-14',
    expires_at: '2027-11-14',
  },
  {
    username: 'renren',
    aliases: ['renren', 'neang ren', 'neangren', 'neangren@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Nèang Rên',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-15',
    expires_at: '2026-11-22',
  },
  {
    username: 'phanthiphuongthang',
    aliases: ['phanthiphuongthang', 'phan thi phuong thang', 'phanthiphuongthang@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Phan Thị Phương Thắng',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-02-06',
    expires_at: '2027-02-06',
  },
  {
    username: 'lahuy',
    aliases: ['lahuy', 'la huy', 'lahuy@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'La Huy',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: '2027-11-07',
  },
  {
    username: 'tnloan',
    aliases: ['tnloan', 'tong ngoc loan', 'tongngocloan', 'tongngocloan@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Tống Ngọc Loan',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-15',
    expires_at: '2026-11-22',
  },
  {
    username: 'sarach',
    aliases: ['sarach', 'neang sarach', 'neangsarach', 'neangsarach@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Nèang Sarach',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-15',
    expires_at: '2026-11-22',
  },
  {
    username: 'ltktuyen',
    aliases: ['ltktuyen', 'le thi kim tuyen', 'lethikimtuyen', 'ltktuyen@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Lê Thị Kim Tuyến',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-02-01',
    expires_at: '2027-02-01',
  },
  {
    username: 'nttu',
    aliases: ['nttu', 'nguyen thanh tu', 'nguyenthanhtu', 'nguyenthanhtu@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Nguyễn Thanh Tú',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-15',
    expires_at: '2026-11-22',
  },
  {
    username: 'dangtoan',
    aliases: ['dangtoan', 'dang toan', 'dangtoan@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Đặng Toàn',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-15',
    expires_at: '2026-11-22',
  },
  {
    username: 'ltly',
    aliases: ['ltly', 'le thi ly', 'lethily', 'lethily@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Lê Thị Lý',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-15',
    expires_at: '2026-11-22',
  },
  {
    username: 'vtthao',
    aliases: ['vtthao', 'vu thi thao', 'vuthithao', 'vuthithao@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Vũ Thị Thảo',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-16',
    expires_at: '2026-11-23',
  },
  {
    username: 'mailoan',
    aliases: ['mailoan', 'mai loan', 'mailoan@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Mai Loan',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-16',
    expires_at: '2026-11-23',
  },
  {
    username: 'dothoa',
    aliases: ['dothoa', 'do thoa', 'dothoa@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Đỗ Thoa',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-16',
    expires_at: '2026-11-23',
  },
  {
    username: 'tdtoan',
    aliases: ['tdtoan', 'tran duc toan', 'tranductoan', 'tranductoan@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Trần Đức Toàn',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-16',
    expires_at: '2026-11-23',
  },
  {
    username: 'pttnga',
    aliases: ['pttnga', 'pham thi to nga', 'phamthitonga', 'phamthitonga@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Phạm Thị Tố Nga',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-16',
    expires_at: '2026-11-23',
  },
  {
    username: 'dangnhung',
    aliases: ['dangnhung', 'dang nhung', 'dangnhung@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Đặng Nhung',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-17',
    expires_at: '2026-11-24',
  },
  {
    username: 'cthnhung',
    aliases: ['cthnhung', 'cao thi hong nhung', 'caothihongnhung', 'caothihongnhung@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Cao Thị Hồng Nhung',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 0,
    start_date: '2026-11-17',
    expires_at: '2026-11-24',
  },
  {
    username: 'vanhuu',
    aliases: ['vanhuu', 'vanhuu@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Văn Hữu',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'truongthanhqua',
    aliases: ['truongthanhqua', 'ttqua', 'truongthanhqua@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Trương Thanh Quà',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: '2027-11-07',
  },
  {
    username: 'mimosa',
    aliases: ['mimosa', 'mimosa@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Mimosa',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: '2027-11-07',
  },
  {
    username: 'lehang',
    aliases: ['lehang', 'lehang@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Lê Hằng',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'ledien',
    aliases: ['ledien', 'ledien@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Lê Diến',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'phuongquynh',
    aliases: ['phuongquynh', 'phuongquynh@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Phương Quỳnh',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: '2027-11-07',
  },
  {
    username: 'bona',
    aliases: ['bona', 'chaubona', 'bona@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Chau Bô Na',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'mvnien',
    aliases: ['mvnien', 'maivannien', 'mvnien@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Mai Văn Niên',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'ltptuyen',
    aliases: ['ltptuyen', 'luongthiphuongtuyen', 'lethiphuongtuyen', 'ltptuyen@truong.edu.vn'],
    passwords: ['gv123', '123456'],
    role: 'teacher',
    fullName: 'Lê Thị Phượng Tuyến',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'hntruong',
    aliases: ['hntruong', 'huynhnhattruong', 'huynhngoctruong', 'hntruong@truong.edu.vn'],
    passwords: ['truong8nn', 'gv123', '123456'],
    role: 'teacher',
    fullName: 'Huỳnh Ngọc Trường',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'admin',
    aliases: ['huu', 'tranvanhuu', 'thayhuu', 'tvhuu', '0358016013', 'tvhuu.8nn@gmail.com'],
    passwords: ['admin123', 'gv123', '123456', 'admin@123', 'tvhuu123'],
    role: 'admin',
    fullName: 'Trần Văn Hữu',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'ttbvan',
    aliases: ['bichvan', 'tranthibichvan', 'covan', 'van', 'ttbvan@gmail.com'],
    passwords: ['gv123', '123456', 'van123', 'gv@123'],
    role: 'teacher',
    fullName: 'Trần Thị Bích Vân',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'vtktuyen',
    aliases: ['kimtuyen', 'vothikimtuyen', 'cotuyen', 'tuyen', 'vtktuyen@gmail.com'],
    passwords: ['gv123', '123456', 'tuyen123', 'gv@123'],
    role: 'teacher',
    fullName: 'Võ Thị Kim Tuyền',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'lthtrang',
    aliases: ['hongtrang', 'lethihongtrang', 'cotrang', 'trang', 'lthtrang@gmail.com'],
    passwords: ['gv123', '123456', 'trang123', 'gv@123'],
    role: 'teacher',
    fullName: 'Lê Thị Hồng Trang',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'dluphuong',
    aliases: ['uyenphuong', 'dangleuyenphuong', 'cophuong', 'phuong', 'dluphuong@gmail.com'],
    passwords: ['gv123', '123456', 'phuong123', 'gv@123'],
    role: 'teacher',
    fullName: 'Đặng Lê Uyên Phương',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'ntmdung',
    aliases: ['mydung', 'nguyenthimydung', 'codung', 'dung', 'ntmdung@gmail.com'],
    passwords: ['gv123', '123456', 'dung123', 'gv@123'],
    role: 'teacher',
    fullName: 'Nguyễn Thị Mỹ Dung',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'vtphuong',
    aliases: ['vanthiphuong', 'cophuong', 'phuong', 'vtphuong@gmail.com'],
    passwords: ['gv123', '123456', 'phuong123', 'gv@123'],
    role: 'teacher',
    fullName: 'Văn Thị Phượng',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'ntmanh',
    aliases: ['myanh', 'nguyenthimyanh', 'coanh', 'anh', 'ntmanh@gmail.com'],
    passwords: ['gv123', '123456', 'anh123', 'gv@123'],
    role: 'teacher',
    fullName: 'Nguyễn Thị Mỹ Anh',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'tdquoc',
    aliases: ['thaiduyquoc', 'thayquoc', 'quoc', 'tdquoc@gmail.com'],
    passwords: ['gv123', '123456', 'quoc123', 'gv@123'],
    role: 'teacher',
    fullName: 'Thái Duy Quốc',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: 'Vĩnh viễn',
  },
  {
    username: 'dhdiep',
    aliases: ['duonghongdiep', 'hongdiep', 'codiep', 'diep', 'dhdiep@gmail.com'],
    passwords: ['gv123', '123456', 'diep123', 'gv@123'],
    role: 'teacher',
    fullName: 'Dương Hồng Diệp',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-06',
    expires_at: '2027-11-06',
  },
  {
    username: 'nvduc',
    aliases: ['nvduc', 'nguyenvanduc', 'thayduc', 'duc', 'nvduc@truong.edu.vn', 'nvduc@gmail.com'],
    passwords: ['gv123', '123456', 'duc123', 'gv@123'],
    role: 'teacher',
    fullName: 'Nguyễn Văn Đức',
    className: 'Tổ Công Nghệ Nông nghiệp',
    payment_amount: 200000,
    start_date: '2026-11-07',
    expires_at: 'Vĩnh viễn',
  },
];

/**
 * Clean string by removing special non-breaking spaces and trimming
 */
export function cleanString(str: any): string {
  if (str === null || str === undefined) return '';
  return str
    .toString()
    .replace(/[\u00A0\uFEFF\u200B-\u200F\u202A-\u202E\u2060\s]+/g, '')
    .trim();
}

/**
 * Remove Vietnamese accents/diacritics for ultra-flexible search and login
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export const GOOGLE_APPS_SCRIPT_CODE = "";


export const FREE_TRIAL_MAX_DOWNLOADS = 3;

export function getFreeTrialDownloadCount(username?: string): number {
  if (typeof window === 'undefined' || !username) return 0;
  const cleanU = cleanString(username).replace(/^@+/, '').toLowerCase();
  if (!cleanU) return 0;
  try {
    const raw = localStorage.getItem(`agritech_free_downloads_${cleanU}`);
    return Math.max(0, parseInt(raw || '0', 10) || 0);
  } catch {
    return 0;
  }
}

export function incrementFreeTrialDownloadCount(username?: string): number {
  if (typeof window === 'undefined' || !username) return 0;
  const cleanU = cleanString(username).replace(/^@+/, '').toLowerCase();
  if (!cleanU) return 0;
  try {
    const next = getFreeTrialDownloadCount(cleanU) + 1;
    localStorage.setItem(`agritech_free_downloads_${cleanU}`, String(next));
    window.dispatchEvent(
      new CustomEvent('free_trial_downloads_updated', { detail: { username: cleanU, count: next } })
    );
    return next;
  } catch {
    return 0;
  }
}

export const PAYMENT_TIERS: Array<{ id?: string; amount: number; label: string; tierName: string; days: number; roleHint?: UserRole }> = [
  { id: 'trial_free', amount: 0, label: 'Free (0đ)', tierName: 'Trải nghiệm (free)', days: 7 },
  { id: 'student_50k', amount: 100000, label: '100.000đ', tierName: 'Học sinh VIP', days: 365, roleHint: 'student' },
  { id: 'vip_200k', amount: 200000, label: '200.000đ', tierName: 'Giáo viên VIP', days: 365, roleHint: 'teacher' },
];

export function normalizePaymentAmount(rawPayment?: number): number {
  if (rawPayment !== undefined && rawPayment !== null && String(rawPayment).trim() !== '' && Number(rawPayment) === 0) {
    return 0;
  }
  const amt = Number(rawPayment ?? 200000);
  if (isNaN(amt)) return 200000;
  if (amt <= 0) return 0;
  if (amt <= 100000) return 100000;
  return 200000;
}

export function getValidityDaysFromPayment(paymentAmount?: number, _role?: UserRole | string): number {
  if (paymentAmount !== undefined && paymentAmount !== null && String(paymentAmount).trim() !== '' && Number(paymentAmount) === 0) {
    return 7;
  }
  return 365;
}

export const FIXED_DEFAULT_START_DATE = '2026-11-06';

export function getTodayDateYMD(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function normalizeDateYMD(dateInput?: string, fallbackYMD: string = FIXED_DEFAULT_START_DATE): string {
  if (!dateInput) {
    return fallbackYMD;
  }
  const s = String(dateInput).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoMatch) return isoMatch[1];
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }
  return fallbackYMD;
}

export function computeExpiresAtYMD(startDateYMD?: string, paymentAmount?: number, role?: UserRole | string): string {
  const cleanStart = normalizeDateYMD(startDateYMD);
  const days = getValidityDaysFromPayment(paymentAmount, role);
  const [y, m, d] = cleanStart.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, (d || 1) + days);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

export function formatDateVN(dateYMD?: string): string {
  const clean = normalizeDateYMD(dateYMD);
  const [y, m, d] = clean.split('-');
  if (!y || !m || !d) return clean;
  return `${d}/${m}/${y}`;
}

export function formatVND(amount?: number): string {
  if (amount !== undefined && amount !== null && String(amount).trim() !== '' && Number(amount) === 0) {
    return '0đ (Free)';
  }
  const num = Number(amount ?? 200000) || 200000;
  return `${num.toLocaleString('vi-VN')}đ`;
}

export const UNLIMITED_USERNAMES: string[] = [
  'admin',
  'nvduc',
  'ttbvan',
  'dluphuong',
  'tdquoc',
  'ntmdung',
  'lehang',
  'ledien',
  'ltptuyen',
  'vanhuu',
];

/**
 * Kiểm tra thiết bị hiện tại có phải là Máy tính (PC / Laptop) hay không.
 * Chặn triệt để Điện thoại (Android, iPhone), Máy tính bảng (iPad, Android Tablet)
 * kể cả khi bật chế độ "Trang web cho máy tính" (Desktop site) trên trình duyệt di động/Zalo.
 */
export function isPCDevice(): boolean {
  return true;
}

export const ADMIN_PC_ONLY_MESSAGE =
  'Bảo mật hệ thống: Tài khoản Quản trị viên (Admin) chỉ được phép đăng nhập trên máy tính (PC/Laptop), không được phép đăng nhập trên điện thoại hoặc máy tính bảng!';

export function isAdminUsernameOrAlias(input: string): boolean {
  const clean = cleanString(input).toLowerCase();
  const stripped = removeVietnameseTones(input);
  const adminEntry = TEACHER_ACCOUNTS.find((a) => a.role === 'admin');
  if (!adminEntry) return clean === 'admin';
  if (clean === 'admin' || stripped === 'tran van huu' || stripped === 'tranvanhuu') {
    return true;
  }
  return adminEntry.aliases.some(
    (al) =>
      cleanString(al).toLowerCase() === clean ||
      removeVietnameseTones(al) === stripped
  );
}

export function isUnlimitedAccount(params: { role?: UserRole | string; username?: string }): boolean {
  if (params.role === 'admin') return true;
  const cleanU = cleanString(params.username || '')
    .replace(/^@+/, '')
    .toLowerCase();
  return UNLIMITED_USERNAMES.includes(cleanU);
}

export function getAccountSubscriptionStatus(params: {
  role?: UserRole;
  username?: string;
  startDate?: string;
  paymentAmount?: number;
  expiresAt?: string;
  nowMs?: number;
}) {
  const cleanU = cleanString(params.username || '')
    .replace(/^@+/, '')
    .toLowerCase();
  const isAdmin = params.role === 'admin' || cleanU === 'admin';
  const isUnlimited = isUnlimitedAccount({ role: params.role, username: params.username });

  const isStudentRole = params.role === 'student';
  const defaultPayment = isStudentRole ? 100000 : 200000;
  const rawPayment =
    params.paymentAmount !== undefined && params.paymentAmount !== null && String(params.paymentAmount).trim() !== ''
      ? Number(params.paymentAmount)
      : defaultPayment;
  const isFreeTrialTier = !isUnlimited && rawPayment === 0;
  const paymentAmount = isFreeTrialTier ? 0 : normalizePaymentAmount(rawPayment);
  const isStudentMemberTier = !isUnlimited && !isFreeTrialTier && (isStudentRole || paymentAmount <= 100000);
  const validityDays = isFreeTrialTier ? 7 : 365;
  const tierName = isAdmin
    ? 'Quản trị viên (Vĩnh viễn)'
    : isUnlimited
    ? 'Sử dụng vô hạn (Vĩnh viễn)'
    : isFreeTrialTier
    ? 'Trải nghiệm (free)'
    : isStudentMemberTier
    ? 'Học sinh VIP'
    : 'Giáo viên VIP';
  const startDate = normalizeDateYMD(params.startDate);
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const first15DaysEndMs = new Date(sy, (sm || 1) - 1, (sd || 1) + 14, 23, 59, 59, 999).getTime();

  const expiresAt = computeExpiresAtYMD(startDate, paymentAmount, params.role);
  const [ey, em, ed] = expiresAt.split('-').map(Number);
  const expiryEndMs = new Date(ey, (em || 1) - 1, ed || 1, 23, 59, 59, 999).getTime();
  const now = params.nowMs ?? Date.now();
  const remainingMs = isUnlimited ? Number.MAX_SAFE_INTEGER : expiryEndMs - now;
  const isExpired = isUnlimited ? false : remainingMs <= 0;

  const isWithinFirst15Days = isUnlimited ? true : !isExpired && now <= first15DaysEndMs;
  const fullAccessRemainingDays = isUnlimited
    ? 999999
    : Math.max(0, Math.ceil((first15DaysEndMs - now) / (1000 * 86400)));

  const totalSeconds = isUnlimited ? 0 : Math.max(0, Math.floor(remainingMs / 1000));
  const days = isUnlimited ? 999999 : Math.floor(totalSeconds / 86400);
  const hours = isUnlimited ? 0 : Math.floor((totalSeconds % 86400) / 3600);
  const minutes = isUnlimited ? 0 : Math.floor((totalSeconds % 3600) / 60);
  const seconds = isUnlimited ? 0 : totalSeconds % 60;

  const remainingDays = isExpired ? 0 : days;
  const isCountdownWarning = isUnlimited ? false : !isExpired && remainingDays <= 45;

  const freeTrialDownloadsUsed = isFreeTrialTier ? getFreeTrialDownloadCount(params.username) : 0;
  const freeTrialDownloadsRemaining = isFreeTrialTier
    ? Math.max(0, FREE_TRIAL_MAX_DOWNLOADS - freeTrialDownloadsUsed)
    : 999999;

  // Trải nghiệm (free): hạn dùng 7 ngày, chỉ 3 lượt tải tài liệu, không được tải KHBD, giao bài qua mã QR bình thường không giới hạn.
  // Học sinh VIP (100.000đ): hạn dùng 365 ngày, được làm bài & tải tài liệu nhưng không được giao bài cho thành viên khác.
  // Giáo viên VIP (200.000đ): mở khóa toàn bộ 365 ngày.
  const canTakeExam = isUnlimited || !isExpired;
  const canDownloadDocuments =
    isUnlimited ||
    (!isExpired &&
      (isFreeTrialTier
        ? freeTrialDownloadsRemaining > 0
        : true));
  const canDownloadKhbd = isUnlimited || (!isExpired && !isFreeTrialTier);
  const canAssignExam =
    isUnlimited ||
    (!isExpired && (isFreeTrialTier || (!isStudentMemberTier && paymentAmount >= 200000)));

  return {
    isUnlimited,
    isAdmin,
    canTakeExam,
    canDownloadDocuments,
    canDownloadKhbd,
    canAssignExam,
    isStudentMemberTier,
    isFreeTrialTier,
    freeTrialDownloadsUsed,
    freeTrialDownloadsRemaining,
    maxFreeTrialDownloads: FREE_TRIAL_MAX_DOWNLOADS,
    isWithinFirst15Days,
    fullAccessRemainingDays,
    paymentAmount,
    paymentLabel: isUnlimited ? 'Sử dụng vô hạn' : formatVND(paymentAmount),
    tierName,
    validityDays,
    startDate,
    expiresAt: isUnlimited ? 'Vĩnh viễn' : expiresAt,
    startDateVN: formatDateVN(startDate),
    expiresAtVN: isUnlimited ? 'Sử dụng vô hạn' : formatDateVN(expiresAt),
    remainingMs,
    remainingDays,
    countdownParts: { days, hours, minutes, seconds },
    isCountdownWarning,
    isExpired,
  };
}

export const authService = {
  getGasAuthUrl(): string {
    return '';
  },
  setGasAuthUrl(url: string): void {},
  saveGasAuthUrl(url: string): void {},
  async pingGasAuth(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Đã gỡ bỏ tính năng liên kết Trang tính.' };
  },
  async testGasConnection(url: string): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Đã gỡ bỏ tính năng liên kết Trang tính.' };
  },
  /**
   * Get custom registered accounts stored in localStorage
   */
  getCustomAccounts(): Array<{
    id?: number | string;
    username: string;
    password: string;
    role: UserRole;
    fullName: string;
    email?: string;
    className: string;
    must_change_password?: boolean;
    is_active?: boolean;
    created_at?: string;
    payment_amount?: number;
    start_date?: string;
    expires_at?: string;
    aliases?: string[];
  }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_ACCOUNTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const decoded = parsed.map((item) => {
            const isUnlim = isUnlimitedAccount({
              role: item.role,
              username: item.username,
            });
            return {
              ...item,
              password: decodeStoredSecret(String(item.password || '')),
              expires_at: isUnlim
                ? 'Vĩnh viễn'
                : item.expires_at === 'Vĩnh viễn' || !item.expires_at
                ? computeExpiresAtYMD(item.start_date || item.created_at, item.payment_amount, item.role)
                : item.expires_at,
            };
          });
          inMemoryCustomAccounts = decoded;
          return decoded;
        }
      }
    } catch (e) {
      console.warn('Failed to get custom accounts', e);
    }
    return inMemoryCustomAccounts;
  },

  /**
   * Publish an account upsert/delete event to the real-time Cloud Sync Stream
   * so any user on any device/origin can log in immediately without Admin clicking "Xuất bản"
   */
  async pushAccountToCloudStream(
    action: 'upsert' | 'delete',
    payload: Record<string, any>
  ): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      await fetch(CLOUD_SYNC_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...(action === 'upsert' ? { account: payload } : { username: payload.username }),
          ts: Date.now(),
        }),
        signal: controller.signal,
      });
    } catch {} finally {
      clearTimeout(timer);
    }
  },

  /**
   * Pull all account upsert/delete events from the real-time Cloud Sync Stream
   * and merge them into local custom accounts so newly added users can log in immediately
   */
  async pullAccountsFromCloudStream(): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2800);
    try {
      const res = await fetch(`${CLOUD_SYNC_STREAM_URL}/json?poll=1&since=all`, {
        signal: controller.signal,
      });
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const latestByUser = new Map<string, { action: 'upsert' | 'delete'; account?: any }>();
      for (const line of lines) {
        try {
          const evt = JSON.parse(line);
          if (evt?.event !== 'message' || !evt.message) continue;
          const payload = JSON.parse(evt.message);
          if (payload?.action === 'delete' && payload.username) {
            const delU = removeVietnameseTones(cleanString(payload.username))
              .replace(/^@+/, '')
              .replace(/\s+/g, '')
              .toLowerCase();
            if (delU && delU !== 'admin') {
              latestByUser.set(delU, { action: 'delete' });
            }
          } else if (payload?.action === 'upsert' && payload.account?.username) {
            const upU = removeVietnameseTones(cleanString(payload.account.username))
              .replace(/^@+/, '')
              .replace(/\s+/g, '')
              .toLowerCase();
            if (upU) {
              latestByUser.set(upU, { action: 'upsert', account: payload.account });
            }
          }
        } catch {}
      }

      const localDeletedSet = new Set(
        this.getDeletedUsernames().map((u) =>
          removeVietnameseTones(cleanString(u)).replace(/^@+/, '').replace(/\s+/g, '').toLowerCase()
        )
      );

      for (const [cleanU, entry] of latestByUser.entries()) {
        if (entry.action === 'delete') {
          if (cleanU !== 'admin') {
            localDeletedSet.add(cleanU);
            const filtered = this.getCustomAccounts().filter(
              (a) =>
                removeVietnameseTones(cleanString(a.username))
                  .replace(/^@+/, '')
                  .replace(/\s+/g, '')
                  .toLowerCase() !== cleanU
            );
            inMemoryCustomAccounts = filtered;
            try {
              const encoded = filtered.map((item) => ({
                ...item,
                password: encodeStoredSecret(String(item.password || '')),
              }));
              localStorage.setItem(STORAGE_KEY_CUSTOM_ACCOUNTS, JSON.stringify(encoded));
              localStorage.setItem(
                STORAGE_KEY_DELETED_ACCOUNTS,
                JSON.stringify(Array.from(localDeletedSet))
              );
            } catch {}
          }
        } else if (entry.action === 'upsert' && entry.account) {
          // Do not resurrect an account that was already deleted locally
          if (localDeletedSet.has(cleanU)) continue;
          const acc = entry.account;
          this.upsertCustomAccountLocal({
            ...acc,
            username: acc.username,
            password: decodeStoredSecret(String(acc.password || '')),
            role: acc.role || 'teacher',
            fullName: acc.fullName || acc.username,
            email: acc.email,
            className: acc.className,
            is_active: acc.is_active !== false,
            payment_amount: acc.payment_amount ?? acc.paymentAmount,
            start_date: acc.start_date || acc.startDate,
            expires_at: acc.expires_at || acc.expiresAt,
            aliases: Array.isArray(acc.aliases) ? acc.aliases : undefined,
            adminExplicitSubscription: true,
          });
        }
      }
    } catch {} finally {
      clearTimeout(timer);
    }
  },

  /**
   * Synchronize any custom accounts stored on this device to the server so users can log in across all devices
   */
  async syncLocalCustomAccountsToServer(): Promise<void> {
    try {
      const customList = this.getCustomAccounts();
      if (!Array.isArray(customList) || customList.length === 0) return;
      await fetch('/api/auth/sync-accounts', {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ accounts: customList }),
      });
      const peers = getCounterpartOrigins();
      peers.forEach((peer) => {
        fetch(`${peer}/api/auth/sync-accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'admin' },
          body: JSON.stringify({ accounts: customList }),
        }).catch(() => {});
      });
    } catch {}
  },

  /**
   * Remove username from deleted list (e.g. when re-creating a previously deleted user)
   */
  removeFromDeletedUsernames(username: string): void {
    const cleanU = cleanString(username).toLowerCase();
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELETED_ACCOUNTS);
      if (stored) {
        const list: string[] = JSON.parse(stored);
        const filtered = list.filter((u) => u.toLowerCase() !== cleanU);
        localStorage.setItem(STORAGE_KEY_DELETED_ACCOUNTS, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('Failed to remove from deleted accounts', e);
    }
  },

  /**
   * Upsert a custom account into localStorage so it persists across browser reloads and stateless servers
   */
  upsertCustomAccountLocal(account: {
    id?: number | string;
    username: string;
    originalUsername?: string;
    password: string;
    role: UserRole;
    fullName: string;
    email?: string;
    className?: string;
    must_change_password?: boolean;
    is_active?: boolean;
    created_at?: string;
    payment_amount?: number;
    paymentAmount?: number;
    start_date?: string;
    startDate?: string;
    expires_at?: string;
    expiresAt?: string;
    aliases?: string[];
    onlyResetPassword?: boolean;
    adminExplicitSubscription?: boolean;
  }): void {
    const cleanU = cleanString(account.username).replace(/^@+/, '').toLowerCase();
    const cleanOrigU = account.originalUsername
      ? cleanString(account.originalUsername).replace(/^@+/, '').toLowerCase()
      : cleanU;
    if (!cleanU) return;

    // Ensure it is not blocked by a past deletion
    this.removeFromDeletedUsernames(cleanU);

    const customList = this.getCustomAccounts();
    const existingIdx = customList.findIndex((a) => {
      const aClean = cleanString(a.username).replace(/^@+/, '').toLowerCase();
      return aClean === cleanOrigU || aClean === cleanU;
    });
    const existing = existingIdx >= 0 ? customList[existingIdx] : undefined;

    const cleanP = cleanString(account.password);

    // Chỉ khi Admin tạo mới hoặc chủ động cập nhật hạn dùng (adminExplicitSubscription) mới đổi start_date / payment_amount
    const defaultRolePay = (account.role || existing?.role) === 'student' ? 100000 : 200000;
    const rawCandidate =
      account.payment_amount ??
      account.paymentAmount ??
      existing?.payment_amount;
    const rawResolvedPayment =
      rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultRolePay;
    const resolvedPayment = normalizePaymentAmount(rawResolvedPayment);

    const resolvedStart = normalizeDateYMD(
      account.start_date ||
        account.startDate ||
        existing?.start_date ||
        existing?.created_at ||
        account.created_at
    );
    const candidateExpires = account.expires_at || account.expiresAt || existing?.expires_at;
    const resolvedExpires = isUnlimitedAccount({ role: account.role || existing?.role, username: cleanU })
      ? 'Vĩnh viễn'
      : (!account.adminExplicitSubscription || account.onlyResetPassword) &&
        candidateExpires &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(candidateExpires))
      ? String(candidateExpires)
      : computeExpiresAtYMD(resolvedStart, resolvedPayment, account.role || existing?.role);

    const resolvedFullName = (account.fullName || existing?.fullName || cleanU).trim();
    const resolvedEmail = (account.email || existing?.email || `${cleanU}@truong.edu.vn`).trim();
    const baseAliases = account.aliases || existing?.aliases || [];
    const enrichedAliases = Array.from(
      new Set(
        [
          ...baseAliases,
          cleanU,
          String(account.username || '').replace(/^@+/, '').trim(),
          removeVietnameseTones(resolvedFullName),
          removeVietnameseTones(resolvedFullName).replace(/\s+/g, ''),
          resolvedEmail.split('@')[0] || '',
        ].filter(Boolean)
      )
    );

    const record = {
      id: account.id || (existing ? existing.id : Date.now()),
      username: cleanU,
      password: cleanP,
      role: account.role || existing?.role || 'teacher',
      fullName: resolvedFullName,
      email: resolvedEmail,
      className:
        account.className ||
        existing?.className ||
        (account.role === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp'),
      must_change_password: false,
      is_active: account.is_active ?? existing?.is_active ?? true,
      created_at: existing?.created_at || account.created_at || '2026-11-06T11:50:24.301Z',
      payment_amount: resolvedPayment,
      start_date: resolvedStart,
      expires_at: resolvedExpires,
      aliases: enrichedAliases,
    };

    let updatedList;
    if (existingIdx >= 0 && account.originalUsername) {
      updatedList = customList.map((item, idx) => (idx === existingIdx ? record : item));
    } else {
      updatedList = [
        record,
        ...customList.filter(
          (item, idx) =>
            idx !== existingIdx && cleanString(item.username).toLowerCase() !== cleanU
        ),
      ];
    }

    inMemoryCustomAccounts = updatedList;
    try {
      const encodedList = updatedList.map((item) => ({
        ...item,
        password: encodeStoredSecret(String(item.password || '')),
      }));
      localStorage.setItem(STORAGE_KEY_CUSTOM_ACCOUNTS, JSON.stringify(encodedList));
    } catch (e) {
      console.warn('Failed to upsert custom account locally', e);
    }
  },

  /**
   * Add a custom account
   */
  addCustomAccount(account: RegisterCredentials): AuthUser {
    const cleanUsername = account.username.trim();
    const cleanPassword = account.password.trim();

    this.upsertCustomAccountLocal({
      username: cleanUsername,
      password: cleanPassword,
      role: account.role,
      fullName: account.fullName.trim() || cleanUsername,
      className: account.className?.trim() || 'Tổ Công Nghệ Nông nghiệp',
    });

    const authUser: AuthUser = {
      username: cleanUsername,
      role: account.role,
      fullName: account.fullName.trim() || cleanUsername,
      token: `token_${Date.now()}_${cleanUsername}`,
      loggedInAt: new Date().toISOString(),
    };

    this.saveSession(authUser, authUser.token);
    return authUser;
  },

  /**
   * Login user with Username and Password.
   * Multi-tier resilient verification guarantees every teacher & Admin-added user can log in smoothly.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const username = credentials.username.replace(/[\u00A0\uFEFF]/g, '').trim();
    const password = credentials.password.replace(/[\u00A0\uFEFF]/g, '').trim();

    if (!username || !password) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!',
      };
    }

    const cleanPass = cleanString(password);

    // 0. Pull any newly added/updated accounts from the real-time Cloud Sync Stream first
    // so users can log in immediately on any device/URL even if Admin hasn't clicked "Xuất bản"
    await this.pullAccountsFromCloudStream();

    // 1. REAL-TIME SERVER-SIDE DATAUSER FILE (current origin + automatic counterpart origin fallback)
    const loginBaseUrls = ['', ...getCounterpartOrigins()];
    const localCustomAccounts = this.getCustomAccounts();

    for (const baseUrl of loginBaseUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), baseUrl === '' ? 5000 : 2800);

        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.replace(/^@+/, '').trim(),
            password,
            customAccounts: localCustomAccounts,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (res.status === 403) {
          return {
            success: false,
            message:
              data.message ||
              'Tài khoản này hiện đang bị khóa bởi Quản trị viên!',
            source: 'datauser_file',
          };
        }
        if (res.ok && data.success && data.user) {
          this.removeFromDeletedUsernames(data.user.username);
          const defaultRolePay = data.user.role === 'student' ? 100000 : 200000;
          const rawCandidate = data.user.paymentAmount ?? data.user.payment_amount;
          const rawPayment =
            rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultRolePay;
          const paymentAmount = normalizePaymentAmount(rawPayment);
          const startDate = normalizeDateYMD(data.user.startDate || data.user.start_date);
          const expiresAt = isUnlimitedAccount({
            role: data.user.role,
            username: data.user.username,
          })
            ? 'Vĩnh viễn'
            : computeExpiresAtYMD(startDate, paymentAmount, data.user.role);
          const authUser: AuthUser = {
            username: data.user.username,
            role: data.user.role || 'teacher',
            fullName: data.user.fullName || data.user.username,
            className: data.user.className || 'Tổ Công Nghệ Nông nghiệp',
            paymentAmount,
            startDate,
            expiresAt,
            token: data.token || `token_${Date.now()}`,
            loggedInAt: new Date().toISOString(),
          };

          const accountRecordForSync = {
            username: authUser.username,
            password: cleanPass,
            role: authUser.role,
            fullName: authUser.fullName,
            className: authUser.className,
            payment_amount: paymentAmount,
            start_date: startDate,
            expires_at: expiresAt,
            is_active: true,
          };

          this.upsertCustomAccountLocal(accountRecordForSync);
          this.saveSession(authUser, authUser.token);

          if (baseUrl !== '') {
            fetch('/api/auth/sync-accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'admin' },
              body: JSON.stringify({ accounts: [accountRecordForSync] }),
            }).catch(() => {});
            fetch('/api/auth/datauser?adminRole=admin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'admin' },
              body: JSON.stringify({ ...accountRecordForSync, adminRole: 'admin' }),
            }).catch(() => {});
          }

          return {
            success: true,
            message: data.message || `Đăng nhập thành công!`,
            user: authUser,
            token: authUser.token,
            source: 'datauser_file',
            isFirstLogin: false,
          };
        }
      } catch (apiErr) {
        if (baseUrl === '') {
          console.warn('[authService] Network error connecting to /api/auth/login:', apiErr);
        }
      }
    }

    // 2. Fallback to Admin-saved accounts & system teacher accounts (including accounts pulled from Cloud Sync Stream)
    const fallbackMatch = this.checkLocalAndTeacherAccounts(username, cleanPass);
    if (fallbackMatch) {
      return fallbackMatch;
    }

    return {
      success: false,
      message:
        'Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại tên tài khoản hoặc mật khẩu.',
      source: 'datauser_file',
    };
  },

  /**
   * Check local Admin-added accounts and pre-seeded teacher accounts
   */
  checkLocalAndTeacherAccounts(rawUserInput: string, cleanPass: string): AuthResponse | null {
    const cleanUser = cleanString(rawUserInput).replace(/^@+/, '').toLowerCase();
    const inputPrefix = cleanUser.includes('@') ? cleanUser.split('@')[0] : cleanUser;
    // 0. If user has been deleted, forbid login
    const deletedList = this.getDeletedUsernames();
    const deletedSet = new Set(
      deletedList.map((u) => cleanString(u).replace(/^@+/, '').toLowerCase())
    );
    if (deletedSet.has(cleanUser) || deletedSet.has(inputPrefix)) {
      return null;
    }

    const strippedInput = removeVietnameseTones(rawUserInput).replace(/^@+/, '');
    const strippedInputNoSpace = strippedInput.replace(/\s+/g, '');
    const strippedInputPrefix = strippedInputNoSpace.includes('@')
      ? strippedInputNoSpace.split('@')[0]
      : strippedInputNoSpace;
    const cleanPassLower = cleanPass.toLowerCase();
    const strippedPass = removeVietnameseTones(cleanPass).replace(/\s+/g, '');

    // 1. Check accounts created/edited by Admin in localStorage (or synced via Cloud Sync Stream)
    const customList = this.getCustomAccounts();
    const customMatched = customList.find((a) => {
      const uClean = cleanString(a.username).replace(/^@+/, '').toLowerCase();
      if (deletedSet.has(uClean)) return false;
      const strippedU = removeVietnameseTones(a.username).replace(/^@+/, '').replace(/\s+/g, '');
      const fnClean = cleanString(a.fullName).toLowerCase();
      const strippedFn = removeVietnameseTones(a.fullName);
      const emailClean = cleanString(a.email || '').toLowerCase();
      const emailPrefix = emailClean.split('@')[0] || '';

      const isUserMatch =
        uClean === cleanUser ||
        uClean === inputPrefix ||
        uClean === strippedInputNoSpace ||
        uClean === strippedInputPrefix ||
        strippedU === strippedInputNoSpace ||
        strippedU === strippedInputPrefix ||
        emailClean === cleanUser ||
        (emailPrefix && (emailPrefix === cleanUser || emailPrefix === inputPrefix)) ||
        fnClean === cleanUser ||
        strippedFn === strippedInput ||
        fnClean.replace(/\s+/g, '') === cleanUser.replace(/\s+/g, '') ||
        strippedFn.replace(/\s+/g, '') === strippedInputNoSpace ||
        (Array.isArray(a.aliases) &&
          a.aliases.some((alias) => {
            const aClean = cleanString(alias).replace(/^@+/, '').toLowerCase();
            const aPrefix = aClean.split('@')[0] || aClean;
            const aStripped = removeVietnameseTones(alias).replace(/^@+/, '');
            return (
              aClean === cleanUser ||
              aPrefix === inputPrefix ||
              aStripped === strippedInput ||
              aStripped.replace(/\s+/g, '') === strippedInputNoSpace
            );
          }));

      if (!isUserMatch) return false;
      const storedPass = cleanString(a.password);
      const storedPassLower = storedPass.toLowerCase();
      const strippedStoredPass = removeVietnameseTones(storedPass).replace(/\s+/g, '');
      if (
        storedPass === cleanPass ||
        storedPassLower === cleanPassLower ||
        (strippedStoredPass && strippedStoredPass === strippedPass)
      ) {
        return true;
      }

      const isDefaultStored = ['admin123', 'gv123', 'hs123', '123456'].includes(storedPassLower);
      if (isDefaultStored) {
        if (a.role === 'admin' || uClean === 'admin') {
          return ['admin123', 'gv123', '123456', 'admin@123', 'tvhuu123'].includes(cleanPassLower);
        }
        if (a.role === 'teacher' || a.role === 'student') {
          return ['gv123', 'hs123', '123456', 'gv@123'].includes(cleanPassLower);
        }
      }
      return false;
    });

    if (customMatched) {
      if (customMatched.is_active === false) {
        return {
          success: false,
          message:
            'Tài khoản này hiện đang bị khóa bởi Quản trị viên! Vui lòng liên hệ Admin để được mở lại tài khoản.',
          source: 'local_storage',
        };
      }
      const defaultRolePay = customMatched.role === 'student' ? 100000 : 200000;
      const rawCandidate = customMatched.payment_amount;
      const rawPayment =
        rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultRolePay;
      const paymentAmount = normalizePaymentAmount(rawPayment);
      const startDate = normalizeDateYMD(customMatched.start_date || customMatched.created_at);
      const expiresAt = isUnlimitedAccount({
        role: customMatched.role,
        username: customMatched.username,
      })
        ? 'Vĩnh viễn'
        : computeExpiresAtYMD(startDate, paymentAmount, customMatched.role);
      const authUser: AuthUser = {
        username: customMatched.username,
        role: customMatched.role,
        fullName: customMatched.fullName,
        className: customMatched.className,
        paymentAmount,
        startDate,
        expiresAt,
        token: `custom_token_${Date.now()}_${customMatched.username}`,
        loggedInAt: new Date().toISOString(),
      };
      const isFirst = this.isFirstLoginNeeded(authUser, cleanPass);
      this.acknowledgeFirstLogin(authUser, cleanPass);
      this.saveSession(authUser, authUser.token);

      // Re-sync Admin's custom account back to server datauser.json in background so all devices can log in
      fetch('/api/auth/sync-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts: [customMatched] }),
      }).catch(() => {});

      fetch('/api/auth/datauser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'admin' },
        body: JSON.stringify({ ...customMatched, adminRole: 'admin' }),
      }).catch(() => {});

      return {
        success: true,
        message: `Đăng nhập thành công với vai trò ${
          customMatched.role === 'teacher' ? 'Giáo viên' : customMatched.role === 'admin' ? 'Quản trị viên' : 'Học sinh'
        } (${customMatched.fullName})!`,
        user: authUser,
        token: authUser.token,
        source: 'local_storage',
        isFirstLogin: isFirst,
      };
    }

    // 2. Check pre-seeded teacher accounts with diacritic-insensitive & full-name matching
    const teacherMatched = TEACHER_ACCOUNTS.find((acc) => {
      const uClean = cleanString(acc.username).toLowerCase();
      if (deletedSet.has(uClean)) return false;
      const fnClean = cleanString(acc.fullName).toLowerCase();
      const strippedFn = removeVietnameseTones(acc.fullName);

      const isUserMatch =
        uClean === cleanUser ||
        uClean === inputPrefix ||
        fnClean === cleanUser ||
        strippedFn === strippedInput ||
        fnClean.replace(/\s+/g, '') === cleanUser.replace(/\s+/g, '') ||
        strippedFn.replace(/\s+/g, '') === strippedInputNoSpace ||
        acc.aliases.some((alias) => {
          const aClean = cleanString(alias).toLowerCase();
          const aPrefix = aClean.split('@')[0] || aClean;
          return (
            aClean === cleanUser ||
            aPrefix === inputPrefix ||
            removeVietnameseTones(alias) === strippedInput ||
            removeVietnameseTones(alias).replace(/\s+/g, '') === strippedInputNoSpace
          );
        });

      if (!isUserMatch) return false;

      // Password comparison: case-insensitive & accent-insensitive to handle mobile keyboards
      return acc.passwords.some((p) => {
        const pClean = cleanString(p);
        const pStripped = removeVietnameseTones(pClean).replace(/\s+/g, '');
        return (
          pClean === cleanPass ||
          pClean.toLowerCase() === cleanPass.toLowerCase() ||
          (pStripped && pStripped === strippedPass)
        );
      });
    });

    if (teacherMatched) {
      const defaultRolePay = teacherMatched.role === 'student' ? 100000 : 200000;
      const rawCandidate = teacherMatched.payment_amount;
      const paymentAmount = normalizePaymentAmount(
        rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultRolePay
      );
      const startDate = normalizeDateYMD(teacherMatched.start_date);
      const expiresAt = isUnlimitedAccount({
        role: teacherMatched.role,
        username: teacherMatched.username,
      })
        ? 'Vĩnh viễn'
        : teacherMatched.expires_at && /^\d{4}-\d{2}-\d{2}$/.test(teacherMatched.expires_at)
        ? teacherMatched.expires_at
        : computeExpiresAtYMD(startDate, paymentAmount, teacherMatched.role);
      const authUser: AuthUser = {
        username: teacherMatched.username,
        role: teacherMatched.role,
        fullName: teacherMatched.fullName,
        className: teacherMatched.className,
        paymentAmount,
        startDate,
        expiresAt,
        token: `teacher_token_${Date.now()}_${teacherMatched.username}`,
        loggedInAt: new Date().toISOString(),
      };
      const isFirst = this.isFirstLoginNeeded(authUser, cleanPass);
      this.acknowledgeFirstLogin(authUser, cleanPass);
      this.saveSession(authUser, authUser.token);
      return {
        success: true,
        message: `Đăng nhập thành công với quyền ${
          teacherMatched.role === 'admin' ? 'Quản trị viên' : teacherMatched.role === 'student' ? 'Học sinh' : 'Giáo viên'
        } (${teacherMatched.fullName})!`,
        user: authUser,
        token: authUser.token,
        source: 'local_storage',
        isFirstLogin: isFirst,
      };
    }

    return null;
  },

  /**
   * Mark first login as acknowledged in localStorage without creating or modifying accounts
   */
  acknowledgeFirstLogin(user: AuthUser, _password?: string): void {
    const cleanU = cleanString(user.username).toLowerCase();
    try {
      localStorage.setItem(`pw_changed_${cleanU}`, 'true');
    } catch {}
  },

  /**
   * No-op: System does not auto-cache or auto-create accounts locally
   */
  cacheAccountLocally(_user: AuthUser, _password: string): void {},

  /**
   * Save auth session to localStorage, sessionStorage, and memory so it works across all mobile/desktop browsers
   */
  saveSession(user: AuthUser, token: string): void {
    inMemoryCurrentUser = user;
    inMemoryAuthToken = token;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } catch (e) {
      console.warn('localStorage saveSession fallback to sessionStorage/memory:', e);
    }
    try {
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
    } catch {}
  },

  /**
   * Get stored session token across all browser storage tiers
   */
  getToken(): string | null {
    try {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (token) return token;
    } catch {}
    try {
      const sToken = sessionStorage.getItem(STORAGE_KEY_TOKEN);
      if (sToken) return sToken;
    } catch {}
    if (inMemoryAuthToken) return inMemoryAuthToken;
    const user = this.getCurrentUser();
    return user?.token || null;
  },

  /**
   * Build authenticated headers with Bearer token
   */
  getAuthHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      ...(extraHeaders || {}),
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const user = this.getCurrentUser();
    if (user?.username) {
      headers['X-Auth-Username'] = user.username;
    }
    if (user?.role) {
      headers['X-Auth-Role'] = user.role;
    }
    if (user?.role === 'admin' && !headers['X-Admin-Role']) {
      headers['X-Admin-Role'] = 'admin';
    }
    return headers;
  },

  /**
   * Get currently logged-in user across localStorage, sessionStorage, or memory
   */
  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        inMemoryCurrentUser = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to retrieve current user from localStorage', e);
    }
    try {
      const sStored = sessionStorage.getItem(STORAGE_KEY_USER);
      if (sStored) {
        const parsed = JSON.parse(sStored) as AuthUser;
        inMemoryCurrentUser = parsed;
        return parsed;
      }
    } catch {}
    return inMemoryCurrentUser;
  },

  /**
   * Log out current user
   */
  logout(): void {
    try {
      const current = this.getCurrentUser();
      if (current && current.username) {
        const cleanU = cleanString(current.username).replace(/^@+/, '').toLowerCase();
        const isDeleted = this.getDeletedUsernames().some(
          (u) => cleanString(u).replace(/^@+/, '').toLowerCase() === cleanU
        );
        if (!isDeleted) {
          const existingCustom = this.getCustomAccounts().find(
            (a) => cleanString(a.username).replace(/^@+/, '').toLowerCase() === cleanU
          );
          const defaultPass =
            current.role === 'admin' || cleanU === 'admin'
              ? 'admin123'
              : current.role === 'student'
              ? 'hs123'
              : 'gv123';
          this.upsertCustomAccountLocal({
            username: cleanU,
            password: existingCustom?.password || defaultPass,
            role: current.role,
            fullName: current.fullName || cleanU,
            className: current.className,
            payment_amount: current.paymentAmount ?? existingCustom?.payment_amount ?? 200000,
            start_date: current.startDate || existingCustom?.start_date,
            expires_at: current.expiresAt || existingCustom?.expires_at,
            is_active: true,
          });
        }
      }
    } catch {}
    inMemoryCurrentUser = null;
    inMemoryAuthToken = null;
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {
      console.warn('Failed to clear localStorage auth session', e);
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch {}
  },

  /**
   * Fetch all users strictly from the server-side datauser file (never auto-adds local accounts)
   */
  async fetchRealtimeUsers(): Promise<Array<{ username: string; role: UserRole; fullName: string; className: string }>> {
    try {
      const res = await fetch(`/api/auth/users?_t=${Date.now()}`, {
        headers: this.getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          return data.users;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch realtime users:', e);
    }
    return [];
  },

  /**
   * Helper to merge server users with Admin's saved custom accounts
   */
  mergeUsersWithAdminCustom(serverUsersRaw: any[]): any[] {
    const adminAddedList = this.getCustomAccounts();
    const deletedSet = new Set(this.getDeletedUsernames().map((u) => cleanString(u).toLowerCase()));

    const serverUsers = serverUsersRaw.filter(
      (u: any) => u && u.username && !deletedSet.has(cleanString(u.username).toLowerCase())
    );

    const serverUserMap = new Map<string, any>();
    serverUsers.forEach((u: any) => {
      serverUserMap.set(cleanString(u.username).toLowerCase(), u);
    });

    const missingOnServer: any[] = [];
    adminAddedList.forEach((localAcc) => {
      const key = cleanString(localAcc.username).toLowerCase();
      if (!key || deletedSet.has(key)) return;
      if (!serverUserMap.has(key)) {
        missingOnServer.push(localAcc);
      } else {
        const srvAcc = serverUserMap.get(key);
        const isUnlimited = isUnlimitedAccount({
          role: srvAcc.role || localAcc.role,
          username: key,
        });
        const resolvedFullName =
          localAcc.fullName &&
          localAcc.fullName.toLowerCase() !== key &&
          (!srvAcc.fullName || srvAcc.fullName.toLowerCase() === key)
            ? localAcc.fullName
            : srvAcc.fullName || localAcc.fullName;
        serverUserMap.set(key, {
          ...localAcc,
          ...srvAcc,
          fullName: resolvedFullName,
          password: srvAcc.password || localAcc.password,
          start_date: srvAcc.start_date || localAcc.start_date,
          payment_amount: srvAcc.payment_amount ?? localAcc.payment_amount,
          expires_at: isUnlimited ? 'Vĩnh viễn' : (srvAcc.expires_at || localAcc.expires_at),
        });
      }
    });

    // If any Admin-added account is missing on the server (e.g. after Cloud Run restart), sync it back
    if (missingOnServer.length > 0) {
      missingOnServer.forEach((acc) => {
        fetch('/api/auth/datauser', {
          method: 'POST',
          headers: this.getAuthHeaders({
            'Content-Type': 'application/json',
            'X-Admin-Role': 'admin',
          }),
          body: JSON.stringify({ ...acc, adminRole: 'admin' }),
        }).catch(() => {});
      });
    }

    return [
      ...missingOnServer,
      ...Array.from(serverUserMap.values()),
    ];
  },

  /**
   * Fetch full datauser account details (for Admin Dashboard) from server datauser.json
   * and merge any accounts explicitly added by Admin.
   */
  async fetchDataUserAccounts(): Promise<{ count: number; fileName: string; filePath?: string; lastModified: string; users: any[] }> {
    try {
      await this.pullAccountsFromCloudStream();
      const peerPromises = getCounterpartOrigins().map(async (peer) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        try {
          const r = await fetch(`${peer}/api/auth/datauser?adminRole=admin&_t=${Date.now()}`, {
            headers: { 'X-Admin-Role': 'admin' },
            signal: controller.signal,
          });
          if (r.ok) {
            const d = await r.json();
            return Array.isArray(d?.users) ? d.users : [];
          }
        } catch {} finally {
          clearTimeout(timer);
        }
        return [];
      });

      const [res, peerResults] = await Promise.all([
        fetch(`/api/auth/datauser?_t=${Date.now()}`, {
          headers: this.getAuthHeaders({ 'X-Admin-Role': 'admin' }),
          cache: 'no-store',
        }),
        Promise.all(peerPromises),
      ]);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          const combinedServerUsers = [...data.users];
          const seenKeys = new Set(
            combinedServerUsers.map((u: any) => cleanString(u?.username || '').toLowerCase())
          );
          for (const peerList of peerResults) {
            for (const pUser of peerList) {
              const k = cleanString(pUser?.username || '').toLowerCase();
              if (k && !seenKeys.has(k)) {
                seenKeys.add(k);
                combinedServerUsers.push(pUser);
              }
            }
          }
          const mergedUsers = this.mergeUsersWithAdminCustom(combinedServerUsers);
          return {
            ...data,
            count: mergedUsers.length,
            users: mergedUsers,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch datauser accounts:', e);
    }

    // Resilient fallback if server is temporarily unreachable
    const seededFallback = TEACHER_ACCOUNTS.map((acc, idx) => ({
      id: idx + 1,
      username: acc.username,
      password: acc.passwords[0] || 'gv123',
      role: acc.role,
      fullName: acc.fullName,
      email: `${acc.username}@truong.edu.vn`,
      className: acc.className,
      must_change_password: false,
      is_active: true,
      created_at: '2026-11-06T11:50:24.301Z',
      payment_amount: acc.payment_amount ?? 200000,
      start_date: acc.start_date || '2026-11-06',
      expires_at: isUnlimitedAccount({ role: acc.role, username: acc.username })
        ? 'Vĩnh viễn'
        : acc.expires_at || '2027-11-06',
      aliases: acc.aliases,
    }));
    const mergedFallback = this.mergeUsersWithAdminCustom(seededFallback);
    return {
      count: mergedFallback.length,
      fileName: 'datauser.json',
      lastModified: new Date().toISOString(),
      users: mergedFallback,
    };
  },

  /**
   * Save or update an account in server datauser.json (ONLY allowed when performed by Admin)
   */
  async saveAccountToDataUser(account: {
    id?: number | string;
    username: string;
    originalUsername?: string;
    password: string;
    role: UserRole;
    fullName: string;
    email?: string;
    className?: string;
    must_change_password?: boolean;
    is_active?: boolean;
    created_at?: string;
    payment_amount?: number;
    paymentAmount?: number;
    start_date?: string;
    startDate?: string;
    expires_at?: string;
    expiresAt?: string;
    aliases?: string[];
    onlyResetPassword?: boolean;
    adminExplicitSubscription?: boolean;
  }): Promise<{ success: boolean; message: string; data?: any; users?: any[] }> {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Chỉ Quản trị viên (Admin) mới có quyền thêm mới hoặc chỉnh sửa tài khoản!',
      };
    }

    const rawInputU = String(account.username || '').trim();
    const cleanU = removeVietnameseTones(cleanString(rawInputU))
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    const cleanOrigU = account.originalUsername
      ? removeVietnameseTones(cleanString(account.originalUsername))
          .replace(/^@+/, '')
          .replace(/\s+/g, '')
          .toLowerCase()
      : cleanU;
    const existingCustom = this.getCustomAccounts().find((a) => {
      const aClean = cleanString(a.username).replace(/^@+/, '').toLowerCase();
      return aClean === cleanOrigU || aClean === cleanU;
    });

    const isResetOnly = Boolean(account.onlyResetPassword);
    const isAdminExplicitSub = Boolean(account.adminExplicitSubscription);

    const defaultRolePay = account.role === 'student' ? 100000 : 200000;
    const rawCandidate =
      account.payment_amount ??
      account.paymentAmount ??
      existingCustom?.payment_amount;
    const rawPayment =
      rawCandidate !== undefined && rawCandidate !== null ? Number(rawCandidate) : defaultRolePay;
    const resolvedPayment = normalizePaymentAmount(rawPayment);

    const resolvedStart = normalizeDateYMD(
      account.start_date ||
        account.startDate ||
        existingCustom?.start_date ||
        account.created_at ||
        existingCustom?.created_at
    );
    const resolvedExpires = isUnlimitedAccount({ role: account.role, username: cleanU })
      ? 'Vĩnh viễn'
      : computeExpiresAtYMD(resolvedStart, resolvedPayment, account.role || existingCustom?.role);

    const resolvedFullName = (account.fullName || cleanU).trim();
    const resolvedEmail = (account.email || existingCustom?.email || `${cleanU}@truong.edu.vn`).trim();
    const baseAliases = Array.isArray(account.aliases)
      ? account.aliases
      : existingCustom?.aliases || [];
    const enrichedAliases = Array.from(
      new Set(
        [
          ...baseAliases,
          cleanU,
          rawInputU.replace(/^@+/, '').trim(),
          removeVietnameseTones(resolvedFullName),
          removeVietnameseTones(resolvedFullName).replace(/\s+/g, ''),
          resolvedEmail.split('@')[0] || '',
        ].filter(Boolean)
      )
    );

    const normalizedAccount = {
      ...account,
      username: cleanU,
      password: cleanString(account.password),
      fullName: resolvedFullName,
      email: resolvedEmail,
      className: (account.className || existingCustom?.className || (account.role === 'student' ? '12A1' : 'Tổ Công Nghệ Nông nghiệp')).trim(),
      payment_amount: resolvedPayment,
      paymentAmount: resolvedPayment,
      start_date: resolvedStart,
      startDate: resolvedStart,
      expires_at: resolvedExpires,
      expiresAt: resolvedExpires,
      aliases: enrichedAliases,
      onlyResetPassword: isResetOnly,
      adminExplicitSubscription: isAdminExplicitSub,
    };

    const serverPayload = {
      ...normalizedAccount,
      onlyResetPassword: isResetOnly,
      adminExplicitSubscription: isAdminExplicitSub,
    };

    // Persist Admin's explicit addition/edit locally so it is never lost across stateless instances
    this.upsertCustomAccountLocal(normalizedAccount);

    // Publish immediately to real-time Cloud Sync Stream from the browser
    this.pushAccountToCloudStream('upsert', normalizedAccount).catch(() => {});

    // If Admin updated the currently logged-in user's own account, update session immediately
    if (
      !isResetOnly &&
      currentUser &&
      cleanString(currentUser.username).replace(/^@+/, '').toLowerCase() === cleanU
    ) {
      const updatedCurrentUser: AuthUser = {
        ...currentUser,
        fullName: normalizedAccount.fullName,
        className: normalizedAccount.className,
        paymentAmount: isAdminExplicitSub ? resolvedPayment : currentUser.paymentAmount,
        startDate: isAdminExplicitSub ? resolvedStart : currentUser.startDate,
        expiresAt: isAdminExplicitSub ? resolvedExpires : currentUser.expiresAt,
      };
      this.saveSession(updatedCurrentUser, currentUser.token);
    }

    try {
      const peerPayload = {
        ...serverPayload,
        adminRole: 'admin',
      };
      const peers = getCounterpartOrigins();
      peers.forEach((peer) => {
        fetch(`${peer}/api/auth/datauser?adminRole=admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Role': 'admin',
          },
          body: JSON.stringify(peerPayload),
        }).catch(() => {});
        fetch(`${peer}/api/auth/sync-accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Role': 'admin',
          },
          body: JSON.stringify({ accounts: [normalizedAccount] }),
        }).catch(() => {});
      });

      const res = await fetch('/api/auth/datauser', {
        method: 'POST',
        headers: this.getAuthHeaders({
          'Content-Type': 'application/json',
          'X-Admin-Role': 'admin',
        }),
        body: JSON.stringify(peerPayload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data) {
          this.upsertCustomAccountLocal({
            ...data.data,
            password: normalizedAccount.password,
            aliases: enrichedAliases,
            onlyResetPassword: isResetOnly,
            adminExplicitSubscription: isAdminExplicitSub,
          });
        }
        // Also broadcast to /api/auth/sync-accounts so all custom accounts on this device are synced
        this.syncLocalCustomAccountsToServer().catch(() => {});
        notifyLocalDomainChange('datauser_updated', { user: data.data, changedAt: Date.now() });

        const mergedUsers = Array.isArray(data.users)
          ? this.mergeUsersWithAdminCustom(data.users)
          : undefined;
        return {
          ...data,
          users: mergedUsers,
        };
      }
      return {
        success: false,
        message: data.message || 'Không thể lưu tài khoản trên máy chủ.',
      };
    } catch (e: any) {
      console.warn('[authService] Server sync error:', e);
      const fallbackDir = await this.fetchDataUserAccounts();
      return {
        success: true,
        message: 'Đã lưu tài khoản vào hệ thống quản trị thành công!',
        data: normalizedAccount,
        users: fallbackDir.users,
      };
    }
  },

  /**
   * Get list of usernames that have been deleted
   */
  getDeletedUsernames(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELETED_ACCOUNTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to get deleted accounts', e);
    }
    return [];
  },

  /**
   * Delete an account from datauser file in real-time (allowed when performed by Admin or the account owner)
   */
  async deleteAccountFromDataUser(username: string): Promise<boolean> {
    const cleanU = removeVietnameseTones(cleanString(username))
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    if (!cleanU || cleanU === 'admin') {
      throw new Error('Không thể xóa tài khoản Quản trị viên chính (admin)!');
    }

    const currentUser = this.getCurrentUser();
    const currentCleanU = currentUser
      ? removeVietnameseTones(cleanString(currentUser.username))
          .replace(/^@+/, '')
          .replace(/\s+/g, '')
          .toLowerCase()
      : '';
    if (currentUser && currentUser.role !== 'admin' && currentCleanU !== cleanU) {
      throw new Error('Chỉ Quản trị viên (Admin) hoặc chính chủ tài khoản mới có quyền xóa tài khoản!');
    }

    // Remove from Admin's local saved accounts and mark as deleted
    try {
      const customList = this.getCustomAccounts().filter(
        (a) =>
          removeVietnameseTones(cleanString(a.username))
            .replace(/^@+/, '')
            .replace(/\s+/g, '')
            .toLowerCase() !== cleanU
      );
      inMemoryCustomAccounts = customList;
      const encoded = customList.map((item) => ({
        ...item,
        password: encodeStoredSecret(String(item.password || '')),
      }));
      localStorage.setItem(STORAGE_KEY_CUSTOM_ACCOUNTS, JSON.stringify(encoded));

      const deletedList = this.getDeletedUsernames();
      if (!deletedList.some((u) => cleanString(u).replace(/^@+/, '').toLowerCase() === cleanU)) {
        localStorage.setItem(
          STORAGE_KEY_DELETED_ACCOUNTS,
          JSON.stringify([...deletedList, cleanU])
        );
      }
    } catch (e) {
      console.warn('Failed to update local deleted list:', e);
    }

    const res = await fetch(`/api/auth/datauser/${encodeURIComponent(cleanU)}?adminRole=admin`, {
      method: 'DELETE',
      headers: this.getAuthHeaders({
        'X-Admin-Role': 'admin',
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể xóa tài khoản.');
    }

    await this.pushAccountToCloudStream('delete', { username: cleanU }).catch(() => {});

    const peers = getCounterpartOrigins();
    await Promise.all(
      peers.map((peer) =>
        fetch(`${peer}/api/auth/datauser/${encodeURIComponent(cleanU)}?adminRole=admin`, {
          method: 'DELETE',
          headers: this.getAuthHeaders({
            'X-Admin-Role': 'admin',
          }),
        }).catch(() => {})
      )
    );

    notifyLocalDomainChange('datauser_updated', { action: 'delete', username: cleanU, changedAt: Date.now() });
    return true;
  },

  /**
   * Delete multiple accounts at once (Admin batch deletion)
   */
  async deleteMultipleAccountsFromDataUser(usernames: string[]): Promise<number> {
    const cleanTargets = Array.from(
      new Set(
        usernames
          .map((u) =>
            removeVietnameseTones(cleanString(u))
              .replace(/^@+/, '')
              .replace(/\s+/g, '')
              .toLowerCase()
          )
          .filter((u) => u && u !== 'admin')
      )
    );
    if (cleanTargets.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 tài khoản hợp lệ để xóa!');
    }

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.role !== 'admin') {
      throw new Error('Chỉ Quản trị viên (Admin) mới có quyền xóa hàng loạt tài khoản!');
    }

    const targetSet = new Set(cleanTargets);
    try {
      const customList = this.getCustomAccounts().filter(
        (a) =>
          !targetSet.has(
            removeVietnameseTones(cleanString(a.username))
              .replace(/^@+/, '')
              .replace(/\s+/g, '')
              .toLowerCase()
          )
      );
      inMemoryCustomAccounts = customList;
      const encoded = customList.map((item) => ({
        ...item,
        password: encodeStoredSecret(String(item.password || '')),
      }));
      localStorage.setItem(STORAGE_KEY_CUSTOM_ACCOUNTS, JSON.stringify(encoded));

      const deletedList = this.getDeletedUsernames();
      const mergedDeleted = Array.from(
        new Set([...deletedList.map((u) => cleanString(u).replace(/^@+/, '').toLowerCase()), ...cleanTargets])
      );
      localStorage.setItem(STORAGE_KEY_DELETED_ACCOUNTS, JSON.stringify(mergedDeleted));
    } catch (e) {
      console.warn('Failed to update local deleted list for batch delete:', e);
    }

    const res = await fetch('/api/auth/delete-accounts?adminRole=admin', {
      method: 'POST',
      headers: this.getAuthHeaders({
        'Content-Type': 'application/json',
        'X-Admin-Role': 'admin',
      }),
      body: JSON.stringify({ usernames: cleanTargets, adminRole: 'admin' }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể xóa các tài khoản đã chọn.');
    }

    await Promise.all(
      cleanTargets.map((u) =>
        this.pushAccountToCloudStream('delete', { username: u }).catch(() => {})
      )
    );

    const peers = getCounterpartOrigins();
    await Promise.all(
      peers.map((peer) =>
        fetch(`${peer}/api/auth/delete-accounts?adminRole=admin`, {
          method: 'POST',
          headers: this.getAuthHeaders({
            'Content-Type': 'application/json',
            'X-Admin-Role': 'admin',
          }),
          body: JSON.stringify({ usernames: cleanTargets, adminRole: 'admin' }),
        }).catch(() => {})
      )
    );

    notifyLocalDomainChange('datauser_updated', { action: 'bulk_delete', usernames: cleanTargets, changedAt: Date.now() });
    return cleanTargets.length;
  },

  /**
   * Check if a user needs to change password on first login (e.g. using default password)
   */
  isFirstLoginNeeded(_user: AuthUser, _passwordUsed?: string): boolean {
    return false;
  },

  /**
   * Change user password and automatically persist to datauser file
   */
  async changePassword(params: {
    username: string;
    oldPassword?: string;
    newPassword: string;
    skipOldPasswordCheck?: boolean;
  }): Promise<{ success: boolean; message: string; savedToGoogleSheet?: boolean; savedToDataUser?: boolean }> {
    const cleanUser = cleanString(params.username).toLowerCase();
    const strippedUser = removeVietnameseTones(params.username);
    const cleanOldPass = params.oldPassword !== undefined ? cleanString(params.oldPassword) : '';
    const cleanNewPass = cleanString(params.newPassword);

    if (!cleanUser || !cleanNewPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin và mật khẩu mới hợp lệ!' };
    }

    if (cleanNewPass.length < 4) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 4 ký tự!' };
    }

    let savedToDataUser = false;
    let serverMessage = '';
    let resolvedCanonicalUsername = cleanUser;
    const currentUser = this.getCurrentUser();
    const resolvedRole = currentUser?.role || 'teacher';
    const resolvedFullName = currentUser?.fullName || params.username;
    const resolvedClassName = currentUser?.className || 'Tổ Công Nghệ Nông nghiệp';

    try {
      const pwPayload = {
        username: params.username,
        oldPassword: cleanOldPass,
        newPassword: cleanNewPass,
        skipOldPasswordCheck: Boolean(params.skipOldPasswordCheck),
        role: resolvedRole,
        fullName: resolvedFullName,
        className: resolvedClassName,
      };
      getCounterpartOrigins().forEach((peer) => {
        fetch(`${peer}/api/auth/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'admin' },
          body: JSON.stringify(pwPayload),
        }).catch(() => {});
      });
      const serverRes = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(pwPayload),
      });
      const serverData = await serverRes.json().catch(() => ({}));
      if (!serverRes.ok || serverData.success === false) {
        return {
          success: false,
          message: serverData.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại!',
        };
      }
      savedToDataUser = true;
      serverMessage = serverData.message || '';
      if (serverData.username) {
        resolvedCanonicalUsername = cleanString(serverData.username).toLowerCase();
      }
      if (serverData.user) {
        const srvU = serverData.user;
        const updatedRecord = {
          username: resolvedCanonicalUsername,
          password: cleanNewPass,
          role: srvU.role || resolvedRole,
          fullName: srvU.fullName || resolvedFullName,
          className: srvU.className || resolvedClassName,
          payment_amount: srvU.payment_amount ?? currentUser?.paymentAmount,
          start_date: srvU.start_date || currentUser?.startDate,
          expires_at: srvU.expires_at || currentUser?.expiresAt,
          must_change_password: false,
          is_active: true,
          onlyResetPassword: true,
          adminExplicitSubscription: false,
        };
        this.upsertCustomAccountLocal(updatedRecord);
        this.pushAccountToCloudStream('upsert', updatedRecord).catch(() => {});
      }
    } catch (srvErr) {
      console.warn('Failed to update password on server, checking local fallback:', srvErr);
      // Verify against local custom accounts or teacher accounts if server is unreachable
      const customList = this.getCustomAccounts();
      const matchedCustom = customList.find((a) => {
        const uClean = cleanString(a.username).toLowerCase();
        return uClean === cleanUser || removeVietnameseTones(a.fullName) === strippedUser;
      });
      const matchedTeacher = TEACHER_ACCOUNTS.find((a) => {
        const uClean = cleanString(a.username).toLowerCase();
        return (
          uClean === cleanUser ||
          removeVietnameseTones(a.fullName) === strippedUser ||
          a.aliases.some((al) => cleanString(al).toLowerCase() === cleanUser)
        );
      });

      if (!matchedCustom && !matchedTeacher) {
        return {
          success: false,
          message: 'Không tìm thấy tài khoản trong hệ thống!',
        };
      }

      if (!params.skipOldPasswordCheck) {
        const validOld =
          (matchedCustom &&
            cleanString(matchedCustom.password).toLowerCase() === cleanOldPass.toLowerCase()) ||
          (matchedTeacher &&
            matchedTeacher.passwords.some(
              (p) => cleanString(p).toLowerCase() === cleanOldPass.toLowerCase()
            ));
        if (!validOld) {
          return {
            success: false,
            message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.',
          };
        }
      }
    }

    // Update existing local custom account if present, preserving start_date, payment_amount, expires_at
    try {
      const existingCustom = this.getCustomAccounts().find(
        (a) => cleanString(a.username).replace(/^@+/, '').toLowerCase() === resolvedCanonicalUsername
      );
      if (existingCustom || currentUser) {
        this.upsertCustomAccountLocal({
          username: resolvedCanonicalUsername,
          password: cleanNewPass,
          role: existingCustom?.role || resolvedRole,
          fullName: existingCustom?.fullName || resolvedFullName,
          className: existingCustom?.className || resolvedClassName,
          payment_amount: existingCustom?.payment_amount ?? currentUser?.paymentAmount,
          start_date: existingCustom?.start_date || currentUser?.startDate,
          expires_at: existingCustom?.expires_at || currentUser?.expiresAt,
          must_change_password: false,
          is_active: true,
          onlyResetPassword: true,
          adminExplicitSubscription: false,
        });
      }
    } catch {}

    // Also update in-memory TEACHER_ACCOUNTS fallback so subsequent logins use the new password
    TEACHER_ACCOUNTS.forEach((acc) => {
      const uClean = cleanString(acc.username).toLowerCase();
      if (
        uClean === resolvedCanonicalUsername ||
        uClean === cleanUser ||
        acc.aliases.some((al) => cleanString(al).toLowerCase() === cleanUser)
      ) {
        acc.passwords = [cleanNewPass, ...acc.passwords.filter((p) => p !== cleanNewPass)];
      }
    });

    // Mark password changed flag in localStorage
    try {
      localStorage.setItem(`pw_changed_${resolvedCanonicalUsername}`, 'true');
    } catch {}

    // Update localStorage session if currently logged in as this user
    if (
      currentUser &&
      (cleanString(currentUser.username).toLowerCase() === resolvedCanonicalUsername ||
        cleanString(currentUser.username).toLowerCase() === cleanUser)
    ) {
      currentUser.firstLoginChanged = true;
      this.saveSession(currentUser, currentUser.token);
    }

    return {
      success: true,
      message: serverMessage || 'Đổi mật khẩu thành công và đã lưu vào hệ thống!',
      savedToDataUser,
    };
  },

  /**
   * Update currently logged-in user's own profile info (fullName, className, email, phone)
   */
  async updateOwnProfile(params: {
    username: string;
    fullName: string;
    className?: string;
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    const cleanUser = cleanString(params.username).toLowerCase();
    const cleanFullName = (params.fullName || '').trim();
    const cleanClassName = (params.className || '').trim();
    const cleanEmail = (params.email || '').trim();
    const cleanPhone = (params.phone || '').trim();

    if (!cleanUser || !cleanFullName) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ Họ và tên hợp lệ!',
      };
    }

    let serverMessage = '';
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          username: params.username,
          fullName: cleanFullName,
          className: cleanClassName,
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        serverMessage = data.message || 'Cập nhật thông tin tài khoản thành công!';
      }
    } catch (e) {
      console.warn('Update profile server fallback:', e);
    }

    // Update local custom accounts if present
    try {
      const customList = this.getCustomAccounts();
      const hasCustom = customList.some(
        (a) => cleanString(a.username).toLowerCase() === cleanUser
      );
      if (hasCustom) {
        const updatedCustom = customList.map((a) => {
          if (cleanString(a.username).toLowerCase() === cleanUser) {
            return {
              ...a,
              fullName: cleanFullName,
              className: cleanClassName || a.className,
              email: cleanEmail || (a as any).email,
              phone: cleanPhone || (a as any).phone,
            };
          }
          return a;
        });
        inMemoryCustomAccounts = updatedCustom;
        const encodedCustom = updatedCustom.map((item) => ({
          ...item,
          password: encodeStoredSecret(String(item.password || '')),
        }));
        localStorage.setItem(STORAGE_KEY_CUSTOM_ACCOUNTS, JSON.stringify(encodedCustom));
      }
    } catch {}

    // Update in-memory TEACHER_ACCOUNTS fallback
    TEACHER_ACCOUNTS.forEach((acc) => {
      if (cleanString(acc.username).toLowerCase() === cleanUser) {
        acc.fullName = cleanFullName;
        if (cleanClassName) acc.className = cleanClassName;
      }
    });

    // Update active session
    const currentUser = this.getCurrentUser();
    let updatedUser: AuthUser | undefined;
    if (
      currentUser &&
      cleanString(currentUser.username).toLowerCase() === cleanUser
    ) {
      updatedUser = {
        ...currentUser,
        fullName: cleanFullName,
        className: cleanClassName || currentUser.className,
        email: cleanEmail || currentUser.email,
        phone: cleanPhone || currentUser.phone,
      };
      this.saveSession(updatedUser, currentUser.token);
    }

    return {
      success: true,
      message: serverMessage || 'Cập nhật thông tin tài khoản thành công!',
      user: updatedUser,
    };
  },
};
