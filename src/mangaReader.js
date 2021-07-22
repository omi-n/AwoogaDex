import "./mangaReader.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEventListener from '@use-it/event-listener';
import axios from "axios";

const limit = 24;
const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/'; // TEST: 'https://wandering-sound-dad3.nabilomi.workers.dev/'

export default function MangaReader(props) {
    // TODO: REWORK THE ENTIRE FETCHING PORTION OF THIS TO MAKE IT NON RELIANT ON PREVIOUS STATE
    const { match } = props;
    const { chapterID, chapterIndex, offset } = match.params;
    const [chapterInfo, setChapterInfo] = useState({});
    let dataSaverStatus = false;
    const preloadStatus = true;
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
    const { pages, mangaID, chapter } = props.chapterInfo;
    let { chapterIndex, offset } = props;
    let newChapterIndex = Number(chapterIndex);
    let newNewChapterIndex = Number(chapterIndex);
    let nextOffset = Number(offset);
    let prevOffset = Number(offset);
    const { chapterID } = props;
    const [nextChapter, setNextChapter] = useState("");
    const [prevChapter, setPrevChapter] = useState("");
    let page = pages[pageNumber];
    useEffect(() => {
        setPageNumber(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        async function getNextChapter() {
            if(chapterIndex === 23) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                newChapterIndex = -1;
                // eslint-disable-next-line react-hooks/exhaustive-deps
                nextOffset += 24;
            }
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`,
                params: {
                    manga: mangaID,
                    translatedLanguage: ['en'],
                    limit: limit,
                    offset: nextOffset,
                    "order[chapter]": "asc"
                }
            }).then(async response => {
                if(response.data.results[newChapterIndex + 1] !== undefined)
                    setNextChapter(response.data.results[newChapterIndex + 1].data.id);
                else if(response.data.results[newChapterIndex + 1] === undefined)
                    setNextChapter(chapterID); 
            }).catch(err => console.error(err));
        }
        async function getPrevChapter() {
            if(newNewChapterIndex === 0 && (offset >= 24)) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                newNewChapterIndex = 24;
                // eslint-disable-next-line react-hooks/exhaustive-deps
                prevOffset -= 24;
            } else if(newNewChapterIndex === 0 && (Number(offset) === 0)) {
                newChapterIndex = newNewChapterIndex;
            }
            await axios({
                method: "GET",
                url: `${baseURL}/chapter`,
                params: {
                    manga: mangaID,
                    translatedLanguage: ['en'],
                    limit: limit,
                    offset: prevOffset,
                    "order[chapter]": "asc"
                }
            }).then(async response => {
                if(response.data.results[newNewChapterIndex - 1] !== undefined)
                    setPrevChapter(response.data.results[newNewChapterIndex - 1].data.id);
                else if(response.data.results[newNewChapterIndex - 1] === undefined)
                    setPrevChapter(chapterID); 
            }).catch(err => console.error(err));
        }

        getPrevChapter();
        getNextChapter();

        return () => {
            setNextChapter("");
        }
    // eslint-disable-next-line
    },[chapterID, offset, chapterIndex]);

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

    // When the user clicks on the button, scroll to the top of the document
    function topFunction() {
        // document.body.scrollTop = 0; // For Safari
        // document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    } 
    chapterIndex = Number(chapterIndex);
    offset = Number(offset);
    
    let linkIncChapterIndex = parseInt(chapterIndex === 23 ? 0 : chapterIndex + 1);
    let linkIncOffset = parseInt(chapterIndex === 23 ? offset + 24 : offset);
    let linkDecChapterIndex = parseInt(chapterIndex === 0 ? 23 : chapterIndex - 1);
    let linkDecOffset = parseInt(chapterIndex === 0 ? (offset >= 24 ? offset - 24 : offset) : offset);
    if(chapterIndex === 0 && offset === 0) {
        linkDecChapterIndex = 0;
        linkDecOffset = 0;
    }

    return (<div>
        <div className="sidebar">
            <BackToHome />
            <BackToMangaPage mangaID={mangaID} />
            <div className="chapter-buttons">
                {/* eslint-disable-next-line */}
                <Link className="change-chapter noSelect" to={{pathname: `/chapter/${prevChapter}/${linkDecChapterIndex}/${linkDecOffset}`}}>
                    <button className="chapter-button">Prev Chapter</button>
                </Link>
                {/* eslint-disable-next-line */}
                <Link className="change-chapter noSelect" to={{pathname: `/chapter/${nextChapter}/${linkIncChapterIndex}/${linkIncOffset}`}}>
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
            <p className="page-number">Chapter {chapter} Page {pageNumber + 1}</p>
        </div>
        <div className="reader-page" id="top">
            <div className="click-to-change">
                {/* eslint-disable-next-line */}
                <span readOnly className="change-page-i noSelect" type="text" id="myBtn" onClick={() => {
                    incrementPageNumber(); topFunction();
                }}></span>
                {/* eslint-disable-next-line */}
                <span readOnly className="change-page-i noSelect" type="text" id="myBtn" onClick={() => {
                    incrementPageNumber(); topFunction();
                }}></span>
            </div>
            <div className="dummy-div"></div>
            <div className="reader-container">
                {/* eslint-disable-next-line no-sequences */}
                <img style={imgStyle} id="img" className="reader-image" src={page} alt={`page ${pageNumber + 1} from manga`} />
            </div>
        </div>
    </div>)
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