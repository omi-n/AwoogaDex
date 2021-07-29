import axios from "axios";

import "./home.css";

import React, { useState, useEffect } from "react";
import { Offsets, MangaList } from "./helper";

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
    const limit = 10;
    const mangaBaseURL = `${baseURL}/manga?includes[]=cover_art`; // "https://api.mangadex.org/manga"

    /* Load some mangas as an example to the site */
    useEffect(() => {
        async function loadMangas(limit = 25, imgsize = 256, offset = 0) {
            await axios({
                method: "GET",
                url: mangaBaseURL, // https://api.mangadex.org/manga
                params: {
                    limit: limit,
                    title: mangaTitle,
                    contentRating: ["safe", "suggestive"],
                    offset: offset,
                    includedTags: tags,
                    includedTagsMode: tagsMode,
                    excludedTags: exTags,
                    excludedTagsMode: "OR"
                }
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
                        title: response.data.attributes.title.en || "No Title Found.",
                        mangaID: response.data.id,
                        coverLink: (coverFoundStatus ? `https://uploads.mangadex.org/covers/${mangaID}/${coverFileName}.${imgsize}.jpg` : `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`),
                        description: response.data.attributes.description.en.toString().substring(0, 400).concat("..."),
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
        setSubmit(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, submit]);

    function triggerUseEffect(e) {
        e.preventDefault();
        setSubmit(1);
    }

    function clearError() {
        setError(false);
    }

    function expandSettings() {
        setExpanded(!expanded);
        setTags([]);
        setExTags([]);
    }

    return (<>
        <div className="manga-search-container">
            <form className="form" onSubmit={triggerUseEffect}>
            <input className="manga-submit" type="text" value={mangaTitle} onChange={(e) => {
                setMangaTitle(e.target.value);
                setOffset(0);
            }} id="manga-search" placeholder="Search by title" />
            <input type="submit" style={{display: "none"}}></input>
                <button onClick={expandSettings} id="submit-btn">Advanced Settings</button>
                {expanded ? <AdvancedSettings setTagsMode={setTagsMode} tags={tags} setTags={setTags} exTags={exTags} setExTags={setExTags} /> : <></>}
            </form>
        </div>

        <Offsets offset={offset} setOffset={setOffset} totalManga={totalManga} />

        <MangaList mangaArray={mangaArray} />

        <Offsets offset={offset} setOffset={setOffset} totalManga={totalManga} />

        {error ? <p className="submit-error">An error has ocurred! Check console for more details. <button onClick={clearError}><strong>Clear</strong></button></p> : <></>}
    </>)
}

function AdvancedSettings(props) {
    const { tags, setTags, exTags, setExTags, setTagsMode } = props;

    /* I am far too lazy to one function to work for both. I copied and pasted the function.*/
    function handleCheck(e) {
        if(e.target.checked) {
            setTags([...tags, e.target.value]);
        } else if(!e.target.checked) {
            if(tags.filter(val => {
                return val === e.target.value
            })) {
                setTags([...tags].filter(val => {
                    return !(val === e.target.value);
                }))
            }
        }
    }
    function handleExCheck(e) {
        if(e.target.checked) {
            setExTags([...exTags, e.target.value]);
        } else if(!e.target.checked) {
            if(tags.filter(val => {
                return val === e.target.value
            })) {
                setExTags([...exTags].filter(val => {
                    return !(val === e.target.value);
                }))
            }
     
        }
    }
    function handleTagAnd(e) {
        if(e.target.checked) {
            setTagsMode("OR");
        } else if(!e.target.checked) {
            setTagsMode("AND");
        }
    }

    const mainTags = [
        {name: "Action", tagId: "391b0423-d847-456f-aff0-8b0cfc03066b"},
        {name: "Thriller", tagId: "07251805-a27e-4d59-b488-f0bfbec15168"},
        {name: "Sci-Fi", tagId: "256c8bd9-4904-4360-bf4f-508a76d67183"},
        {name: "Historical", tagId: "33771934-028e-4cb3-8744-691e866a923e"},
        {name: "Romance", tagId: "423e2eae-a7a2-4a8b-ac03-a8351462d71d"},
        {name: "Comedy", tagId: "4d32cc48-9f00-4cca-9b5a-a839f0764984"},
        {name: "Mecha", tagId: "50880a9d-5440-4732-9afb-8f457127e836"},
        {name: "Crime", tagId: "5ca48985-9a9d-4bd8-be29-80dc0303db72"},
        {name: "Sports", tagId: "69964a64-2f90-4d33-beeb-f3ed2875eb4c"},
        {name: "Superhero", tagId: "7064a261-a137-4d3a-8848-2d385de3a99c"},
        {name: "Adventure", tagId: "87cc87cd-a395-47af-b27a-93258283bbc6"},
        {name: "Isekai", tagId: "ace04997-f6bd-436e-b261-779182193d3d"},
        {name: "Philosophical", tagId: "b1e97889-25b4-4258-b28b-cd7f4d28ea9b"},
        {name: "Drama", tagId: "b9af3a63-f058-46de-a9a0-e0c13906197a"},
        {name: "Horror", tagId: "cdad7e68-1419-41dd-bdce-27753074a640"},
        {name: "Fantasy", tagId: "cdc58593-87dd-415e-bbc0-2ec27bf404cc"},
        {name: "Slice of Life", tagId: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9"},
        {name: "Mystery", tagId: "ee968100-4191-4968-93d3-f82d72be7e46"},
        {name: "Tragedy", tagId: "f8f62932-27da-4fe4-8ee1-6779a8c5edba"}
    ];

    const tagOption = mainTags.map((value, index) => {
        return (
            <div className="tags-container" key={index}>
                <input id={value.tagId} className="tags" type="checkbox" value={value.tagId} onChange={e => handleCheck(e)} />
                <label htmlFor={value.tagId} className="tag-label">
                    {value.name}
                </label>
            </div>
        )
    });

    const exTagOptions = mainTags.map((value, index) => {
        return (
            <div className="tags-container" key={index}>
                <input id={value.tagId+1} className="tags" type="checkbox" value={value.tagId} onChange={e => handleExCheck(e)} />
                <label htmlFor={value.tagId+1} className="tag-label">
                    {value.name}
                </label>
            </div>
        )
    });

    return (
        <div className="advanced-settings">
            <div className="tag-header">
                <h3><strong>INCLUDE</strong></h3>
                <input id="incland" className="tags" type="checkbox" value="and" onChange={e => handleTagAnd(e)} />
                <label htmlFor="incland" className="tag-label">
                    OR
                </label>
            </div>
            <div className="tag-options">
                {tagOption}
            </div>
            <div className="tag-header">
                <h3><strong>EXCLUDE</strong></h3>
            </div>
            <div className="tag-options">
                {exTagOptions}
            </div>
            <button type="submit">Search</button>
        </div>
    )
}