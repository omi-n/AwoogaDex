import { useState, useEffect } from "react";
import axios from "axios";
import "./tags.css";
import { MangaList, Offsets } from "./home";
import { BackToHome } from "./mangaInfo";

const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';
const limit = 10;

export default function Tags(props) {
    const [offset, setOffset] = useState(0);
    const [mangaArray, setMangaArray] = useState([]);
    const [totalManga, setTotalManga] = useState(0);
    const { tag, tagName } = props.match.params;
    let tags = tag.split("+");
    tags = tags.filter(t => t.length === 36);

    useEffect(() => {
        async function searchByTag(imgsize = 256) {
            await axios({
                method: "GET",
                url: `${baseURL}/manga?includes[]=cover_art`,
                params: {
                    limit: limit,
                    offset: offset,
                    includedTags: tags
                }
            }).then(response => {
                setMangaArray([]);
                setTotalManga(response.data.total);
                let responseArr = response.data.results;
                let coverIdx = 3;
                let mangas = [];
                responseArr.forEach(response => {
                    let coverFoundStatus = false;
                    for (let j = 0; j < response.relationships.length; j++) {
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
                    });
                });

                mangas.forEach(manga => {
                    if (manga.description.length < 4) manga.description = "No Description Found.";
                });
                // console.log("response mangas: ", responseArr);
                // console.log("mangas: ", mangas)
                setMangaArray(mangas);
            }).catch(err => console.error(err));
        }
        searchByTag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tag, offset]);


    return (
        <div className="init-container tag-container">
            <h1>{tagName}</h1>
            <BackToHome />
            <Offsets offset={offset} setOffset={setOffset} totalManga={totalManga} />
            <MangaList mangaArray={mangaArray} />
            <Offsets offset={offset} setOffset={setOffset} totalManga={totalManga} />
        </div>
    )
}
