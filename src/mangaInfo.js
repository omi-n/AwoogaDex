import "./mangaInfo.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const axios = require("axios");

export default function Manga({ match }) {
    let mangaID = match.params.id;
    const [chapterList, setChapterList] = useState([]);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        getEnglishChapters(mangaID, offset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mangaID, offset]);

    async function getEnglishChapters(mangaID, offset = 0) {
        let engChap = [];
        await axios({
            method: "GET",
            url: `https://api.mangadex.org/chapter`,
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
            console.log(chapterList);
        })).catch(err => console.error(err));
    }
    // TODO: forwards button for offset
    return (
        <div>
            <p>{mangaID}</p>
            {chapterList && chapterList.map(chapter => <Chapter key={chapter.id} chapter={chapter} />)}
        </div>
    )
}

function Chapter(props) {
    const { chapter, volume, id } = props.chapter;
    return (
        <div>
            <Link to={`/${id}`}>Volume {volume}, Chapter {chapter}</Link>
        </div>
    )
}