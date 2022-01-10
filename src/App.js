import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import './App.css'
import {
	BrowserRouter as Router,
	Route,
	Redirect,
	Switch
} from 'react-router-dom';
import { initWeb3 } from './web3Client'
import Home from './pages/home'
import Product from './pages/product'
import AddItem from './pages/addItem'


const App = () => {
	useEffect(() => {
		initWeb3()
	}, []);

	return (
		<Router>
			<Switch>
				<Redirect exact from="/" to="/home" />
				<Route exact path="/home" component={() => <Home></Home>}></Route>
				<Route exact path="/product" component={() => <Product></Product>}></Route>
				<Route exact path="/add" component={() => <AddItem></AddItem>}></Route>
			</Switch>
		</Router>
	)
}

export default App;
