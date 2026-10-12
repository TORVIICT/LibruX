import { useState, useEffect } from "react";
import "./Dashboard.scss";
import { loansService } from "../../services/loans.service";
import type { Loan, LoanStatisticsSummary } from "../../services/loans.service";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [loansData, statsData] = await Promise.all([
          loansService.getUserLoans(),
          loansService.getStatisticsSummary().catch(() => null),
        ]);
        setLoans(loansData.data || []);
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "User";
  const activeLoansCount = stats?.activeLoans ?? loans.filter(l => l.status === 'ACTIVE' || l.status === 'RENEWED').length;

  return (
    <main className="dashboard-page">
      <section className="quick-stats">
        <h1>Welcome {userName}!</h1>
        <p>You have {activeLoansCount} active books lent</p>
      </section>

      <section className="metrics">
        <article className="metric-all-books">
          <div className="title-img-metric">
            <h3>Total loans</h3>
            <span className="material-symbols-outlined">book_ribbon</span>
          </div>
          <p>{stats?.totalLoans ?? loans.length}</p>
        </article>
        <article className="metric-reading-in-progress">
          <div className="title-img-metric">
            <h3>Renewed</h3>
            <span className="material-symbols-outlined">seat_read</span>
          </div>
          <p>{stats?.renewedLoans ?? 0}</p>
        </article>
        <article className="metric-loan-books">
          <div className="title-img-metric">
            <h3>Active loans</h3>
            <span className="material-symbols-outlined">bookmark_stacks</span>
          </div>
          <p>{activeLoansCount}</p>
        </article>
        <article className="metric-goal-progress">
          <div className="title-img-metric">
            <h3>Overdue</h3>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <p>{stats?.overdueLoans ?? 0}</p>
          <progress className="book-goal" value={stats?.overdueLoans || 0} max="5"></progress>
        </article>
      </section>

      <section className="workspace">
        <div className="list-of-loan-books">
          <div className="list-of-loan-books-header">
            <div className="list-of-loan-books-header-info">
              <h3>Loan Management</h3>
              <p>Tracking of physical copies under external custody</p>
            </div>
            <span className="active-loans-count">{activeLoansCount} active loans</span>
          </div>

          <div className="list-of-loan-books-body">
            {loading ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>Loading your loans...</p>
            ) : loans.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>No active or past loans found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Date of loan</th>
                    <th>Limit date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.bookReference?.title || "Book Reference"}</td>
                      <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                      <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${loan.status.toLowerCase()}`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="library-insights">
          <div className="library-insights-header">
            <div className="library-insights-header-info">
              <span className="material-symbols-outlined">add_diamond</span>
              <h3>New acquisitions</h3>
            </div>
            <span className="insights-badge">newly admitted</span>
          </div>
          <div className="library-insights-body">
            <ul className="acquisitions-list">
              <li className="acquisition-item">
                <div className="acquisition-avatar" style={{ backgroundColor: '#1a3a2a' }}>AI</div>
                <div className="acquisition-info">
                  <h4>Deep Learning Práctica</h4>
                  <p className="acquisition-author">Ian Goodfellow et al.</p>
                  <p className="acquisition-meta">Físico • Stand C-01</p>
                </div>
                <button className="bookmark-btn">
                  <span className="material-symbols-outlined">bookmark</span>
                </button>
              </li>
              <li className="acquisition-item">
                <div className="acquisition-avatar" style={{ backgroundColor: '#2d4a3e' }}>ST</div>
                <div className="acquisition-info">
                  <h4>El Futuro de la IA Sim</h4>
                  <p className="acquisition-author">K. Henderson</p>
                  <p className="acquisition-meta">ePub • Digital Ready</p>
                </div>
                <button className="bookmark-btn">
                  <span className="material-symbols-outlined">bookmark</span>
                </button>
              </li>
              <li className="acquisition-item">
                <div className="acquisition-avatar" style={{ backgroundColor: '#1a3a2a' }}>KR</div>
                <div className="acquisition-info">
                  <h4>Kafka: Guía de Arquitectura</h4>
                  <p className="acquisition-author">G. Shapira</p>
                  <p className="acquisition-meta">Físico • Stand E-09</p>
                </div>
                <button className="bookmark-btn">
                  <span className="material-symbols-outlined">bookmark</span>
                </button>
              </li>
            </ul>
          </div>
          <button className="explore-catalog-btn">
            Explorar catálogo completo
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>
    </main>
  );
}