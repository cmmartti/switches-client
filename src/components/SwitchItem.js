import React from 'react';

class SwitchItem extends React.Component {
	render () {
		return (
			<div className="switch-item">
				<div className="switch-item__title">{this.props.item.name}</div>
				<div className="switch-item__id">{this.props.item.id}</div>
				<div className="switch-item__buttons">
					<button className={"switch-item__buttons__star" + (this.props.isFavourite ? ' switch-item__buttons__star--selected' : '')}
							onClick={() => this.props.button(this.props.item.id, 'star')}>☆</button>
					<button className="switch-item__buttons__off"
							onClick={() => this.props.button(this.props.item.id, 'off')}>OFF</button>
					<button className="switch-item__buttons__on"
							onClick={() => this.props.button(this.props.item.id, 'on')}>ON</button>
				</div>
			</div>
		);
	}
}

export default SwitchItem;

// :{this.props.item.gpio_pin_on}/{this.props.item.gpio_pin_off}