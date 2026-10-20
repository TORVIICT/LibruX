import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import Layout from "../components/layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { SuspenseFallback } from "../components/SuspenseFallback/SuspenseFallback";

const Authentication = lazy(() => import("../pages/Authentication/Authentication"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const BooksPage = lazy(() => import("../pages/AllBooksPage/BooksPage"));
const BookPage = lazy(() => import("../pages/BookPage/BookPage"));
const LoanPage = lazy(() => import("../pages/Loans/LoanPage"));
const FavoriteBooksPage = lazy(() => import("../pages/FavoriteBooksPage/FavoriteBooksPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage/NotFoundPage"));

export const AppRoutes = () => {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<Authentication />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/books" element={<BooksPage />} />
                        <Route path="/books/:bookId" element={<BookPage />} />
                        <Route path="/loans" element={<LoanPage />} />
                        <Route path="/saved-books" element={<FavoriteBooksPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};
