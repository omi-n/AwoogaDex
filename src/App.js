import './App.css';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./home";
import Manga from "./mangaInfo";
import MangaReader from "./mangaReader";
import NotFound from "./notFound";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/manga/:id" component={Manga} />
          <Route path="/chapter/:chapterID/:chapterIndex/:offset" component={MangaReader} />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
