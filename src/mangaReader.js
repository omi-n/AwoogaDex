import "./mangaReader.css";
import React, { useState, useEffect } from "react";
const axios = require("axios");

export default function MangaReader({ match }) {
    const limit = 24;
    let chapterID = match.params.chapterid;
    const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';
    useEffect(() => {
        async function getChapter(chapterID) {
            let pages = [];
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`, //
                params: {
                    ids: [`${chapterID}`],
                    translatedLanguage: ['en'],
                    limit: limit,
                    "order[chapter]": "asc"
                }
            }).then((response => {
                let resData = response.data.results[0].data.attributes;
                console.log(resData)
                
            })).catch(err => console.error(err));
        }
        getChapter(chapterID);
    }, [chapterID])

    return (
        <div>

        </div>
    )
}