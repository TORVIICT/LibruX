import { Routes, Route } from "react-router";
import Authentication from "../pages/Authentication/Authentication";
import Dashboard from "../pages/Dashboard/Dashboard";
import BookPage from "../pages/BookPage/BookPage";
import LoanPage from "../pages/Loans/LoanPage";
import BooksPage from "../pages/AllBooksPage/BooksPage";
import Layout from "../components/layout/Layout";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import FavoriteBooksPage from "../pages/FavoriteBooksPage/FavoriteBooksPage";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Authentication />} />
            
            <Route element={<Layout />} >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/books" element={<BooksPage />}>
                    <Route path=":bookId" element={<BookPage />} />
                </Route>
                <Route path="/loans" element={<LoanPage />} />
                <Route path="/saved-books" element={<FavoriteBooksPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            
        </Routes>
    );
};