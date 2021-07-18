import "./home.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const axios = require("axios");
require('dotenv').config();

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
                <p id="header-desc">Can someone PLEASE tell me who joe is.</p>
            </div>
        </div>
    )
}

function SearchManga() {
    const [mangaTitle, setMangaTitle] = useState("");
    const [error, setError] = useState(false);
    const [mangaArray, setMangaArray] = useState([]);
    const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';
    const mangaBaseURL = `${baseURL}/manga`; // "https://api.mangadex.org/manga"
    const coverBaseURL = `${baseURL}/cover`; // "https://api.mangadex.org/cover"

    // TODO: ADD A FILTER BY TAG OPTION

    /* Load some mangas as an example to the site */
    useEffect(() => {
        /**
         * Sends a request to the MangaDex API and puts manga info into an array.
         * @param {number} limit - limit of the amount of mangas to get
         * @param {number} imgsize - either 512 or 256. width of image
         */
        async function loadMangas(limit = 10, imgsize = 256) {
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
                let coverIDArray = [];
                let coverLinkArray = [];
                for (let i = 0; i < responseArr.length; i++) {
                    coverIDArray.push(responseArr[i].relationships[2].id);
                }
                // console.log("cover ID array: ", coverIDArray)

                await axios({
                    method: "GET",
                    url: coverBaseURL,
                    params: {
                        ids: coverIDArray,
                        limit: limit
                    }
                }).then(res => {
                    for (let i = 0; i < res.data.results.length; i++) {
                        coverLinkArray.push(res.data.results[i])
                    }
                }).catch(err => {
                    console.error("error in cover GET", err);
                    setError(true);
                });

                for (let i = 0; i < responseArr.length; i++) {
                    mangas.push({
                        title: responseArr[i].data.attributes.title.en || "No Title Found.",
                        mangaID: responseArr[i].data.id,
                        coverLink: `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`,
                        // authorID: responseArr[i].relationships[0].id, // leave for indiv pages
                        // artistID: responseArr[i].relationships[1].id, // leave for inviv pages
                        description: responseArr[i].data.attributes.description.en.toString().substring(0, 400).concat("..."),
                    });
                }

                for (let i = 0; i < mangas.length; i++) {
                    for (let j = 0; j < coverLinkArray.length; j++) {
                        if (coverLinkArray[j].relationships[0].id === mangas[i].mangaID)
                            mangas[i].coverLink = `https://uploads.mangadex.org/covers/${mangas[i].mangaID}/${coverLinkArray[j].data.attributes.fileName}.${imgsize}.jpg`;
                    }
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
        loadMangas();
        // if you want it to update as you type, fill in mangatitle here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            let coverIDArray = [];
            let coverLinkArray = [];
            for (let i = 0; i < responseArr.length; i++) {
                coverIDArray.push(responseArr[i].relationships[2].id);
            }
            // console.log("cover ID array: ", coverIDArray)

            await axios({
                method: "GET",
                url: coverBaseURL,
                params: {
                    ids: coverIDArray,
                    limit: limit
                }
            }).then(res => {
                for (let i = 0; i < res.data.results.length; i++) {
                    coverLinkArray.push(res.data.results[i])
                }
            }).catch(err => {
                console.error("error in cover GET", err);
                setError(true);
            });

            for (let i = 0; i < responseArr.length; i++) {
                mangas.push({
                    title: responseArr[i].data.attributes.title.en || "No Title Found.",
                    mangaID: responseArr[i].data.id,
                    coverLink: `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`,
                    // authorID: responseArr[i].relationships[0].id, // leave for indiv pages
                    // artistID: responseArr[i].relationships[1].id, // leave for inviv pages
                    description: responseArr[i].data.attributes.description.en.toString().substring(0, 400).concat("..."),
                });
            }

            for (let i = 0; i < mangas.length; i++) {
                for (let j = 0; j < coverLinkArray.length; j++) {
                    if (coverLinkArray[j].relationships[0].id === mangas[i].mangaID)
                        mangas[i].coverLink = `https://uploads.mangadex.org/covers/${mangas[i].mangaID}/${coverLinkArray[j].data.attributes.fileName}.${imgsize}.jpg`;
                }
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

    return (<>
        <div className="manga-search-container">
            <form onSubmit={sendSearchRequest}>
                <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => {
                    setMangaTitle(e.target.value);
                }} id="manga-search" placeholder="Search By Title!" />
            </form>
        </div>
        {/* TODO: ADD NEXT 25 and PREVIOUS 25 BUTTONS! */}
        <MangaList mangaArray={mangaArray} />
        {error ? <p className="submit-error">An error has ocurred! Check console for more details. <button onClick={clearError}><strong>Clear</strong></button></p> : <></>}
    </>)
}

function MangaList(props) {
    const mangas = props.mangaArray;
    return (<>
        {(mangas.length > 0) ? mangas.map(manga => <MangaCard key={manga.title} manga={manga} />) : <p className="submit-error">Nothing found. Try another title?</p>}
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
        <div className="manga-card">
            <img className="manga-img" src={coverLink} alt="cover"></img>
            <div className="manga-text-info">
                <Link className="manga-title" to={`/${mangaID}`}><strong>{title}</strong></Link>
                <p className="manga-desc">{description}</p>
            </div>
        </div>
    )
}

