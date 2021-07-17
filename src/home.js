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
    // TODO: ADD A REQUEST ON MOUNT THAT QUERIES FOR A COUPLE EMPTY MANGAS TO FILL SPACE

    async function sendSearchRequest(e) {
        e.preventDefault();

        const response = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                limit: 50,
                title: mangaTitle,
                contentRating: ["safe"]
            }
        }).catch(err => {
            console.error(err);
        });

        console.log(response.data.results);
    }
    return (
        <div className="manga-search-container">
            <form onSubmit={sendSearchRequest}>
                <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => setMangaTitle(e.target.value)} id="manga-search" placeholder="Search By Title!" />
                {/* TODO: ADD SEARCH BUTTON TO MOBILE ONLY */}
                {/* <button type="submit" id="submit">asd</button> */}
            </form>
            <p>{mangaTitle}</p>
        </div>
    )
}
