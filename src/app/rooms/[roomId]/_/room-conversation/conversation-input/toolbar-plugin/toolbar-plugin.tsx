"use client";

import { cn } from "@briom/libs/utils";
import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import {
	Bold,
	Code,
	Italic,
	List,
	ListOrdered,
	ListX,
	Strikethrough,
	Underline,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ToolbarButtonProps {
	active?: boolean;
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}

function ToolbarButton({ active, icon, label, onClick }: ToolbarButtonProps) {
	return (
		<button
			className={cn(
				"p-1.5 rounded-md transition-all hover:bg-accent",
				active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
			)}
			onClick={onClick}
			title={label}
			type="button"
		>
			{icon}
		</button>
	);
}

/**
 * FloatingToolbarPlugin — Appears when text is selected.
 *
 * Renders to document.body with fixed positioning to avoid
 * conflicts with Lexical's DOM reconciliation.
 */
export function FloatingToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const [showToolbar, setShowToolbar] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [formats, setFormats] = useState({
		bold: false,
		italic: false,
		underline: false,
		strikethrough: false,
		code: false,
	});
	const toolbarRef = useRef<HTMLDivElement>(null);

	const updateToolbar = useCallback(() => {
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection) || selection.isCollapsed()) {
				setShowToolbar(false);
				return;
			}

			const nativeSelection = window.getSelection();
			if (!nativeSelection || nativeSelection.rangeCount === 0) {
				setShowToolbar(false);
				return;
			}

			const range = nativeSelection.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			if (rect.width === 0 || rect.height === 0) {
				setShowToolbar(false);
				return;
			}

			const toolbarHeight = 40;
			const top = rect.top - toolbarHeight - 8;
			const left = rect.left + rect.width / 2 - 140;

			setPosition({
				top: Math.max(8, top),
				left: Math.max(8, left),
			});
			setShowToolbar(true);

			setFormats({
				bold: selection.hasFormat("bold"),
				italic: selection.hasFormat("italic"),
				underline: selection.hasFormat("underline"),
				strikethrough: selection.hasFormat("strikethrough"),
				code: selection.hasFormat("code"),
			});
		});
	}, [editor]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	useEffect(() => {
		const handleSelectionChange = () => {
			updateToolbar();
		};
		document.addEventListener("selectionchange", handleSelectionChange);
		return () => {
			document.removeEventListener("selectionchange", handleSelectionChange);
		};
	}, [updateToolbar]);

	useEffect(() => {
		if (!showToolbar) return;

		const handleClick = (e: MouseEvent) => {
			if (
				toolbarRef.current &&
				!toolbarRef.current.contains(e.target as Node)
			) {
				setShowToolbar(false);
			}
		};

		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [showToolbar]);

	const handleFormat = useCallback(
		(format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
		},
		[editor],
	);

	const handleList = useCallback(
		(type: "ordered" | "unordered" | "remove") => {
			if (type === "ordered") {
				editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
			} else if (type === "unordered") {
				editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
			} else {
				editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
			}
		},
		[editor],
	);

	if (!showToolbar) return null;

	const toolbar = (
		<div
			className="fixed z-50 flex items-center gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
			ref={toolbarRef}
			style={{
				top: position.top,
				left: position.left,
			}}
		>
			<ToolbarButton
				active={formats.bold}
				icon={<Bold className="size-4" />}
				label="Bold (Cmd+B)"
				onClick={() => handleFormat("bold")}
			/>
			<ToolbarButton
				active={formats.italic}
				icon={<Italic className="size-4" />}
				label="Italic (Cmd+I)"
				onClick={() => handleFormat("italic")}
			/>
			<ToolbarButton
				active={formats.underline}
				icon={<Underline className="size-4" />}
				label="Underline (Cmd+U)"
				onClick={() => handleFormat("underline")}
			/>
			<ToolbarButton
				active={formats.strikethrough}
				icon={<Strikethrough className="size-4" />}
				label="Strikethrough (Cmd+Shift+X)"
				onClick={() => handleFormat("strikethrough")}
			/>
			<ToolbarButton
				active={formats.code}
				icon={<Code className="size-4" />}
				label="Code"
				onClick={() => handleFormat("code")}
			/>
			<div className="w-px h-5 bg-border mx-1" />
			<ToolbarButton
				icon={<List className="size-4" />}
				label="Bullet List (Cmd+Shift+8)"
				onClick={() => handleList("unordered")}
			/>
			<ToolbarButton
				icon={<ListOrdered className="size-4" />}
				label="Numbered List (Cmd+Shift+7)"
				onClick={() => handleList("ordered")}
			/>
			<ToolbarButton
				icon={<ListX className="size-4" />}
				label="Remove List (Cmd+Shift+9)"
				onClick={() => handleList("remove")}
			/>
		</div>
	);

	return createPortal(toolbar, document.body);
}
