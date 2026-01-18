import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

import type { BlockNoteEditor } from "../../../editor/BlockNoteEditor.js";
import {
  BlockSchema,
  InlineContentSchema,
  StyleSchema,
} from "../../../schema/index.js";
import { FilePanelExtension } from "../../../extensions/FilePanel/FilePanel.js";
import { acceptedMIMETypes } from "./acceptedMIMETypes.js";
import { handleFileInsertion } from "./handleFileInsertion.js";

export const createDropFileExtension = <
  BSchema extends BlockSchema,
  I extends InlineContentSchema,
  S extends StyleSchema,
>(
  editor: BlockNoteEditor<BSchema, I, S>,
) =>
  Extension.create<{ editor: BlockNoteEditor<BSchema, I, S> }, undefined>({
    name: "dropFile",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleDOMEvents: {
              drop(_view, event) {
                if (!editor.isEditable) {
                  return;
                }

                let format: (typeof acceptedMIMETypes)[number] | null = null;
                for (const mimeType of acceptedMIMETypes) {
                  if (event.dataTransfer!.types.includes(mimeType)) {
                    format = mimeType;
                    break;
                  }
                }
                if (format === null) {
                  return true;
                }

                if (format === "Files") {
                  const filePanelExtension = editor.getExtension(FilePanelExtension);
                  const filePanelBlockId = filePanelExtension?.store.state;

                  if (filePanelBlockId) {
                    const target = event.target as HTMLElement;
                    // Check if the drop target is within the FilePanel using closest()
                    // This works correctly even when FilePanel is in a floating-ui portal
                    const isInFilePanel = target.closest(
                      '.bn-panel, .bn-tab-panel, [class*="FilePanel"], [class*="file-panel"]'
                    );

                    if (isInFilePanel) {
                      // Let the FilePanel's own drop handler handle this
                      // Don't handle the event in ProseMirror
                      return true;
                    }
                  }

                  handleFileInsertion(event, editor);
                  return true;
                }

                return false;
              },
            },
          },
        }),
      ];
    },
  });
