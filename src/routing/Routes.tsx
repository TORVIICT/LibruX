import { Routes, Route } from "react-router";
import Authentication from "../pages/Authentication/Authentication";
import Dashboard from "../pages/Dashboard/Dashboard";
import BookPage from "../pages/BookPage/BookPage";
import LoanPage from "../pages/Loans/LoanPage";
import BooksPage from "../pages/AllBooksPage/BooksPage";
import { useAuth } from "../context/AuthContext";

export const AppRoutes = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<Authentication />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books" element={<BooksPage />}>
                <Route path=":bookId" element={<BookPage />} />
            </Route>
            <Route path="/loans" element={<LoanPage />} />
        </Routes>
    );
};