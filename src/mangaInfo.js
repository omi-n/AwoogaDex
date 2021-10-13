import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import bbobReactRender from '@bbob/react/es/render';
import presetReact from '@bbob/preset-react';
import axios from "axios";
import Helmet from 'react-helmet';

import "./mangaInfo.css";

import { BackToHome } from "./helper";

const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';

export default function Manga({ match }) {
    const mangaID = match.params.id;
    const [chapterList, setChapterList] = useState([]);
    const [mangaInfo, setMangaInfo] = useState({});
    const [totalChapters, setTotalChapters] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 24;

    useEffect(() => {
        async function getMangaInfo(mangaID) {
            await axios({
                method: "GET",
                url: `${baseURL}/manga?includes[]=author&includes[]=artist&includes[]=cover_art`, // api.mangadex.org 
                params: {
                    ids: [mangaID]
                }
            }).then(response => {
                const resData = response.data.data[0];
                console.log(resData)
                let coverFoundStatus = false;
                let coverIdx;
                for (let i = 0; i < resData.relationships.length; i++) {
                    if (resData.relationships[i].type === "cover_art") {
                        coverIdx = i;
                        coverFoundStatus = true;
                    }   
                }
                console.log(resData.relationships[coverIdx])
                let coverFileName = resData.relationships[coverIdx].attributes.fileName;
                const options = { enableEscapeTags: true, onlyAllowTags: ['i', 'hr', 'b', 'u'] }
                // SHUT UP SHUT UP SHUT UP
                // eslint-disable-next-line react-hooks/exhaustive-deps
                let description = bbobReactRender(`${resData.attributes.description.en}`, presetReact(), options);
                let usefulMangaInfo = {
                    title: resData.attributes.title.en,
                    description: description,
                    status: resData.attributes.status,
                    tags: [],
                    cover: (coverFoundStatus ? `https://uploads.mangadex.org/covers/${mangaID}/${coverFileName}.512.jpg` : `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`),
                    author: resData.relationships[0].attributes.name,
                    artists: []
                }
                document.title = "AwoogaDex: " + usefulMangaInfo.title;
                document.getElementById("favicon").href = 'https://cdn.discordapp.com/attachments/850613008782196776/887433818473111573/unknown.png';
                resData.attributes.tags.forEach(tag => {
                    usefulMangaInfo.tags.push({
                        tag: tag.attributes.name.en,
                        tagID: tag.id
                    });
                });

                resData.relationships.forEach(relationship => {
                    if (relationship.type === "artist")
                        usefulMangaInfo.artists.push(relationship.attributes.name);
                });

                setMangaInfo(usefulMangaInfo);
            }).catch(err => {
                console.error(err);
            });
        }
        async function getEnglishChapters(mangaID, offset = 0) {
            let engChap = [];
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`, //
                params: {
                    manga: mangaID,
                    translatedLanguage: ['en'],
                    limit: limit,
                    offset: offset,
                    "order[chapter]": "asc"
                }
            }).then((response => {
                const resData = response.data.data;
                setTotalChapters(response.data.total);
                let num = 0;
                resData.forEach(res => {
                    engChap.push({
                        chapter: res.attributes.chapter,
                        chapterID: res.id,
                        chapterIndex: num
                        // images: resData[i].data.attributes.data,
                        // chapterHash: resData[i].data.attributes.hash
                    });
                    num++;
                });
                setChapterList(engChap);
            })).catch(err => console.error(err));
        }
        getMangaInfo(mangaID);
        getEnglishChapters(mangaID, offset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mangaID, offset]);

    function incrementOffset() {
        let nearestOffsetMax = Math.ceil(totalChapters / limit) * limit;
        if (offset === nearestOffsetMax - limit)
            return;
        else
            setOffset(offset + limit);
    }

    function decrementOffset() {
        if (offset >= limit)
            setOffset(offset - limit);
        if (offset < limit)
            return;
    }

    function resetOffset() {
        setOffset(0);
    }

    function endingOffset() {
        let maxOffset = Math.ceil(totalChapters / limit);
        setOffset(maxOffset * limit - limit);
    }

    // TODO: forwards button for offset
    return (
        <div className="all-content"> 
            <Helmet>
                <meta id="meta-description" name="description" content={mangaInfo.description} />
                <meta id="og-title" property="og:title" content={mangaInfo.title} />
                <meta id="og-image" property="og:image" content={mangaInfo.cover} />
            </Helmet>
            <BackToHome />
            <div className="manga-info">
                <img className="manga-info-image" src={mangaInfo.cover} alt="cover" />
                <div className="manga-info-text">
                    <h1>{mangaInfo.title}</h1>
                    <p>{mangaInfo.description}</p>
                    <p><strong>Status:</strong> {mangaInfo.status}</p>
                    <p><strong>Author:</strong> {mangaInfo.author}</p>
                    <p className="artists"><strong>Artist(s):</strong> {mangaInfo.artists ? mangaInfo.artists.forEach(artist => `${artist}`) : <p>Artists Not Found.</p>}</p>
                    <p><br /><strong>Tags:</strong></p>
                    <div className="manga-tags">
                        {mangaInfo.tags && mangaInfo.tags.map(tag => <Link to={{pathname: `/tag/${tag.tagID}/${tag.tag}`}}><button className="tag" key={tag.tagID}>{tag.tag}</button></Link>)}
                    </div>
                </div>
            </div>

            <div className="chapter-offset-container">
                <div className="chapter-offset-buttons-container">
                    <button className="offset" id="prev" onClick={decrementOffset}>&lt;</button>
                    <button className="offset" id="start" onClick={resetOffset}>Start</button>
                    <button className="offset" id="end" onClick={endingOffset}>End</button>
                    <button className="offset" id="next" onClick={incrementOffset}>&gt;</button>
                </div>
                <p className="submit-error">Page: {(offset + limit) / limit} / {Math.ceil(totalChapters / limit)}</p>
            </div>

            <div className="chapter-list">
                {chapterList.length > 0 ? chapterList.map(chapter => <Chapter key={chapter.id} offset={offset} chapter={chapter} />) : <p className="chapter-error">No Further Chapters in the MangaDex API.</p>}
            </div>
        </div>
    )
}

function Chapter(props) {
    const { chapter, chapterID, chapterIndex } = props.chapter;
    const offset = props.offset;
    return (
        <Link className="chapter-container" to={{pathname: `/chapter/${chapterID}/${chapterIndex}/${offset}`}}>
            <p className="chapter">Chapter {chapter}</p>
        </Link>
    )
}
