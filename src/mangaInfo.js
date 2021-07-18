import "./mangaInfo.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bbobReactRender from '@bbob/react/es/render';
import presetReact from '@bbob/preset-react';
const axios = require("axios");

export default function Manga({ match }) {
    let mangaID = match.params.id;
    const [chapterList, setChapterList] = useState([]);
    const [mangaInfo, setMangaInfo] = useState({});
    const [offset, setOffset] = useState(0);
    const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/'

    useEffect(() => {
        async function getMangaInfo(mangaID) {
            await axios({
                method: "GET",
                url: `${baseURL}/manga?includes[]=author&includes[]=artist&includes[]=cover_art`, // api.mangadex.org 
                params: {
                    ids: [mangaID]
                }
            }).then(response => {
                let resData = response.data.results[0];
                let coverFoundStatus = false;
                let coverIdx;
                for (let i = 0; i < resData.relationships.length; i++) {
                    if (resData.relationships[i].type === "cover_art")
                        coverFoundStatus = true;
                    coverIdx = i;
                }
                let coverFileName = resData.relationships[coverIdx].attributes.fileName;
                const options = { enableEscapeTags: true, }
                let description = bbobReactRender(`${resData.data.attributes.description.en}`, presetReact(), options)
                let usefulMangaInfo = {
                    title: resData.data.attributes.title.en,
                    description: description,
                    status: resData.data.attributes.status,
                    tags: [],
                    cover: (coverFoundStatus ? `https://uploads.mangadex.org/covers/${mangaID}/${coverFileName}.512.jpg` : `https://cdn.discordapp.com/attachments/850613008782196776/866082390454829106/notfound.png`),
                    author: resData.relationships[0].attributes.name,
                    artists: []
                }

                for (let i = 0; i < resData.data.attributes.tags.length; i++) {
                    usefulMangaInfo.tags.push(resData.data.attributes.tags[i].attributes.name.en);
                }

                for (let i = 0; i < resData.relationships.length; i++) {
                    if (resData.relationships[i].type === "artist")
                        usefulMangaInfo.artists.push(resData.relationships[i].attributes.name);
                }

                setMangaInfo(usefulMangaInfo);
            }).catch(err => {
                console.error(err);
            });
        }
        async function getEnglishChapters(mangaID, offset = 0) {
            let engChap = [];
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`,
                params: {
                    manga: mangaID,
                    translatedLanguage: ['en'],
                    limit: 50,
                    offset: offset,
                    "order[chapter]": "desc"
                }
            }).then((response => {
                let resData = response.data.results;
                for (let i = 0; i < resData.length; i++) {
                    engChap.push({
                        chapter: resData[i].data.attributes.chapter,
                        volume: resData[i].data.attributes.volume,
                        id: resData[i].data.id
                        // images: resData[i].data.attributes.data,
                        // chapterHash: resData[i].data.attributes.hash
                    });
                }
                setChapterList(engChap);
            })).catch(err => console.error(err));
        }
        getMangaInfo(mangaID);
        getEnglishChapters(mangaID, offset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mangaID, offset]);

    // TODO: forwards button for offset
    return (
        <div className="all-content">
            <div className="manga-info">
                <img className="manga-info-image" src={mangaInfo.cover} alt="cover" />
                <div className="manga-info-text">
                    <h1>{mangaInfo.title}</h1>
                    <p>{mangaInfo.description}</p>
                    <p><strong>Status:</strong> {mangaInfo.status}</p>
                    <p><strong>Author:</strong> {mangaInfo.author}</p>
                    <p className="artists"><strong>Artist(s):</strong> {mangaInfo.artists ? mangaInfo.artists.map(artist => `${artist}`) : <p>Artists Not Found.</p>}</p>
                    <p><br /><strong>Tags:</strong></p>
                    <div className="manga-tags">
                        {mangaInfo.tags && mangaInfo.tags.map(tag => <p key={tag}>{tag}</p>)}
                    </div>
                </div>
            </div>
            <div className="chapter-list">
                {chapterList.length > 0 ? chapterList.map(chapter => <Chapter key={chapter.id} chapter={chapter} />) : <p className="chapter-error">No Further Chapters in the MangaDex API.</p>}
            </div>
        </div>
    )
}

function Chapter(props) {
    const { chapter, volume, id } = props.chapter;
    return (
        <div>
            <Link to={`/${id}`}>Volume {volume ? volume : "?"}, Chapter {chapter}</Link>
        </div>
    )
}