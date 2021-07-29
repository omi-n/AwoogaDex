import { Link } from "react-router-dom";

export function MangaList(props) {
    const mangas = props.mangaArray;
    return (<>
        {(mangas.length > 0) ? mangas.map(manga => <MangaCard className="manga-card-i" key={manga.mangaID} manga={manga} />) : <p className="submit-error">Nothing found. Try another title?</p>}
    </>)
}

export function MangaCard(props) {
    let {
        title,
        description,
        mangaID,
        coverLink
    } = props.manga;
    return (
        <Link to={`/manga/${mangaID}`}>
            <button className="manga-card">
                <img className="manga-img" src={coverLink} alt="cover" />
                <div className="manga-text-info">
                    <p className="manga-title" to={`/manga/${mangaID}`}><strong>{title}</strong></p>
                    <p className="manga-desc">{description}</p>
                </div>
            </button>
        </Link>
    )
}

export function Offsets(props) {
    const { offset, setOffset, totalManga } = props;
    function incrementOffset() {
        let nearestOffsetMax = Math.ceil(totalManga / 25) * 25;
        if(offset === nearestOffsetMax - 25)
            return;
        else
            setOffset(offset + 25);
    }

    function decrementOffset() {
        if (offset >= 25)
            setOffset(offset - 25);
        if (offset < 25)
            return;
    }

    function resetOffset() {
        setOffset(0);
    }

    function topFunction() {
        if(window.scrollY > 1200) {
            window.scroll({
                top: 400,
                left: 0,
                behavior: 'smooth'
            });
        } else {
            return;
        }
            
    }

    return (
        <div className="offset-container">
            <div className="offset-buttons-container">
                <button className="offset" id="prev" onClick={() => {
                        decrementOffset();
                        topFunction();
                }}>&lt;</button>
                <button className="offset" id="" onClick={() => {
                    resetOffset();
                    topFunction();
                }}>1</button>
                <button className="offset" id="next" onClick={()=> {
                    incrementOffset();
                    topFunction();
                }}>&gt;</button>
            </div>
            <p className="submit-error">Page: {(offset + 25) / 25} / {Math.ceil(totalManga / 25)}</p>
        </div>
    )
}

export function OffsetsNoTop(props) {
    const { offset, setOffset, totalManga } = props;
    function incrementOffset() {
        let nearestOffsetMax = Math.ceil(totalManga / 25) * 25;
        if(offset === nearestOffsetMax - 25)
            return;
        else
            setOffset(offset + 25);
    }

    function decrementOffset() {
        if (offset >= 25)
            setOffset(offset - 25);
        if (offset < 25)
            return;
    }

    function resetOffset() {
        setOffset(0);
    }

    return (
        <div className="offset-container">
            <div className="offset-buttons-container">
                <button className="offset" id="prev" onClick={() => {
                        decrementOffset();
                }}>&lt;</button>
                <button className="offset" id="" onClick={() => {
                    resetOffset();
                }}>1</button>
                <button className="offset" id="next" onClick={()=> {
                    incrementOffset();
                }}>&gt;</button>
            </div>
            <p className="submit-error">Page: {(offset + 25) / 25} / {Math.ceil(totalManga / 25)}</p>
        </div>
    )
}

export function BackToHome() {
    return (
        <div className="home-btn">
            <a className="home-btn-link" href="/"><button>Home</button></a>
        </div>
    )
}