import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

// Creates a local blob URL for the file (for testing without an upload server).
async function uploadFile(file: File) {
  return URL.createObjectURL(file);
}

export default function App() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "Welcome to this demo!",
      },
      {
        type: "paragraph",
        content: "Upload an image using the button below",
      },
      {
        type: "image",
      },
      {
        type: "paragraph",
      },
    ],
    uploadFile,
  });

  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} />;
}
