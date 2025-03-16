import React, { useState, useEffect } from "react";
import { registerNewUser } from "../../utils/userUtils.js";
import { Popup } from "../UI/Popup.jsx";

export function RegisterPopup() {
	const [inputValue, setInputValue] = useState("");
	const [networkUsers, setNetworkUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch available users when component mounts
	useEffect(() => {
		const discoverUsers = async () => {
			try {
				// First discover servers in the network
				const serversResponse = await fetch("/api/discover-servers");
				const servers = await serversResponse.json();

				// Get user info from each server
				const users = await Promise.all(
					servers.map(async ip => {
						const response = await fetch(
							`http://${ip}:8080/api/user`,
							{
								method: "GET",
								headers: {
									"Content-Type": "application/json",
								},
							}
						);
						const data = await response.json();
						return { ...data, ip };
					})
				);

				setNetworkUsers(users);
			} catch (err) {
				setError("Failed to discover network users");
			} finally {
				setLoading(false);
			}
		};

		discoverUsers();
	}, []);

	const handleSubmit = async () => {
		if (inputValue !== "") {
			registerNewUser(inputValue);
		}
	};

	const handleSelectUser = async user => {
		try {
			const response = await fetch("/api/select-user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: user.id }),
			});

			if (!response.ok) {
				throw new Error("Sync failed");
			}
		} catch (err) {
			setError("Failed to connect to user");
		}
	};

	return (
		<Popup onSubmit={handleSubmit}>
			<h3>Welcome!</h3>
			<div className="name-input">
				<label htmlFor="username">Register New User:</label>
				<input
					type="text"
					id="username"
					name="username"
					placeholder="Enter your username"
					onChange={e => setInputValue(e.target.value.trim())}
				/>
			</div>
			<input type="submit" value="Register" />

			<div className="user-selection">
				<h4>Or select existing user:</h4>

				{loading && (
					<div className="loading">Searching for users...</div>
				)}

				{error && <div className="error">{error}</div>}

				{!loading && networkUsers.length === 0 && (
					<div className="notice">No users found in network</div>
				)}

				<div className="user-list">
					{networkUsers.map(user => (
						<div
							key={user.id}
							className="user-item"
							onClick={() => handleSelectUser(user)}
						>
							<div className="username">{user.username}</div>
							<div className="ip">IP: {user.ip}</div>
						</div>
					))}
				</div>
			</div>
		</Popup>
	);
}
