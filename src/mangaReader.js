import "./mangaReader.css";
import React, { useState, useEffect } from "react";
const axios = require("axios");

export default function MangaReader({ match }) {
    const [chapterInfo, setChapterInfo] = useState({});
    const [dataSaverStatus, setDataSaverStatus] = useState(true);
    const [preloadStatus, setPreloadStatus] = useState(true);
    const limit = 24;
    const chapterID = match.params.chapterid;
    const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';
    let pages = [];
    useEffect(() => {
        async function getChapter(chapterID, _callback) {
            pages = [];
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`, 
                params: {
                    ids: [`${chapterID}`],
                    translatedLanguage: ['en'],
                    limit: limit,
                    "order[chapter]": "asc"
                }
            }).then(async response => {
                let resData = response.data.results[0].data.attributes;
                // get base url to reconstruct the iamge ur
                let imageBaseUrl = await axios.get(`https://api.mangadex.org/at-home/server/${chapterID}`);
                // push all of the chapter pages into the pages array
                const pageData = (dataSaverStatus ? resData.dataSaver : resData.data);
                pageData.forEach(page => {
                    pages.push(`${imageBaseUrl.data.baseUrl}/${dataSaverStatus ? 'data-saver' : 'data'}/${resData.hash}/${page}`);
                });

                setChapterInfo({
                    chapter: resData.chapter,
                    volume: (resData.volume.length > 0 ? resData.volume : "?"),
                    pages: pages,
                });
            }).catch(err => console.error(err));
            _callback();
        }
        async function preloadPages() {
            if(preloadStatus) {
                pages.forEach(page => {
                    new Image().src = page;
                });
            } else if(!preloadStatus) {
                return;
            }
        }
        // this is so there isnt any stupid ass error with "OH YEAH IM FUCKING REACTARDED AND I AM AN IMPATIENT PIECE OF SHIT HOLY FUCK"
        function load() {
            getChapter(chapterID, async () => await preloadPages());
        }

        load();
    }, [chapterID])

    return (
        <div>
            <PageReader chapterInfo={chapterInfo} />
        </div>
    )
}

function PageReader(props) {
    const { pages } = props.chapterInfo;
    return (
        <div>
            {pages && pages.map(page => 
                <img key={page} src={page} alt="page from manga"></img>
            )}
        </div>
    )
}