import "./home.css";

import { useState } from "react";

export function AdvancedSettings(props) {
    const { tags, setTags, exTags, setExTags, setTagsMode, offset, setOffset, setOrder, submit, setSubmit } = props.master;
    let checkstat = (window.localStorage.getItem("dataSaverDisabled") === "true" ? true : false);
    const [checked, setChecked] = useState(checkstat);

    /* I am far too lazy to one function to work for both. I copied and pasted the function.*/
    function handleCheck(e) {
        if(e.target.checked) {
            setTags([...tags, e.target.value]);
        } else if(!e.target.checked) {
            if(tags.filter(val => {
                return val === e.target.value
            })) {
                setTags([...tags].filter(val => {
                    return !(val === e.target.value);
                }))
            }
        }
    }
    function handleExCheck(e) {
        if(e.target.checked) {
            setExTags([...exTags, e.target.value]);
        } else if(!e.target.checked) {
            if(tags.filter(val => {
                return val === e.target.value
            })) {
                setExTags([...exTags].filter(val => {
                    return !(val === e.target.value);
                }))
            }
     
        }
    }
    function handleTagAnd(e) {
        if(e.target.checked) {
            setTagsMode("OR");
        } else if(!e.target.checked) {
            setTagsMode("AND");
        }
    }
    function resetOffset(e) {
        e.preventDefault();
        setSubmit(submit + 1);
        if(offset !== 0)
            setOffset(0);
    }
    function handleSortCheck(e) {
        if(e.target.checked && e.target.value === "createdat") {
            document.getElementById("updatedat").checked = false;
            setOrder({
                sortedAt: "createdAt",
                direction: "desc"
            });
        } else if(e.target.checked && e.target.value === "updatedat") {
            document.getElementById("createdat").checked = false;
            setOrder({
                sortedAt: "updatedAt",
                direction: "desc"
            });
        } else if(e.target.checked && e.target.value === "none") {
            document.getElementById("updatedat").checked = false;
            document.getElementById("createdat").checked = false;
            setOrder();
        }
    }
    function dataSaver(e) {
        const localStorage = window.localStorage;
        if(e.target.checked) {
            localStorage.setItem("dataSaverDisabled", "true");
            setChecked(true);
        } else if(!e.target.checked) {
            localStorage.setItem("dataSaverDisabled", "false");
            setChecked(false);
        }
    }

    const mainTags = [
        {name: "Action", tagId: "391b0423-d847-456f-aff0-8b0cfc03066b"},
        {name: "Thriller", tagId: "07251805-a27e-4d59-b488-f0bfbec15168"},
        {name: "Sci-Fi", tagId: "256c8bd9-4904-4360-bf4f-508a76d67183"},
        {name: "Historical", tagId: "33771934-028e-4cb3-8744-691e866a923e"},
        {name: "Romance", tagId: "423e2eae-a7a2-4a8b-ac03-a8351462d71d"},
        {name: "Comedy", tagId: "4d32cc48-9f00-4cca-9b5a-a839f0764984"},
        {name: "Mecha", tagId: "50880a9d-5440-4732-9afb-8f457127e836"},
        {name: "Crime", tagId: "5ca48985-9a9d-4bd8-be29-80dc0303db72"},
        {name: "Sports", tagId: "69964a64-2f90-4d33-beeb-f3ed2875eb4c"},
        {name: "Superhero", tagId: "7064a261-a137-4d3a-8848-2d385de3a99c"},
        {name: "Adventure", tagId: "87cc87cd-a395-47af-b27a-93258283bbc6"},
        {name: "Isekai", tagId: "ace04997-f6bd-436e-b261-779182193d3d"},
        {name: "Philosophical", tagId: "b1e97889-25b4-4258-b28b-cd7f4d28ea9b"},
        {name: "Drama", tagId: "b9af3a63-f058-46de-a9a0-e0c13906197a"},
        {name: "Horror", tagId: "cdad7e68-1419-41dd-bdce-27753074a640"},
        {name: "Fantasy", tagId: "cdc58593-87dd-415e-bbc0-2ec27bf404cc"},
        {name: "Slice of Life", tagId: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9"},
        {name: "Mystery", tagId: "ee968100-4191-4968-93d3-f82d72be7e46"},
        {name: "Tragedy", tagId: "f8f62932-27da-4fe4-8ee1-6779a8c5edba"}
    ];

    const tagOption = mainTags.map((value, index) => {
        return (
            <div className="tags-container" key={index}>
                <input id={value.tagId} className="tags" type="checkbox" value={value.tagId} onChange={e => handleCheck(e)} />
                <label htmlFor={value.tagId} className="tag-label">
                    {value.name}
                </label>
            </div>
        )
    });

    const exTagOptions = mainTags.map((value, index) => {
        return (
            <div className="tags-container" key={index}>
                <input id={value.tagId+1} className="tags" type="checkbox" value={value.tagId} onChange={e => handleExCheck(e)} />
                <label htmlFor={value.tagId+1} className="tag-label">
                    {value.name}
                </label>
            </div>
        )
    });

    return (
        <div className="advanced-settings">
            <div className="tag-header">
                <h3><strong>INCLUDE</strong></h3>
                <input id="incland" className="tags" type="checkbox" value="and" onChange={e => handleTagAnd(e)} />
                <label htmlFor="incland" className="tag-label">
                    OR
                </label>
            </div>
            <div className="tag-options">
                {tagOption}
            </div>
            <div className="tag-header">
                <h3><strong>EXCLUDE</strong></h3>
            </div>
            <div className="tag-options">
                {exTagOptions}
            </div>
            <div className="tag-header">
                <h3><strong>SORT BY</strong></h3>
            </div>
            <div className="tag-options">
                <div className="tags-container">
                    <input id="createdat" className="tags" type="checkbox" value="createdat" onChange={e => handleSortCheck(e)} />
                    <label htmlFor="createdat" className="tag-label">
                        Created
                    </label>
                </div>
                <div className="tags-container">
                    <input id="updatedat" className="tags" type="checkbox" value="updatedat" onChange={e => handleSortCheck(e)} />
                    <label htmlFor="updatedat" className="tag-label">
                        Updated
                    </label>
                </div>
                <div className="tags-container">
                    <input id="none" className="tags" type="checkbox" value="none" onChange={e => handleSortCheck(e)} />
                    <label htmlFor="none" className="tag-label">
                        None
                    </label>
                </div>
            </div>
            <div className="tag-header">
                <h3><strong>DATA SAVER</strong></h3>
            </div>
            <div className="tag-options">
                <div>
                    <input checked={checked} id="data" className="tags" type="checkbox" value="data" onChange={e => dataSaver(e)} />
                    <label htmlFor="data" className="tag-label">
                        Disabled
                    </label>    
                </div>
            </div>
            <button onClick={e => resetOffset(e)} type="submit">Search</button>
        </div>
    )
}