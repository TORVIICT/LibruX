import './Metrics.scss';
import type { Loan, LoanStatisticsSummary } from "../../services/loans.service";

interface MetricsProps {
    stats: LoanStatisticsSummary | null;
    loans: Loan[];
    activeLoansCount: number;
}

export default function Metrics({ stats, loans, activeLoansCount }: MetricsProps) {
    return (
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
    )
}