import { Link } from 'react-router-dom';
import "./notFound.css";

export default function NotFound() {
    return (
        <div className="not-found-container">
            <h1 className="not-found-head">Page Not Found.</h1>
            <Link className="not-found-link" to="/">
                <button>Go Home</button>
            </Link>
        </div>
    )
}