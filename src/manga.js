import "./manga.css";
import React, { useState, useEffect } from "react";
const axios = require("axios");

export default function Manga({ match }) {
    let mangaID = match.params.id;
    return (
        <div>
            <p>{mangaID}</p>
        </div>
    )
}