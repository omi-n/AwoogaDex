import "./mangaReader.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEventListener from '@use-it/event-listener';
const axios = require("axios");

const limit = 24;
const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';

export default function MangaReader(props) {
    const { history, match } = props;
    const { chapterIndex, offset} = history.location.state;
    const [chapterInfo, setChapterInfo] = useState({});
    let dataSaverStatus = false;
    const preloadStatus = true;
    const chapterID = match.params.chapterid;
    let pages = [];
    useEffect(() => {
        async function getChapter(chapterID, _callback) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
                let imageBaseUrl = await axios.get(`${baseURL}/at-home/server/${chapterID}`);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                if(resData.dataSaver) dataSaverStatus = true;
                // push all of the chapter pages into the pages array
                const pageData = (dataSaverStatus ? resData.dataSaver : resData.data);
                pageData.forEach(page => {
                    pages.push(`${imageBaseUrl.data.baseUrl}/${dataSaverStatus ? 'data-saver' : 'data'}/${resData.hash}/${page}`);
                });

                setChapterInfo({
                    chapter: resData.chapter,
                    volume: (resData.volume ? resData.volume : "?"),
                    pages: pages,
                    mangaID: response.data.results[0].relationships[1].id
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
            getChapter(chapterID, () => preloadPages());
        }

        load();
    }, [chapterID])
    
    return (
        <div id="top">
            {chapterInfo.pages ? <PageReader chapterID={chapterID} chapterIndex={chapterIndex} offset={offset} chapterInfo={chapterInfo} /> : <p>Preloading all images, please wait. This is to prevent lag while reading.</p>}
        </div>
    )
}

function PageReader(props) {
    const [pageNumber, setPageNumber] = useState(0);
    const [imgDisplay, setImgDisplay] = useState("original");
    const [imgStyle, setImgStyle] = useState({
        width: "",
        height: ""
    });
    const { pages, mangaID } = props.chapterInfo;
    const { chapterIndex, offset, chapterID } = props;
    const [nextChapter, setNextChapter] = useState("")
    let page = pages[pageNumber];
    // chapterIndex =  (chapterIndex === limit ? 0 : chapterIndex)

    useEffect(() => {
        async function getNextChapter() {
            let nextChapter;
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`,
                params: {
                    manga: mangaID,
                    translatedLanguage: ['en'],
                    limit: limit,
                    offset: (chapterIndex === limit ? offset + 1 : offset),
                    "order[chapter]": "asc"
                }
            }).then(response => {
                nextChapter = response.data.results[(chapterIndex === limit ? 0 : chapterIndex + 1)].data.id;
            }).catch(err => console.error(err));
            return nextChapter;
        }
        async function wrap() {
            setNextChapter(await getNextChapter());
        }
        wrap();

        return () => {
            setNextChapter("");
        }
    },[chapterID]);

    function changeStyle(e) {
        e.preventDefault();
        if(imgDisplay === "original") {
            setImgStyle({
                width: "",
                height: ""
            });
        } else if(imgDisplay === "fit-width") {
            setImgStyle({
                width: "75vw",
                height: ""
            });
        } else if(imgDisplay === "fit-height") {
            setImgStyle({
                width: "",
                height: "100vh"
            });
        }
    }

    function incrementPageNumber() {
        if(pageNumber < pages.length - 1) {
            setPageNumber(pageNumber + 1);
        } else if(pageNumber >= pages.length - 1) {
            return;
        }
    }

    function decrementPageNumber() {
        if(pageNumber > 0) {
            setPageNumber(pageNumber - 1);
        } else if(pageNumber <= 0) {
            return;
        }
    }

    function endPageNumber() {
        setPageNumber(pages.length - 1);
    }

    function startPageNumber() {
        setPageNumber(0);
    }

    function handler({ key }) {
        switch(key) {
            case 'ArrowRight':
                incrementPageNumber();
                break;
            case 'ArrowLeft':
                decrementPageNumber();
                break;
            default:
                break;
        }
    }

    useEventListener('keydown', handler);
    
    return (<>
        <div className="sidebar">
            <BackToHome />
            <BackToMangaPage mangaID={mangaID} />
            <div className="chapter-buttons">
                {/* eslint-disable-next-line */}
                <a className="change-chapter"><button className="chapter-button">Prev Chapter</button></a>
                {/* eslint-disable-next-line */}
                <Link className="change-chapter" to={{pathname: `/chapter/${nextChapter}`, state: {chapterIndex: chapterIndex + 1, offset: offset}}}>
                    <button className="chapter-button">Next Chapter</button>
                </Link>
            </div>
            <div className="nav-buttons">
                <button className="change-page" onClick={decrementPageNumber}>&lt;</button>
                <button className="change-page" onClick={startPageNumber}>&lt;&lt;</button>
                <button className="change-page" onClick={endPageNumber}>&gt;&gt;</button>
                <button className="change-page" onClick={incrementPageNumber}>&gt;</button>
            </div>
            <form id="style-dropdown" onSubmit={e => changeStyle(e)} className="style-dropdown">
                <select id="mobile-submit" type="submit" name="style" onChange={e => setImgDisplay(e.target.value)} >
                    <option value="original">Original</option>
                    <option value="fit-width">Fit Width</option>
                    <option value="fit-height">Fit Height</option>
                </select>
                <button className="form-submit" type="submit">✓</button>
            </form>
            <p className="page-number">Page {pageNumber + 1}</p>
        </div>
        <div className="reader-page">
            <div className="click-to-change">
                {/* eslint-disable-next-line */}
                <a readOnly className="change-page-i noSelect" type="text" href="#top" onClick={decrementPageNumber}></a>
                {/* eslint-disable-next-line */}
                <a readOnly className="change-page-i noSelect" type="text" href="#top" onClick={incrementPageNumber}></a>
            </div>
            <div className="dummy-div"></div>
            <div className="reader-container">
                {/* eslint-disable-next-line no-sequences */}
                <img style={imgStyle} id="img" className="reader-image" src={page} alt={`page ${pageNumber + 1} from manga`} />
            </div>
        </div>
    </>)
}

function BackToHome() {
    return (
        <div className="home-btn-sidebar">
            <a id="home-btn-link" className="home-btn-link" href="/"><button id="home-btn-sidebar">Back To Home</button></a>
        </div>
    )
}

function BackToMangaPage(props) {
    const mangaID = props.mangaID;
    return (
        <div className="home-btn-sidebar">
            <a id="home-btn-link" className="home-btn-link" href={`/manga/${mangaID}`}><button id="home-btn-sidebar">Back To Manga Page</button></a>
        </div>
    )
}