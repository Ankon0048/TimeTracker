"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";

interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  active,
  title,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "28px",
      height: "28px",
      border: "none",
      borderRadius: "4px",
      background: active ? "var(--accent-color, #6366f1)" : "transparent",
      color: active ? "#fff" : "var(--text-primary)",
      cursor: "pointer",
      transition: "background 0.15s",
    }}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter description…",
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, Placeholder.configure({ placeholder })],
    content: value,
    editable: !disabled,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync content when value changes externally (e.g. switching tasks)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // Sync editable state
  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div
      style={{
        border: "1px solid var(--border-color, #e5e7eb)",
        borderRadius: "8px",
        overflow: "hidden",
        background: disabled ? "#f3f4f6" : "var(--bg-secondary, #fff)",
      }}
    >
      {!disabled && (
        <div
          style={{
            display: "flex",
            gap: "2px",
            padding: "4px 6px",
            borderBottom: "1px solid var(--border-color, #e5e7eb)",
            background: "var(--bg-primary, #f9fafb)",
          }}
        >
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Italic"
          >
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough size={14} />
          </ToolbarButton>
          <div
            style={{
              width: "1px",
              background: "var(--border-color, #e5e7eb)",
              margin: "2px 4px",
            }}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered size={14} />
          </ToolbarButton>
        </div>
      )}

      <style>{`
        .tiptap-editor .tiptap {
          padding: 8px 12px;
          min-height: 100px;
          outline: none;
          font-size: 0.875rem;
          color: var(--text-primary);
          line-height: 1.6;
        }
        .tiptap-editor .tiptap p { margin: 0 0 0.25rem; }
        .tiptap-editor .tiptap ul,
        .tiptap-editor .tiptap ol { padding-left: 1.25rem; margin: 0.25rem 0; }
        .tiptap-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #adb5bd;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
