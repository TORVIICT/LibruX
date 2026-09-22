import {useParams} from "react-router";

export default function BookPage() {
    const {bookId} = useParams();
    return (
        <div>
            <h1>BookPage {bookId}</h1>
        </div>
    );
}