import { useState, useEffect, useMemo } from "react";
import "./Dashboard.scss";
import { loansService } from "../../services/loans.service";
import type { Loan, LoanStatisticsSummary } from "../../services/loans.service";
import { useAuth } from "../../context/AuthContext";
import NewAcquisitions from "../../components/NewAcquisitions/NewAcquisitions";
import ListLoanBooks from "../../components/ListLoanBooks/ListLoanBooks";
import Metrics from "../../components/Metrics/Metrics";

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
  const activeLoansCount = useMemo(() => {
    return stats?.activeLoans ?? loans.filter(l => l.status === 'ACTIVE' || l.status === 'RENEWED').length;
  }, [stats, loans]);

  return (
    <main className="dashboard-page">

      <section className="quick-stats">
        <h1>Welcome {userName}!</h1>
        <p>You have {activeLoansCount} active books lent</p>
      </section>

      <Metrics stats={stats} loans={loans} activeLoansCount={activeLoansCount} />

      <section className="workspace">

        <ListLoanBooks loans={loans} loading={loading} activeLoansCount={activeLoansCount} />

        <NewAcquisitions />

      </section>
    </main>
  );
}