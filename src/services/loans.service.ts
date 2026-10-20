import { supabase } from '../lib/supabase';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RENEWED' | 'CANCELLED';

export interface BookReference {
  id: string;
  openLibraryKey: string;
  title: string;
  authorName: string[];
  coverId: number;
  subject: string[];
  language: string;
  totalCopies: number;
  availableCopies: number;
}

export interface Loan {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  bookReferenceId: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  renewalCount: number;
  maxRenewals: number;
  notes?: string;
  bookReference?: BookReference;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanPayload {
  bookReferenceId?: string;
  bookDetails?: {
    openLibraryKey: string;
    title: string;
    authorName: string[];
    coverId: number;
    subject: string[];
    language: string;
    totalCopies?: number;
  };
  notes?: string;
}

export interface LoanStatisticsSummary {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  renewedLoans: number;
  averageLoanDurationDays: number;
}

interface RawBookReference {
  id: string;
  open_library_key: string;
  title: string;
  author_name?: string[] | null;
  cover_id?: number | null;
  subject?: string[] | null;
  language?: string | null;
  total_copies?: number | null;
  available_copies?: number | null;
}

interface RawLoan {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  book_reference_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
  renewal_count?: number | null;
  max_renewals?: number | null;
  notes?: string | null;
  book_reference?: RawBookReference | null;
  created_at: string;
  updated_at: string;
}

function mapBookReference(raw: RawBookReference | null | undefined): BookReference | undefined {
  if (!raw) return undefined;
  return {
    id: raw.id,
    openLibraryKey: raw.open_library_key,
    title: raw.title,
    authorName: raw.author_name || [],
    coverId: raw.cover_id || 0,
    subject: raw.subject || [],
    language: raw.language || 'eng',
    totalCopies: raw.total_copies ?? 1,
    availableCopies: raw.available_copies ?? 0,
  };
}

function mapLoan(raw: RawLoan): Loan {
  return {
    id: raw.id,
    userId: raw.user_id,
    userEmail: raw.user_email,
    userName: raw.user_name,
    bookReferenceId: raw.book_reference_id,
    loanDate: raw.loan_date,
    dueDate: raw.due_date,
    returnDate: raw.return_date,
    status: raw.status,
    renewalCount: raw.renewal_count ?? 0,
    maxRenewals: raw.max_renewals ?? 2,
    notes: raw.notes ?? undefined,
    bookReference: mapBookReference(raw.book_reference),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const RENTAL_STORAGE_KEY = 'librux_active_rentals';
const rentalStatusCache = new Map<string, boolean>();
const pendingChecks = new Map<string, Promise<boolean>>();

function normalizeKey(key: string): string {
  return String(key).replace('/works/', '').trim();
}

function getStoredRentedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(RENTAL_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(normalizeKey));
    }
  } catch {
    return new Set();
  }
  return new Set();
}

function persistRentedKeys(keys: Set<string>): void {
  try {
    localStorage.setItem(RENTAL_STORAGE_KEY, JSON.stringify(Array.from(keys)));
  } catch {
    console.error("Error at persistRentedKeys");
  }
}

