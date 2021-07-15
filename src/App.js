import './App.css';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./home";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
