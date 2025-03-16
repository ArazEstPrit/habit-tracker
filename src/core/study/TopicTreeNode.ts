import TopicTreeNodeJSON from "@core/Json/TopicTreeNodeJSON.js";

export default class TopicTreeNode {
	private _id: string;
	private _name: string;
	private _difficulty: number;
	private _children: TopicTreeNode[];

	constructor(
		id: string,
		name: string,
		difficulty: number,
		children: TopicTreeNode[]
	) {
		this._id = id;

		this.validateName(name);
		this._name = name;

		this.validateDifficulty(difficulty);
		this._difficulty = difficulty;

		this._children = children;
	}

	private validateName(name: string): void {
		if (!name) throw new Error("Topic name cannot be empty");
	}

	private validateDifficulty(difficulty: number): void {
		if (isNaN(difficulty)) {
			throw new Error("Difficulty must be a number");
		} else if (difficulty < 0 || difficulty > 5) {
			throw new Error("Difficulty must be between 0 and 5");
		}
	}

	public get name() {
		return this._name;
	}

	public get difficulty() {
		return this._difficulty;
	}

	public get children() {
		return this._children;
	}

	public get id() {
		return this._id;
	}

	public set id(id: string) {
		if (!id) throw new Error("Id cannot be empty");

		this._id = id;
	}

	public set name(name: string) {
		this.validateName(name);
		this._name = name;
	}

	public set difficulty(difficulty: number) {
		this.validateDifficulty(difficulty);
		this._difficulty = difficulty;
	}

	public set children(children: TopicTreeNode[]) {
		this._children = children;
	}

	public addChildren(children: TopicTreeNode[]) {
		this._children = this._children.concat(children);
	}

	public removeChild(childId: string) {
		this._children = this._children.filter(child => child.id !== childId);
	}

	public search(id: string): TopicTreeNode | null {
		if (this.id === id) return this;

		return (
			this.children
				.map(child => child.search(id))
				.filter(child => child !== null)
				.pop() || null
		);
	}

	public flatten(): TopicTreeNode[] {
		return [this, ...this.children.flatMap(child => child.flatten())];
	}

	public toJSON(): TopicTreeNodeJSON {
		return {
			id: this.id,
			name: this.name,
			difficulty: this.difficulty,
			children: this.children.map(child => child.toJSON()),
		};
	}

	public static fromJSON(json: TopicTreeNodeJSON): TopicTreeNode {
		if (!json) return null;

		return new TopicTreeNode(
			json.id,
			json.name,
			json.difficulty,
			json.children.map((child: TopicTreeNodeJSON) =>
				TopicTreeNode.fromJSON(child)
			)
		);
	}
}
