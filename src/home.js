import "./home.css";
import React, { useState } from "react";
const axios = require("axios");

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
        <div className="site-header-container">
            <div className="site-header">
                <h1 id="header-head">AwoogaDex</h1>
                <p id="header-desc">Get rid of all the excess features.</p>
            </div>
        </div>
    )
}

function SearchManga() {
    const [mangaTitle, setMangaTitle] = useState("");
    const [error, setError] = useState(false);
    let mangaArray = [];
    // TODO: ADD A REQUEST ON MOUNT THAT QUERIES FOR A COUPLE EMPTY MANGAS TO FILL SPACE
    // TODO: ADD A FILTER BY TAG OPTION

    const order = {
        updatedAt: 'asc'
    };
    async function sendSearchRequest(e) {
        e.preventDefault();

        await axios.get('https://api.mangadex.org/manga', {
            params: {
                limit: 50,
                title: mangaTitle,
                contentRating: ["safe"]
            }
        }).then(response => {
            let responseArr = response.data.results;
            console.log(responseArr);
        }).catch(err => {
            console.error(err);
            setError(true);
        });
    }

    function clearError() {
        setError(false);
    }

    return (
        <div className="manga-search-container">
            <form onSubmit={sendSearchRequest}>
                <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => setMangaTitle(e.target.value)} id="manga-search" placeholder="Search By Title!" />
                {/* TODO: ADD SEARCH BUTTON TO MOBILE ONLY */}
                {/* <button type="submit" id="submit">asd</button> */}
            </form>
            {error ? <p>An error has ocurred! Check console for more details. <button onClick={clearError}><strong>Clear</strong></button></p> : <></>}
        </div>
    )
}
