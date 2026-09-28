import "./Dashboard.scss";

export default function Dashboard() {
  return (
    <main className="dashboard-page">
      <section className="quick-stats">
        <h1>Welcome {localStorage.getItem("user-name")}!</h1>
        <p>You have {localStorage.getItem("user-books") || 0} books lent</p>
      </section>
      <section className="metrics">
        <article className="metric-all-books">
          <div className="title-img-metric">
            <h3>All books</h3>
            <span className="material-symbols-outlined">book_ribbon</span>
          </div>
          <p>12321</p>
        </article>
        <article className="metric-reading-in-progress">
          <div className="title-img-metric">
            <h3>Reading in progress</h3>
            <span className="material-symbols-outlined">seat_read</span>
          </div>
          <p>5</p>
        </article>
        <article className="metric-loan-books">
          <div className="title-img-metric">
            <h3>Active loans</h3>
            <span className="material-symbols-outlined">bookmark_stacks</span>
          </div>
          <p>40</p>
        </article>
        <article className="metric-goal-progress">
          <div className="title-img-metric">
            <h3>Book goal</h3>
            <span className="material-symbols-outlined">flag</span>
          </div>
          <p>50/50</p>
          <progress className="book-goal" value="20" max="50"></progress>
        </article>
      </section>


      <section className="workspace">


        <div className="list-of-loan-books">

          <div className="list-of-loan-books-header">
            <div className="list-of-loan-books-header-info">
              <h3>Loan Management</h3>
              <p>Tracking of physical copies under external custody</p>
            </div>
            <span className="active-loans-count">40 active loans</span>
          </div>

          <div className="list-of-loan-books-body">
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
                <tr>
                  <td>Book 1</td>
                  <td>12/12/2022</td>
                  <td>19/12/2022</td>
                  <td>Available</td>
                </tr>
                <tr>
                  <td>Book 2</td>
                  <td>13/12/2022</td>
                  <td>19/12/2022</td>
                  <td>Borrowed</td>
                </tr>
              </tbody>
            </table>
          </div>


        </div>


        <div className="library-insights">
          <h2>Library insights</h2>
        </div>


      </section>




    </main>
  );
}