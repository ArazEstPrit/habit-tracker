import TopicTreeNode from "@core/study/TopicTreeNode.js";
import React, { useEffect, useRef, useState } from "react";

export const TopicSelector = (props: {
	initialValue: string;
	nodes: TopicTreeNode[];
	onSelect: (node: TopicTreeNode) => void;
}) => {
	const [inputValue, setInputValue] = useState(props.initialValue);
	const [suggestions, setSuggestions] = useState<TopicTreeNode[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Flatten the tree structure including all descendants
	const flattenNodes = (nodes: TopicTreeNode[]): TopicTreeNode[] => {
		return nodes.reduce<TopicTreeNode[]>((acc, node) => {
			return [...acc, node, ...flattenNodes(node.children)];
		}, []);
	};

	// Filter suggestions based on input
	const getSuggestions = (value: string) => {
		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;

		return inputLength === 0
			? []
			: flattenNodes(props.nodes).filter(node =>
					node.name.toLowerCase().includes(inputValue)
			  );
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);
		setSuggestions(getSuggestions(value));
		setIsDropdownOpen(true);

		if (value.trim() === "") {
			props.onSelect(null);
		}
	};

	const handleSuggestionClick = (node: TopicTreeNode) => {
		setInputValue(node.name);
		setIsDropdownOpen(false);
		props.onSelect(node);
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (
			containerRef.current &&
			!containerRef.current.contains(event.target as Node)
		) {
			setIsDropdownOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="topic-typeahead" ref={containerRef}>
			<input
				type="text"
				value={inputValue}
				onChange={handleInputChange}
				onClick={() => setIsDropdownOpen(true)}
				placeholder={"Search topics..."}
				className="typeahead-input"
			/>

			{isDropdownOpen && suggestions.length > 0 && (
				<div className="suggestions-dropdown">
					{suggestions.map(node => (
						<div
							key={node.id}
							className="suggestion-item"
							onClick={() => handleSuggestionClick(node)}
						>
							<span>{node.name}</span>
							<span className="difficulty-badge">
								{node.difficulty}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
