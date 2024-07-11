import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AddSpace from './pages/AddSpace';
import EditSpace from './pages/EditSpace';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/add-space" component={AddSpace} />
          <Route path="/edit-space/:id" component={EditSpace} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
