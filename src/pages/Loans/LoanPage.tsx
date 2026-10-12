import { useState, useEffect } from "react";
import "./LoanPage.scss";
import { loansService } from "../../services/loans.service";
import type { Loan, LoanStatus } from "../../services/loans.service";

export default function LoanPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchLoans = async (statusFilter?: string) => {
    try {
      setLoading(true);
      const filter = statusFilter === "ALL" ? undefined : (statusFilter as LoanStatus);
      const res = await loansService.getUserLoans(filter);
      setLoans(res.data || []);
    } catch (err: any) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(activeFilter);
  }, [activeFilter]);

  const handleReturn = async (loanId: string) => {
    try {
      await loansService.returnLoan(loanId);
      setActionMessage("Book successfully returned!");
      setTimeout(() => setActionMessage(null), 3000);
      fetchLoans(activeFilter);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRenew = async (loanId: string) => {
    try {
      await loansService.renewLoan(loanId, 7);
      setActionMessage("Loan renewed for 7 additional days!");
      setTimeout(() => setActionMessage(null), 3000);
      fetchLoans(activeFilter);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancel = async (loanId: string) => {
    if (!confirm("Are you sure you want to cancel this loan?")) return;
    try {
      await loansService.cancelLoan(loanId, "Cancelled by user");
      setActionMessage("Loan cancelled.");
      setTimeout(() => setActionMessage(null), 3000);
      fetchLoans(activeFilter);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <main className="loan-page">
      <div className="loan-page-header">
        <h1>My Book Loans</h1>
        <p>Manage your active, returned, and renewed physical book loans</p>
      </div>

      {actionMessage && (
        <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {actionMessage}
        </div>
      )}

      <div className="loan-filters">
        {["ALL", "ACTIVE", "RENEWED", "RETURNED", "OVERDUE", "CANCELLED"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${activeFilter === f ? "active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="loan-table-container">
        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center" }}>Loading loans...</p>
        ) : loans.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center" }}>No loans found for this status.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrowed Date</th>
                <th>Limit Date</th>
                <th>Status</th>
                <th>Renewals</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const coverUrl = loan.bookReference?.coverId
                  ? `https://covers.openlibrary.org/b/id/${loan.bookReference.coverId}-S.jpg`
                  : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&q=80";

                const isCanRenew = (loan.status === "ACTIVE" || loan.status === "RENEWED") && loan.renewalCount < loan.maxRenewals;
                const isCanReturn = loan.status === "ACTIVE" || loan.status === "RENEWED" || loan.status === "OVERDUE";
                const isCanCancel = loan.status === "ACTIVE" || loan.status === "RENEWED";

                return (
                  <tr key={loan.id}>
                    <td>
                      <div className="book-info-cell">
                        <img src={coverUrl} alt={loan.bookReference?.title} />
                        <div>
                          <p className="book-title">{loan.bookReference?.title || "Book"}</p>
                          <p className="book-author">
                            {loan.bookReference?.authorName?.join(", ") || "Unknown Author"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${loan.status.toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>{loan.renewalCount} / {loan.maxRenewals}</td>
                    <td>
                      <div className="action-btns">
                        {isCanRenew && (
                          <button className="btn-renew" onClick={() => handleRenew(loan.id)}>
                            <span className="material-symbols-outlined">autorenew</span>
                            Renew
                          </button>
                        )}
                        {isCanReturn && (
                          <button className="btn-return" onClick={() => handleReturn(loan.id)}>
                            <span className="material-symbols-outlined">assignment_returned</span>
                            Return
                          </button>
                        )}
                        {isCanCancel && (
                          <button className="btn-cancel" onClick={() => handleCancel(loan.id)}>
                            <span className="material-symbols-outlined">cancel</span>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}