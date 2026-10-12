import { supabase } from '../lib/supabase';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'RENEWED' | 'CANCELLED';

// Interfaces con camelCase para mantener compatibilidad con los componentes existentes
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

// ─── Mapeo snake_case (Supabase) → camelCase (Frontend) ───

function mapBookReference(raw: any): BookReference | undefined {
  if (!raw) return undefined;
  return {
    id: raw.id,
    openLibraryKey: raw.open_library_key,
    title: raw.title,
    authorName: raw.author_name || [],
    coverId: raw.cover_id || 0,
    subject: raw.subject || [],
    language: raw.language || 'eng',
    totalCopies: raw.total_copies || 0,
    availableCopies: raw.available_copies || 0,
  };
}

function mapLoan(raw: any): Loan {
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
    notes: raw.notes,
    bookReference: mapBookReference(raw.book_reference),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Helper para invocar Edge Functions ───

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function invokeEdgeFunction<T = any>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH';
    body?: any;
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

  return data;
}

// ─── Servicio de Préstamos (Supabase Edge Functions) ───

export const loansService = {
  // 1. Obtener préstamos del usuario autenticado
  async getUserLoans(status?: LoanStatus, page: number = 1, limit: number = 10) {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (status) {
      queryParams.status = status;
    }

    const res = await invokeEdgeFunction<{ data: any[]; meta: any }>('loans-list', {
      method: 'GET',
      queryParams,
    });

    return {
      data: (res.data || []).map(mapLoan),
      meta: res.meta,
    };
  },

  // 2. Crear/solicitar un préstamo
  async createLoan(payload: CreateLoanPayload) {
    const res = await invokeEdgeFunction<{ data: any }>('loans-create', {
      body: payload,
    });
    return mapLoan(res.data);
  },

  // 3. Devolver un préstamo
  async returnLoan(loanId: string) {
    const res = await invokeEdgeFunction<{ data: any }>('loans-return', {
      body: { loanId },
    });
    return mapLoan(res.data);
  },

  // 4. Renovar un préstamo
  async renewLoan(loanId: string, additionalDays: number = 7) {
    const res = await invokeEdgeFunction<{ data: any }>('loans-renew', {
      body: { loanId, additionalDays },
    });
    return mapLoan(res.data);
  },

  // 5. Cancelar un préstamo
  async cancelLoan(loanId: string, reason?: string) {
    const res = await invokeEdgeFunction<{ data: any }>('loans-cancel', {
      body: { loanId, reason },
    });
    return mapLoan(res.data);
  },

  // 6. Obtener resumen de estadísticas
  async getStatisticsSummary(): Promise<LoanStatisticsSummary> {
    const res = await invokeEdgeFunction<{ data: LoanStatisticsSummary }>('loans-statistics', {
      body: {},
    });
    return res.data;
  },
};
