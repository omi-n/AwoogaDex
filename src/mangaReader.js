import "./mangaReader.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEventListener from '@use-it/event-listener';
import axios from "axios";

const limit = 24;
const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/'; // TEST: 'https://wandering-sound-dad3.nabilomi.workers.dev/'

export default function MangaReader(props) {
    const { match } = props;
    const { chapterID, chapterIndex, offset } = match.params;
    
    const [chapterInfo, setChapterInfo] = useState({});
    let dataSaverStatus = window.localStorage.getItem("dataSaverDisabled");
    const preloadStatus = true;
    let pages = [];

    useEffect(() => {
        async function getChapter(_callback) {
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
                let resData = response.data.data[0].attributes;
                // get base url to reconstruct the image url. this may not always be needed.
                // let imageBaseUrl = await axios.get(`${baseURL}/at-home/server/${chapterID}`);
                // imageBaseUrl.data.baseUrl
                // console.log(imageBaseUrl);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                // push all of the chapter pages into the pages array
                const pageData = (
                    dataSaverStatus === "true" 
                    ? resData.data 
                    : resData.dataSaver
                );
                pageData.forEach(page => {
                    pages.push(`https://uploads.mangadex.org/${dataSaverStatus === "true" ? "data" : 'data-saver'}/${resData.hash}/${page}`);
                });

                setChapterInfo({
                    chapter: resData.chapter,
                    volume: (resData.volume ? resData.volume : "?"),
                    pages: pages,
                    mangaID: response.data.data[0].relationships[1].id
                });
                document.title = "AwoogaDex";
                document.getElementById("favicon").href = 'https://cdn.discordapp.com/attachments/850613008782196776/887433818473111573/unknown.png';
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

        // preloading pages is extremely cheap in terms of speed, has big benefit. uses data saver images.
        getChapter(() => {
            preloadPages();
        });
    }, [chapterID])
    
    return (
        <div id="top">
            {chapterInfo.pages 
            ? <PageReader chapterID={chapterID} chapterIndex={chapterIndex} offset={offset} chapterInfo={chapterInfo} /> 
            : <p>Preloading all images, please wait. This is to prevent lag while reading.</p>}
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
    const [nextChapter, setNextChapter] = useState("");
    const [prevChapter, setPrevChapter] = useState("");

    const { chapterID } = props;
    const { pages, mangaID, chapter } = props.chapterInfo;
    // have to turn this into a number later.
    let { chapterIndex, offset } = props;

    /* I know these variable names suck. Im too lazy to fix them lol */
    let chapterIndexCopy = Number(chapterIndex);
    let prevChapterIndex = Number(chapterIndex);
    let nextOffset = Number(offset);
    let prevOffset = Number(offset);

    let page = pages[pageNumber];

    useEffect(() => {
        setPageNumber(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        async function getNextChapter() {
            if(chapterIndex === 23) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                chapterIndexCopy = -1;
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
                if(response.data.data[chapterIndexCopy + 1] !== undefined) {
                    setNextChapter(response.data.data[chapterIndexCopy + 1].id);
                    if(response.data.data[chapterIndexCopy - 1] !== undefined) {
                        setPrevChapter(response.data.data[chapterIndexCopy - 1].id);
                    } else if(response.data.data[chapterIndexCopy - 1] === undefined) {
                        getPrevChapter();
                    }
                } else if(response.data.data[chapterIndexCopy + 1] === undefined)
                    setNextChapter(chapterID); 
            }).catch(err => console.error(err));
        }
        async function getPrevChapter() {
            if(prevChapterIndex === 0 && (offset >= 24)) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                prevChapterIndex = 24;
                // eslint-disable-next-line react-hooks/exhaustive-deps
                prevOffset -= 24;
            } else if(prevChapterIndex === 0 && (Number(offset) === 0)) {
                chapterIndexCopy = prevChapterIndex;
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
                if(response.data.data[prevChapterIndex - 1] !== undefined)
                    setPrevChapter(response.data.data[prevChapterIndex - 1].id);
                else if(response.data.data[prevChapterIndex - 1] === undefined)
                    setPrevChapter(chapterID); 
            }).catch(err => console.error(err));
        }

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
        topFunction();
        if(pageNumber < pages.length - 1) {
            setPageNumber(pageNumber + 1);
        } else if(pageNumber >= pages.length - 1) {
            return;
        }
    }

    function decrementPageNumber() {
        topFunction();
        if(pageNumber > 0) {
            setPageNumber(pageNumber - 1);
        } else if(pageNumber <= 0) {
            return;
        }
    }

    function endPageNumber() {
        topFunction();
        setPageNumber(pages.length - 1);
    }

    function startPageNumber() {
        topFunction();
        setPageNumber(0);
    }

    function handler({ key }) {
        switch(key) {
            case 'ArrowRight':
                (pageNumber < pages.length - 1) ? incrementPageNumber() : document.getElementById("next-chapter").click();
                topFunction();
                break;
            case 'D':
                (pageNumber < pages.length - 1) ? incrementPageNumber() : document.getElementById("next-chapter").click();
                topFunction();
                break;
            case 'd':
                (pageNumber < pages.length - 1) ? incrementPageNumber() : document.getElementById("next-chapter").click();
                topFunction();
                break;
            case 'ArrowLeft':
                (pageNumber > 0) ? decrementPageNumber() : document.getElementById("prev-chapter").click();
                topFunction();
                break;
            case 'A':
                (pageNumber > 0) ? decrementPageNumber() : document.getElementById("prev-chapter").click();
                topFunction();
                break;
            case 'a':
                (pageNumber > 0) ? decrementPageNumber() : document.getElementById("prev-chapter").click();
                topFunction();
                break;
            case ',':
                document.getElementById("prev-chapter").click();
                topFunction();
                break;
            case '.':
                document.getElementById("next-chapter").click();
                topFunction();
                break;
            case 't':
                topFunction();
                break;
            default:
                break;
        }
    }

    useEventListener('keydown', handler);

    // When the user clicks on the button, scroll to the top of the document
    function topFunction() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    } 
    chapterIndex = Number(chapterIndex);
    offset = Number(offset);
    
    // There are a lot of edge cases, and im too lazy to figure out a good solution.
    let linkIncChapterIndex = parseInt(chapterIndex === 23 ? 0 : chapterIndex + 1);
    let linkIncOffset = parseInt(chapterIndex === 23 ? offset + 24 : offset);
    let linkDecChapterIndex = parseInt(chapterIndex === 0 ? 23 : chapterIndex - 1);
    let linkDecOffset = parseInt(chapterIndex === 0 ? (offset >= 24 ? offset - 24 : offset) : offset);
    if(chapterIndex === 0 && offset === 0) {
        linkDecChapterIndex = 0;
        linkDecOffset = 0;
    }

    return (<div>
        {/* TODO: ADD CHANGING TITLES */}
        <div className="sidebar">
            <BackToHome />
            <BackToMangaPage mangaID={mangaID} />
            <div className="chapter-buttons">
                {/* eslint-disable-next-line */}
                <Link id="prev-chapter" className="change-chapter noSelect" to={{pathname: `/chapter/${prevChapter}/${linkDecChapterIndex}/${linkDecOffset}`}}>
                    <button className="chapter-button">Prev Chapter</button>
                </Link>
                {/* eslint-disable-next-line */}
                <Link id="next-chapter" className="change-chapter noSelect" to={{pathname: `/chapter/${nextChapter}/${linkIncChapterIndex}/${linkIncOffset}`}}>
                    <button className="chapter-button">Next Chapter</button>
                </Link>
            </div>
            <div className="nav-buttons">
                {(pageNumber > 0) ? <button className="change-page" onClick={() => {decrementPageNumber();}}>&lt;</button> 
                : <Link className="change-page noSelect" to={{pathname: `/chapter/${prevChapter}/${linkDecChapterIndex}/${linkDecOffset}`}}>
                      <button className="chapter-button">&lt;</button>
                  </Link>}
                <button className="change-page" onClick={() => {startPageNumber();}}>&lt;&lt;</button>
                <button className="change-page" onClick={() => {endPageNumber();}}>&gt;&gt;</button>
                {(pageNumber < pages.length - 1) ? <button className="change-page" onClick={() => {incrementPageNumber();}}>&gt;</button> 
                : <Link className="change-page noSelect" to={{pathname: `/chapter/${nextChapter}/${linkIncChapterIndex}/${linkIncOffset}`}}>
                      <button className="chapter-button">&gt;</button>
                  </Link>}
            </div>
            <form id="style-dropdown" onSubmit={e => changeStyle(e)} className="style-dropdown">
                <select id="mobile-submit" type="submit" name="style" onChange={e => setImgDisplay(e.target.value)} >
                    <option value="original">Original</option>
                    <option value="fit-width">Fit Width</option>
                    <option value="fit-height">Fit Height</option>
                </select>
                <button className="form-submit" type="submit">✓</button>
            </form>
            <p className="page-number">Chapter {chapter} Page {pageNumber + 1} / {pages.length}</p>
        </div>
        <div className="reader-page" id="top">
            <div className="click-to-change">
                {/* eslint-disable-next-line */}
                <span readOnly className="change-page-i noSelect" type="text" id="myBtn" onClick={() => {decrementPageNumber();}}></span>
                {/* eslint-disable-next-line */}
                {(pageNumber < pages.length - 1) ? <span readOnly className="change-page-i noSelect" type="text" id="myBtn" onClick={() => {incrementPageNumber(); }}></span> 
                : <Link className="change-page-i noSelect" to={{pathname: `/chapter/${nextChapter}/${linkIncChapterIndex}/${linkIncOffset}`}}></Link>}
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