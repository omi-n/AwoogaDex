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
    const [mangaArray, setMangaArray] = useState([]);
    // TODO: ADD A REQUEST ON MOUNT THAT QUERIES FOR A COUPLE EMPTY MANGAS TO FILL SPACE
    // TODO: ADD A FILTER BY TAG OPTION
    async function sendSearchRequest(e) {
        e.preventDefault();

        await axios({
            method: "GET",
            url: "https://api.mangadex.org/manga", // https://api.mangadex.org/manga
            params: {
                limit: 50,
                title: mangaTitle,
                contentRating: ["safe"]
            }
        }).then(response => {
            let responseArr = response.data.results;
            /* 
                Structure of the response: 
                    responseArr[i].relationships:
                        [0]: Author ID
                        [1]: Artist ID
                        [2]: Cover Art ID
                    responseArr[i].data:
                        id: Manga ID
                        attributes:
                            title: JP Title
                            title.en: EN Title
                            description: Description
            */
            let mangas = [];
            for (let i = 0; i < responseArr.length; i++) {
                mangas.push({
                    title: responseArr[i].data.attributes.title.en,
                    authorID: responseArr[i].relationships[0].id,
                    artistID: responseArr[i].relationships[1].id,
                    description: responseArr[i].data.attributes.description.en.toString().substring(0, 300).concat("..."),
                    coverArtID: responseArr[i].relationships[2].id
                });
            }
            setMangaArray(mangas);
        }).catch(err => {
            console.error(err);
            setError(true);
        });
    }

    function clearError() {
        setError(false);
    }

    return (<>
        <div className="manga-search-container">
            <form onSubmit={sendSearchRequest}>
                <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => setMangaTitle(e.target.value)} id="manga-search" placeholder="Search By Title!" />
                {/* TODO: ADD SEARCH BUTTON TO MOBILE ONLY */}
                {/* <button type="submit" id="submit">asd</button> */}
            </form>
        </div>

        <div className="search-results">
            <MangaList mangaArray={mangaArray} />
            {error ? <p className="submit-error">An error has ocurred! Check console for more details. <button onClick={clearError}><strong>Clear</strong></button></p> : <></>}
        </div>
    </>)
}

function MangaList(props) {
    const mangas = props.mangaArray;
    // console.log(mangas);
    return (
        <ul>
            {mangas && mangas.map(manga => <MangaCard key={manga.title} manga={manga} />)}
        </ul>
    )
}

function MangaCard(props) {
    let {
        title,
        authorID,
        artistID,
        description,
        coverArtID
    } = props.manga;
    return (
        <div className="manga-card">
            <p>{title}</p>
            <p>{description}</p>
            {/* <p>Author ID: {authorID}</p>
            <p>Artist ID: {artistID}</p>
            <p>Cover Art ID: {coverArtID}</p> */}
        </div>
    )
}

