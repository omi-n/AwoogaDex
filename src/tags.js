import { useState, useEffect } from "react";
import axios from "axios";
import { MangaCard, MangaList } from "./home";

const baseURL = 'https://wandering-sound-dad3.nabilomi.workers.dev/';
const limit = 10;

export default function Tags(props) {
    const [offset, setOffset] = useState(0);
    const [mangaArray, setMangaArray] = useState([]);
    const [totalManga, setTotalManga] = useState(0);
    const { tag, andor, extag, exandor } = props.match.params;
    let extags = extag.split("!");
    extags = extags.filter(t => t.length === 36);
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
                    includedTags: tags,
                    includedTagsMode: (andor ? "AND" : "OR"),
                    excludedTags: extags,
                    excludedTagsMode: (exandor ? "AND" : "OR")
                }
            }).then(response => {
                // response.data.total is the total results
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
                    console.log(response.relationships[coverIdx]);
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
    }, [tag]);

    return (
        <div>
            <MangaList mangaArray={mangaArray} />
        </div>
    )
}

