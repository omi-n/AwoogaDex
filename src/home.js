import "./home.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const axios = require("axios");
require('dotenv').config();
const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';

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
                <p id="header-desc">Uses the <a href="https://api.mangadex.org/docs.html" target="_blank" rel="noreferrer">MangaDex API</a>.</p>
            </div>
        </div>
    )
}

function SearchManga() {
    const [mangaTitle, setMangaTitle] = useState("");
    const [error, setError] = useState(false);
    const [mangaArray, setMangaArray] = useState([]);
    const [offset, setOffset] = useState(0);
    const [totalManga, setTotalManga] = useState(0);
    const limit = 10;
    const mangaBaseURL = `${baseURL}/manga?includes[]=cover_art`; // "https://api.mangadex.org/manga"

    // TODO: ADD A FILTER BY TAG OPTION

    /* Load some mangas as an example to the site */
    useEffect(() => {
        async function loadMangas(limit = 25, imgsize = 256, offset = 0) {
            await axios({
                method: "GET",
                url: mangaBaseURL, // https://api.mangadex.org/manga
                params: {
                    limit: limit,
                    title: mangaTitle,
                    contentRating: ["safe"],
                    offset: offset
                }
            }).then(response => {
                setMangaArray([]);
                setTotalManga(response.data.total);
                let responseArr = response.data.results;
                let coverIdx;
                let mangas = [];
                responseArr.forEach(response => {
                    let coverFoundStatus = false;
                    for (let j = 0; j < response.relationships.length; j++) {
                        if (response.relationships[j].type === "cover_art") {
                            coverIdx = j;
                            coverFoundStatus = true;
                        }
                    }
                    let mangaID = response.data.id;
                    let coverFileName;
                    if(coverFoundStatus)
                        coverFileName = response.relationships[coverIdx].attributes.fileName;
                    mangas.push({
                        title: response.data.attributes.title.en || "No Title Found.",
                        mangaID: response.data.id,
                        coverLink: (coverFoundStatus ? `https://uploads.mangadex.org/covers/${mangaID}/${coverFileName}.${imgsize}.jpg` : `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`),
                        description: response.data.attributes.description.en.toString().substring(0, 400).concat("..."),
                    });
                });

                mangas.forEach(manga => {
                    if (manga.description.length < 4) manga.description = "No Description Found.";
                });
                // console.log("response mangas: ", responseArr);
                // console.log("mangas: ", mangas)
                setMangaArray(mangas);
            }).catch(err => {
                console.error("error in manga list GET: ", err);
                setError(true);
            });
        }
        loadMangas(limit, 256, offset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset]);

    /* RE ADD IF THE SITE IS RATE LIMITED HARD ON PRODUCTION */
    async function sendSearchRequest(e, limit = 25, imgsize = 256) {
        e.preventDefault();

        await axios({
            method: "GET",
            url: mangaBaseURL, // https://api.mangadex.org/manga
            params: {
                limit: limit,
                title: mangaTitle,
                contentRating: ["safe"]
            }
        }).then(async response => {
            setMangaArray([])
            let responseArr = response.data.results;
            let coverFoundStatus = false;
            let coverIdx;
            let mangas = [];
            for (let i = 0; i < responseArr.length; i++) {
                for (let j = 0; j < responseArr[i].relationships.length; j++) {
                    if (responseArr[i].relationships[j].type === "cover_art") {
                        coverIdx = j;
                        coverFoundStatus = true;
                    }
                }
                mangas.push({
                    title: responseArr[i].data.attributes.title.en || "No Title Found.",
                    mangaID: responseArr[i].data.id,
                    coverLink: (coverFoundStatus ? `https://uploads.mangadex.org/covers/${responseArr[i].data.id}/${responseArr[i].relationships[coverIdx].attributes.fileName}.${imgsize}.jpg` : `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`),
                    description: responseArr[i].data.attributes.description.en.toString().substring(0, 400).concat("..."),
                });
            }

            for (let i = 0; i < mangas.length; i++) {
                if (mangas[i].description.length < 4) mangas[i].description = "No Description Found."
            }
            // console.log("response mangas: ", responseArr);
            // console.log("mangas: ", mangas)
            setMangaArray(mangas);
        }).catch(err => {
            console.error("error in manga list GET: ", err);
            setError(true);
        });
    }

    function clearError() {
        setError(false);
    }

    function incrementOffset() {
        let nearestOffsetMax = Math.ceil(totalManga / 25) * 25;
        if(offset === nearestOffsetMax - 25)
            return;
        else
            setOffset(offset + 25);
    }

    function decrementOffset() {
        if (offset >= 25)
            setOffset(offset - 25);
        if (offset < 25)
            return;
    }

    function resetOffset() {
        setOffset(0);
    }

    return (<>
        <div className="manga-search-container">
            <form onSubmit={sendSearchRequest}>
            <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => {
                setMangaTitle(e.target.value);
                setOffset(0);
            }} id="manga-search" placeholder="Search By Title!" />
            </form>
        </div>

        <div className="offset-container">
            <div className="offset-buttons-container">
                <button className="offset" id="prev" onClick={decrementOffset}>&lt;</button>
                <button className="offset" id="" onClick={resetOffset}>1</button>
                <button className="offset" id="next" onClick={incrementOffset}>&gt;</button>
            </div>
            <p className="submit-error">Page: {(offset + 25) / 25} / {Math.ceil(totalManga / 25)}</p>
        </div>

        <MangaList mangaArray={mangaArray} />

        <div className="offset-container">
            <p className="submit-error">Page: {(offset + 25) / 25} / {Math.ceil(totalManga / 25)}</p>
            <div className="offset-buttons-container">
                <button className="offset" id="prev" onClick={decrementOffset}>&lt;</button>
                <button className="offset" id="" onClick={resetOffset}>1</button>
                <button className="offset" id="next" onClick={incrementOffset}>&gt;</button>
            </div>
        </div>
        {error ? <p className="submit-error">An error has ocurred! Check console for more details. <button onClick={clearError}><strong>Clear</strong></button></p> : <></>}
    </>)
}

function MangaList(props) {
    const mangas = props.mangaArray;
    return (<>
        {(mangas.length > 0) ? mangas.map(manga => <MangaCard className="manga-card-i" key={manga.mangaID} manga={manga} />) : <p className="submit-error">Nothing found. Try another title?</p>}
    </>)
}

function MangaCard(props) {
    let {
        title,
        description,
        mangaID,
        coverLink
    } = props.manga;
    return (
        <Link to={`/manga/${mangaID}`}>
            <button className="manga-card">
                <img className="manga-img" src={coverLink} alt="cover" />
                <div className="manga-text-info">
                    <p className="manga-title" to={`/manga/${mangaID}`}><strong>{title}</strong></p>
                    <p className="manga-desc">{description}</p>
                </div>
            </button>
        </Link>
    )
}

