

export default function Pagination() {
    return (
        <div className="pagination">
            <button className="prev-button">
                <span className="material-symbols-outlined">arrow_back</span> Previous
            </button>
            <span className="page-number">1 of 10</span> 
            <button className="next-button">
                Next <span className="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>
    );
}