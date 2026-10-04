import { BookList } from "../../components/BookList/BookList";
import { FiltersComponent } from "../../components/FiltersComponent/FiltersComponent";
import "./BooksPage.scss";


export default function BooksPage() {
    return (
        <div className="container-books-page">
            <FiltersComponent />
            <BookList />
        </div>
    );
}