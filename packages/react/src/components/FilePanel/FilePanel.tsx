import {
  BlockSchema,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  InlineContentSchema,
  PartialBlock,
  StyleSchema,
} from "@blocknote/core";
import { DragEvent, useCallback, useState } from "react";

import {
  ComponentProps,
  useComponentsContext,
} from "../../editor/ComponentsContext.js";
import { useBlockNoteEditor } from "../../hooks/useBlockNoteEditor.js";
import { useDictionary } from "../../i18n/dictionary.js";
import { EmbedTab } from "./DefaultTabs/EmbedTab.js";
import { UploadTab } from "./DefaultTabs/UploadTab.js";
import { FilePanelProps } from "./FilePanelProps.js";

type PanelProps = ComponentProps["FilePanel"]["Root"];

/**
 * By default, the FilePanel component will render with default tabs. However,
 * you can override the tabs to render by passing the `tabs` prop. You can use
 * the default tab panels in the `DefaultTabPanels` directory or make your own
 * using the `FilePanelPanel` component.
 */
export const FilePanel = <
  B extends BlockSchema = DefaultBlockSchema,
  I extends InlineContentSchema = DefaultInlineContentSchema,
  S extends StyleSchema = DefaultStyleSchema,
>(
  props: FilePanelProps & Partial<Pick<PanelProps, "defaultOpenTab" | "tabs">>,
) => {
  const Components = useComponentsContext()!;
  const dict = useDictionary();

  const editor = useBlockNoteEditor<B, I, S>();

  const [loading, setLoading] = useState<boolean>(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files?.[0];
      if (!file || !editor.uploadFile) {
        return;
      }

      (async () => {
        setLoading(true);
        try {
          let updateData = await editor.uploadFile!(file, props.blockId);
          if (typeof updateData === "string") {
            updateData = {
              props: {
                name: file.name,
                url: updateData,
              },
            } as PartialBlock<B, I, S>;
          }
          editor.updateBlock(props.blockId, updateData);
        } catch {
          // Leave panel open so the user can retry.
        } finally {
          setLoading(false);
        }
      })();
    },
    [editor, props.blockId],
  );

  const tabs: PanelProps["tabs"] = props.tabs ?? [
    ...(editor.uploadFile !== undefined
      ? [
          {
            name: dict.file_panel.upload.title,
            tabPanel: (
              <UploadTab blockId={props.blockId} setLoading={setLoading} />
            ),
          },
        ]
      : []),
    {
      name: dict.file_panel.embed.title,
      tabPanel: <EmbedTab blockId={props.blockId} />,
    },
  ];

  const [openTab, setOpenTab] = useState<string>(
    props.defaultOpenTab || tabs[0].name,
  );

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      <Components.FilePanel.Root
        className={"bn-panel bn-add-file-panel"}
        defaultOpenTab={openTab}
        openTab={openTab}
        setOpenTab={setOpenTab}
        tabs={tabs}
        loading={loading}
      />
    </div>
  );
};
