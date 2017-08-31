import React from 'react';

class Room extends React.Component {
	render () {
		return (
			<div className="room">
				<div className="room__title" >{this.props.name}</div>
				<div className="room__items">{this.props.children}</div>
			</div>
		);
	}
}

export default Room;