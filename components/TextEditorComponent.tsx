import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import "../style/TextEditor.css";

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
}

export const TextEditorComponent: React.FC<TextEditorProps> = ({
  content,
  setContent,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({ placeholder: "Kirjoita tähän..." }),
    ],
    content: content, // Initialize with saved content
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML()); // Save content in state
    },
  });

  if (!editor) return null;

  // Function to check if a button is active
  const isActive = (type: string, options = {}) =>
    editor.isActive(type, options) ? "active" : "";

  return (
    <div className="editor-container">
      {/* Toolbar */}
      <div className="toolbar">
        <button
          type="button"
          className={isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </button>
        <button
          type="button"
          className={isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button
          type="button"
          className={isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        <button
          type="button"
          className={isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          className={isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↪
        </button>
      </div>

      {/* Editor Content */}
      <div className="editor-box">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
