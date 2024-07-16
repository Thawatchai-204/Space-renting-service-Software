import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AddSpace from './pages/AddSpace';
import EditSpace from './pages/EditSpace';
import Register from './pages/Register';
import Login from './pages/Login';

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
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
