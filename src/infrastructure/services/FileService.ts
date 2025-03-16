#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import User from "@core/user/User.js";

export default class FileService {
	private static readonly USER_PATH: string = "../data/user.json";

	private static readonly resolvedPath: string = resolve(
		import.meta.dirname,
		FileService.USER_PATH
	);

	public static readUser(): User {
		if (Date.now() - FileService.lastIOTime < 1000) return;

		try {
			const fileContent = readFileSync(FileService.resolvedPath, "utf-8");
			const userData = JSON.parse(fileContent);

			const user = User.fromJSON(userData);

			return user;
		} catch (error) {
			console.error("Error reading user file on desktop:", error);
		}

		this.lastIOTime = Date.now();
	}

	public static lastIOTime: number = 0;

	public static writeUser(user: User) {
		try {
			const data = JSON.stringify(user.toJSON(), null, 2);

			const directory = dirname(FileService.resolvedPath);

			if (!existsSync(directory)) {
				mkdirSync(directory, {
					recursive: true,
				});
			}

			this.lastIOTime = Date.now();
			writeFileSync(FileService.resolvedPath, data, "utf-8");
		} catch (error) {
			console.error("Error writing user file on desktop:", error);
		}
	}

	public static watchUser(callback: (user: User) => void) {
		try {
			watch(FileService.resolvedPath, () => {
				callback(FileService.readUser());
			});
		} catch (error) {
			console.error("Error watching user file on desktop:", error);
		}
	}
}
