import './App.css';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./home";
import Manga from "./mangaInfo";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/:id" component={Manga} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
