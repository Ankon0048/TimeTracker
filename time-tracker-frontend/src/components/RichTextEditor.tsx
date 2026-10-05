"use client";

import React from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Link, RichTextEditor as MantineRichTextEditor } from "@mantine/tiptap";

interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TEXT_COLORS = [
  "#25262b",
  "#868e96",
  "#fa5252",
  "#e64980",
  "#be4bdb",
  "#7950f2",
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#82c91e",
  "#fab005",
  "#fd7e14",
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter description…",
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit ships its own Link; Mantine's adds the link-editing popover shortcut.
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false }),
      Highlight,
      TextStyle,
      Color,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
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
    <MantineRichTextEditor
      editor={editor}
      bg={disabled ? "gray.1" : undefined}
      className="rich-text-editor"
    >
      {!disabled && (
        <MantineRichTextEditor.Toolbar>
          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.Bold />
            <MantineRichTextEditor.Italic />
            <MantineRichTextEditor.Underline />
            <MantineRichTextEditor.Strikethrough />
            <MantineRichTextEditor.Highlight />
            <MantineRichTextEditor.Code />
            <MantineRichTextEditor.ClearFormatting />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.ColorPicker colors={TEXT_COLORS} />
            <MantineRichTextEditor.UnsetColor />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.H1 />
            <MantineRichTextEditor.H2 />
            <MantineRichTextEditor.H3 />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.BulletList />
            <MantineRichTextEditor.OrderedList />
            <MantineRichTextEditor.TaskList />
            <MantineRichTextEditor.TaskListSink />
            <MantineRichTextEditor.TaskListLift />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.Blockquote />
            <MantineRichTextEditor.CodeBlock />
            <MantineRichTextEditor.Hr />
            <MantineRichTextEditor.Subscript />
            <MantineRichTextEditor.Superscript />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.Link />
            <MantineRichTextEditor.Unlink />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.AlignLeft />
            <MantineRichTextEditor.AlignCenter />
            <MantineRichTextEditor.AlignRight />
            <MantineRichTextEditor.AlignJustify />
          </MantineRichTextEditor.ControlsGroup>

          <MantineRichTextEditor.ControlsGroup>
            <MantineRichTextEditor.Undo />
            <MantineRichTextEditor.Redo />
          </MantineRichTextEditor.ControlsGroup>
        </MantineRichTextEditor.Toolbar>
      )}

      <MantineRichTextEditor.Content />
    </MantineRichTextEditor>
  );
};
