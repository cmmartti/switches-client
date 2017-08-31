import React from 'react';
import {render} from 'react-dom';
import mqtt from 'mqtt';

import Room from './components/Room';
import SwitchItem from './components/SwitchItem';
import './styles/styles.scss';


class App extends React.Component {
	constructor() {
		super();
		this.client = mqtt.connect({port: 1884, host: '192.168.2.100'});
		this.state = {
			firstLoad: true,
			error: false,
			items: [],
			favourites: new Set()
		};
	}
	componentDidMount() {
		// Retrieve previously saved items/favourites from localStorage so the page can load immediately
		try {
			let items = JSON.parse(localStorage.getItem('items'));
			if (items) this.setState({items: items, firstLoad: false});
			
			let favourites = JSON.parse(localStorage.getItem('favourites'));
			if (favourites) this.setState({favourites: new Set(favourites)});
			
		} catch (e) {
			if (e instanceof SyntaxError) {
				console.error(e.name + "\n" + e.message)
			}
			else throw e;
		}
		
		this.client.on('connect', () => {
			this.client.subscribe('gelv/connected');
			this.client.subscribe('gelv/status/#');
			this.client.subscribe('gelv/status');
			this.client.publish('gelv/get', ' '); // Always start with the most up-to-date info
		});
		
		this.client.on('message', (topic, message) => {
			// gelv/status - status of all items
			if (/^gelv[/]status$/.test(topic)) {
				let items = JSON.parse(message.toString());
				localStorage.setItem('items', message);
				this.setState({
					items: items,
					firstLoad: false
				});
			}
			// gelv/status/20 - status of item 20
			else if (/^gelv[/]status[/][0-9]+$/.test(topic)) {
				let item = JSON.parse(message.toString());
				let items = this.state.items;
				
				// Find the correct index of item.id in the items array
				let index = items.findIndex(search_item => item && search_item.id === item.id);
				if (index === -1) { // doesn't exist yet, so add it
					items.push(item);
				}
				else { // update it
					items[index] = item;
				}
				
				localStorage.setItem('items', JSON.stringify((items)));
				this.setState({items: items});
			}
		});
		this.client.on('error', () => {
			this.setState({error: "Could not connect to the MQTT server."});
		});
	}
	button(id, action) {
		if (action === "on") {
			this.client.publish('gelv/set/' + id, 'on');
		}
		else if (action === "off") {
			this.client.publish('gelv/set/' + id, 'off');
		}
		else if (action === "star") {
			let favourites = this.state.favourites;
			if (favourites.has(id)) favourites.delete(id);
			else favourites.add(id);
			
			this.setState({favourites: favourites});
			
			let json = JSON.stringify([...favourites]);
			localStorage.setItem('favourites', json);
		}
	}
	render() {
		if (this.state.error) {
			return <div>{this.state.error}</div>
		}
		if (this.state.firstLoad) {
			return <div>Loading, please wait ...</div>
		}
		
		// Determine what rooms exist in a nice handy 'rooms' array
		let rooms = [];
		this.state.items.map(item => {
			if (item) rooms[item.location.id] = item.location
		});
		
		// Determine what favourites exist, and sort them into 'favourites'
		let favourites = [];
		[...this.state.favourites].map(id => {
			let item = this.state.items.find(searchItem => searchItem && searchItem.id === id);
			if (item) favourites.push(item);
		});
		favourites = favourites.sort((a, b) => {
			if (a.location.id < b.location.id) return -1;
			if (a.location.id > b.location.id) return 1;
			return a.id - b.id;
		});
		
		return (
			<div>
				{!this.client.connected ? <p>Offline</p> : ''}
				{this.client.reconnecting ? <p>Reconnecting to the server...</p> : ''}
				
				<div className="room-container">
					<Room name="Favourites">
						{favourites.map(item => (
							<SwitchItem item={item}
										key={item.id}
										isFavourite={true}
										button={this.button.bind(this)}/>
						))}
					</Room>
					
					{rooms.map(room => (
						<Room name={room.name} key={room.id}>
								{this.state.items.map(item => {
									// Does this item exist, and if so, are we in the right room?
									if (item && room.id === item.location.id) {
										return (
											<SwitchItem item={item}
														key={item.id}
														isFavourite={this.state.favourites.has(item.id)}
														button={this.button.bind(this)} />
										);
									}
								})}
							</Room>
					))}
				</div>
			</div>
		);
	}
}

render(<App/>, document.getElementById('app'));