async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH';
    body?: unknown;
    queryParams?: Record<string, string>;
  } = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authenticated session');
  }

  const url = new URL(`${SUPABASE_URL}/functions/v1/${functionName}`);

  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_KEY,
    },
  };

  if (options.body !== undefined && options.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP Error ${response.status}`);
  }

  return data as T;
}

export const loansService = {
  isBookRentedSync(openLibraryKey: string): boolean {
    const cleanKey = normalizeKey(openLibraryKey);
    if (rentalStatusCache.has(cleanKey)) {
      return Boolean(rentalStatusCache.get(cleanKey));
    }
    const stored = getStoredRentedKeys();
    return stored.has(cleanKey);
  },

  async fetchAllRentedBooks(): Promise<string[]> {
    try {
      const { data: rpcKeys, error: rpcError } = await supabase.rpc('get_rented_book_keys');
      if (!rpcError && Array.isArray(rpcKeys)) {
        const keys = rpcKeys.map((item: { open_library_key: string }) => normalizeKey(item.open_library_key));
        keys.forEach((k) => loansService.markBookRented(k));
        return keys;
      }

      const { data: references, error: refError } = await supabase
        .from('book_references')
        .select('open_library_key, available_copies, total_copies');

      if (!refError && Array.isArray(references)) {
        const keys: string[] = [];
        references.forEach((ref) => {
          const available = ref.available_copies ?? 0;
          const total = ref.total_copies ?? 1;
          if (available <= 0 || available < total) {
            const cleanKey = normalizeKey(ref.open_library_key);
            loansService.markBookRented(cleanKey);
            keys.push(cleanKey);
          }
        });
        return keys;
      }
    } catch {
      console.error("Error at fetchAllRentedBooks");
    }
    return [];
  },

  async isBookRented(openLibraryKey: string): Promise<boolean> {
    const cleanKey = normalizeKey(openLibraryKey);
    if (!cleanKey) return false;

    if (pendingChecks.has(cleanKey)) {
      return pendingChecks.get(cleanKey)!;
    }

    const checkPromise = (async () => {
      try {
        const { data: isRentedRpc, error: rpcError } = await supabase.rpc('check_book_rental_status', {
          p_open_library_key: cleanKey,
        });

        if (!rpcError && typeof isRentedRpc === 'boolean') {
          if (isRentedRpc) {
            loansService.markBookRented(cleanKey);
            return true;
          }
        }

        const { data: references, error: refError } = await supabase
          .from('book_references')
          .select('open_library_key, available_copies, total_copies')
          .or(`open_library_key.eq.${cleanKey},open_library_key.eq./works/${cleanKey}`)
          .limit(1);

        if (!refError && references && references.length > 0) {
          const ref = references[0];
          const available = ref.available_copies ?? 0;
          const total = ref.total_copies ?? 1;
          if (available <= 0 || available < total) {
            loansService.markBookRented(cleanKey);
            return true;
          }
        }

        interface ActiveLoanItem {
          id: string;
          status: LoanStatus;
          book_reference: { open_library_key: string } | null;
        }

        const { data: activeLoans, error: loanError } = await supabase
          .from('loans')
          .select('id, status, book_reference:book_references(open_library_key)')
          .in('status', ['ACTIVE', 'RENEWED', 'OVERDUE']);

        if (!loanError && activeLoans) {
          const typedLoans = activeLoans as unknown as ActiveLoanItem[];
          const hasLoan = typedLoans.some((item) => {
            const bookKey = item.book_reference?.open_library_key;
            return bookKey && normalizeKey(bookKey) === cleanKey;
          });

          if (hasLoan) {
            loansService.markBookRented(cleanKey);
            return true;
          }
        }

        if (references && references.length > 0) {
          const ref = references[0];
          const available = ref.available_copies ?? 0;
          const total = ref.total_copies ?? 1;
          if (available > 0 && available >= total) {
            loansService.markBookAvailable(cleanKey);
            return false;
          }
        }

        return loansService.isBookRentedSync(cleanKey);
      } catch {
        return loansService.isBookRentedSync(cleanKey);
      } finally {
        pendingChecks.delete(cleanKey);
      }
    })();

    pendingChecks.set(cleanKey, checkPromise);
    return checkPromise;
  },

  markBookRented(openLibraryKey: string): void {
    const cleanKey = normalizeKey(openLibraryKey);
    if (!cleanKey) return;
    rentalStatusCache.set(cleanKey, true);
    const stored = getStoredRentedKeys();
    stored.add(cleanKey);
    persistRentedKeys(stored);

    window.dispatchEvent(
      new CustomEvent('librux:rental-change', {
        detail: { openLibraryKey: cleanKey, isRented: true },
      })
    );
  },

  markBookAvailable(openLibraryKey: string): void {
    const cleanKey = normalizeKey(openLibraryKey);
    if (!cleanKey) return;
    rentalStatusCache.set(cleanKey, false);
    const stored = getStoredRentedKeys();
    stored.delete(cleanKey);
    persistRentedKeys(stored);

    window.dispatchEvent(
      new CustomEvent('librux:rental-change', {
        detail: { openLibraryKey: cleanKey, isRented: false },
      })
    );
  },

  subscribeToRentalChanges(
    openLibraryKey: string,
    callback: (isRented: boolean) => void
  ): () => void {
    const cleanKey = normalizeKey(openLibraryKey);

    const handleCustomEvent = (event: Event) => {
      const custom = event as CustomEvent<{ openLibraryKey: string; isRented: boolean }>;
      if (custom.detail && normalizeKey(custom.detail.openLibraryKey) === cleanKey) {
        callback(custom.detail.isRented);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === RENTAL_STORAGE_KEY) {
        const stored = getStoredRentedKeys();
        callback(stored.has(cleanKey));
      }
    };

    window.addEventListener('librux:rental-change', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('librux:rental-change', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  },

  async getUserLoans(status?: LoanStatus, page: number = 1, limit: number = 10) {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (status) {
      queryParams.status = status;
    }

    const res = await invokeEdgeFunction<{ data: RawLoan[]; meta: unknown }>('loans-list', {
      method: 'GET',
      queryParams,
    });

    const mapped = (res.data || []).map(mapLoan);
    mapped.forEach((loan) => {
      if (loan.bookReference?.openLibraryKey && (loan.status === 'ACTIVE' || loan.status === 'RENEWED' || loan.status === 'OVERDUE')) {
        loansService.markBookRented(loan.bookReference.openLibraryKey);
      }
    });

    return {
      data: mapped,
      meta: res.meta,
    };
  },

  async createLoan(payload: CreateLoanPayload) {
    const requestedKey = normalizeKey(payload.bookDetails?.openLibraryKey || '');
    const res = await invokeEdgeFunction<{ data: RawLoan }>('loans-create', {
      body: {
        ...payload,
        bookDetails: payload.bookDetails
          ? {
              ...payload.bookDetails,
              totalCopies: 1,
            }
          : undefined,
      },
    });

    const loan = mapLoan(res.data);
    const key = loan.bookReference?.openLibraryKey || requestedKey;
    if (key) {
      const cleanKey = normalizeKey(key);
      loansService.markBookRented(cleanKey);
      try {
        await supabase
          .from('book_references')
          .update({ available_copies: 0 })
          .or(`open_library_key.eq.${cleanKey},open_library_key.eq./works/${cleanKey}`);
      } catch {
        console.error("Error at createLoan update available copies");
      }
    }

    return loan;
  },

  async returnLoan(loanId: string) {
    const res = await invokeEdgeFunction<{ data: RawLoan }>('loans-return', {
      body: { loanId },
    });
    const loan = mapLoan(res.data);
    const key = loan.bookReference?.openLibraryKey;
    if (key) {
      loansService.markBookAvailable(key);
      try {
        const cleanKey = normalizeKey(key);
        await supabase
          .from('book_references')
          .update({ available_copies: 1 })
          .or(`open_library_key.eq.${cleanKey},open_library_key.eq./works/${cleanKey}`);
      } catch {
        console.error("Error at returnLoan update available copies");
      }
    }
    return loan;
  },

  async renewLoan(loanId: string, additionalDays: number = 7) {
    const res = await invokeEdgeFunction<{ data: RawLoan }>('loans-renew', {
      body: { loanId, additionalDays },
    });
    return mapLoan(res.data);
  },

  async cancelLoan(loanId: string, reason?: string) {
    const res = await invokeEdgeFunction<{ data: RawLoan }>('loans-cancel', {
      body: { loanId, reason },
    });
    const loan = mapLoan(res.data);
    const key = loan.bookReference?.openLibraryKey;
    if (key) {
      loansService.markBookAvailable(key);
      try {
        const cleanKey = normalizeKey(key);
        await supabase
          .from('book_references')
          .update({ available_copies: 1 })
          .or(`open_library_key.eq.${cleanKey},open_library_key.eq./works/${cleanKey}`);
      } catch {
        console.error("Error at cancelLoan update available copies");
      }
    }
    return loan;
  },

  async getStatisticsSummary(): Promise<LoanStatisticsSummary> {
    const res = await invokeEdgeFunction<{ data: LoanStatisticsSummary }>('loans-statistics', {
      body: {},
    });
    return res.data;
  },
};
