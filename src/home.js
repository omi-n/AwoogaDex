import "./home.css";

export default function Home() {
    return (
        <div className="init-container">
            <SiteHeader />
            <SearchManga />
        </div>
    )
}

function SiteHeader() {
    return (
        <div className="site-header">
            <h1 id="header-head">AwoogaDex</h1>
            <p id="header-desc">Get rid of all the crap you don't need.</p>
        </div>
    )
}

function SearchManga() {
    return (
        <div className="manga-search-container">
            <form className="manga-submit" onSubmit="sendSearchRequest">
                <input type="text" id="manga-search" placeholder="Enter to submit" />
                <input type="submit" style={{ display: "none" }} />
                {/* <button type="submit">
                    <img id="search-img" src="https://img.icons8.com/material-outlined/24/000000/search--v1.png" alt="search icon" />
                </button> */}
            </form>
        </div>
    )
}
