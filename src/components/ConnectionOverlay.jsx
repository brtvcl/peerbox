import React from "react";
import Icon from "./Icon";

function ConnectionOverlay({ isConnected }) {

	let display;
	if (isConnected === null) {
		display = (
			<div className="absolute bottom-0 right-0 left-0 top-0 z-20 flex flex-col justify-center items-center bg-white">
				<div role="status">
					<Icon name="spinner" />
				</div>
				<p>Connecting...</p>
			</div>);
	} else if (isConnected === false) {
		display = (
		<div className="absolute bottom-0 right-0 left-0 top-0 z-20 flex flex-col justify-center items-center bg-white">
			<Icon name="cross" />
			<p>Unable to connect</p>
		</div>);
	} else if (isConnected === true) {
		display = null;
	};

	return (
		<>
			{display}
		</>
	)
}

export default ConnectionOverlay