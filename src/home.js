import axios from "axios";

import "./home.css";

import React, { useState, useEffect } from "react";
import { Offsets, MangaList, OffsetsNoTop } from "./helper";
import { AdvancedSettings } from "./advancedSettings";

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
    const [submit, setSubmit] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagsMode, setTagsMode] = useState("AND");
    const [exTags, setExTags] = useState([]);
    const [order, setOrder] = useState();
    const limit = 10;
    const mangaBaseURL = `${baseURL}/manga?includes[]=cover_art`; // "https://api.mangadex.org/manga"

    /* Load some mangas as an example to the site */
    useEffect(() => {
        async function loadMangas(limit = 25, imgsize = 256, offset = 0) {
            let params = {
                    limit: limit,
                    title: mangaTitle,
                    contentRating: ["safe", "suggestive"],
                    offset: offset,
                    includedTags: tags,
                    includedTagsMode: tagsMode,
                    excludedTags: exTags,
                    excludedTagsMode: "OR"
            }
            if(order && order.sortedAt === "updatedAt")
                params[`order[updatedAt]`] = order.direction;
            else if(order && order.sortedAt === "createdAt")
                params[`order[createdAt]`] = order.direction;
            await axios({
                method: "GET",
                url: mangaBaseURL, // https://api.mangadex.org/manga
                params: params
            }).then(response => {
                setMangaArray([]);
                setTotalManga(response.data.total);
                let responseArr = response.data.results;
                let coverIdx;
                let mangas = [];
                for(response of responseArr) {
                    let coverFoundStatus = false;
                    let resRelLen = response.relationships.length
                    for (let j = 0; j < resRelLen; j++) {
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
                        title: (response.data.attributes.title.en 
                            ? response.data.attributes.title.en 
                            : (response.data.attributes.title.jp ? response.data.attributes.title.jp : "No Title Found.")),
                        mangaID: response.data.id,
                        coverLink: (coverFoundStatus ? `https://uploads.mangadex.org/covers/${mangaID}/${coverFileName}.${imgsize}.jpg` : `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`),
                        description: (response.data.attributes.description.en 
                            ? response.data.attributes.description.en.toString().substring(0, 400).concat("...") 
                            : "No Description Found."),
                    })
                };

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
    }, [offset, submit]);

    function triggerUseEffect(e) {
        e.preventDefault();
        setSubmit(submit + 1);
    }

    function clearError() {
        setError(false);
    }

    function expandSettings(e) {
        e.preventDefault();
        setExpanded(!expanded);
        setTags([]);
        setExTags([]);
    }

    const AdvancedSettingsMasterProp = {
        submit: submit,
        setSubmit: setSubmit,
        setOrder: setOrder,
        offset: offset,
        setOffset: setOffset,
        setTagsMode: setTagsMode,
        tags: tags,
        setTags: setTags,
        exTags: exTags,
        setExTags: setExTags
    }

    return (<>
        <div className="manga-search-container">
            <form className="form" onSubmit={triggerUseEffect}>
                <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => {
                    setMangaTitle(e.target.value);
                    setOffset(0);
                }} id="manga-search" placeholder="Search by title" />
                {expanded ? <></> : <input type="submit" style={{display: "none"}}></input>}

                <button onClick={e => expandSettings(e)} id="expand">Advanced Settings</button>
                {expanded ? <AdvancedSettings master={AdvancedSettingsMasterProp} /> : <></>}
            </form>
        </div>

        <OffsetsNoTop offset={offset} setOffset={setOffset} totalManga={totalManga} />

        <MangaList mangaArray={mangaArray} />

        <Offsets offset={offset} setOffset={setOffset} totalManga={totalManga} />

        {error ? <p className="submit-error">An error has ocurred! Check console for more details. <button onClick={clearError}><strong>Clear</strong></button></p> : <></>}
    </>)
}