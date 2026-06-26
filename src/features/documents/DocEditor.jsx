"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";

const PLACEHOLDER =
  'Start typing… "# " heading · "- " list · "[] " checkbox · **bold** · "> " quote';

// One document = one card: the title sits at the top of the same panel as the
// body, so it lines up with the sidebar card beside it. WYSIWYG surface that
// formats inline as you type (markdown shortcuts → real formatting). Controlled
// via `onChange({ title?, body? })`; body stored as HTML. Parent remounts this
// per document (key), so the editor initializes fresh from each doc's body.
export default function DocEditor({ doc, onChange }) {
  const editor = useEditor({
    immediatelyRender: false, // Next.js SSR: initialize on the client (no hydration mismatch)
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: PLACEHOLDER }),
    ],
    content: doc.body || "",
    editorProps: { attributes: { class: "doc-prose focus:outline-none" } },
    onUpdate: ({ editor }) => onChange({ body: editor.getHTML() }),
  });

  return (
    <div className="bg-cream-card border-2 border-forest rounded-card px-6 py-5 max-md:px-4 max-md:py-4 min-h-[64vh] flex flex-col">
      <input
        className="font-doodle font-bold text-[1.7rem] max-md:text-[1.4rem] text-forest bg-transparent w-full outline-none placeholder:text-brown-soft/40 shrink-0 pb-2 mb-3 border-b-2 border-dashed border-brown-soft/30"
        value={doc.title}
        placeholder="Untitled"
        onChange={(e) => onChange({ title: e.target.value })}
        aria-label="Document title"
      />
      <div className="flex-1 cursor-text" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
