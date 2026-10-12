import './ListLoanBooks.scss'

export default function ListLoanBooks({loans, loading, activeLoansCount}) {
    return (
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
    );
}