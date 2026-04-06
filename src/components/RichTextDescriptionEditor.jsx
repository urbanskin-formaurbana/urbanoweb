import {
  RichTextEditor,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonBlockquote,
  MenuControlsContainer,
  MenuDivider,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";
import {useRef} from "react";
import {Box, Typography} from "@mui/material";

const extensions = [StarterKit];

export default function RichTextDescriptionEditor({
  value,
  onChange,
  label = "Descripción",
}) {
  const rteRef = useRef(null);

  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{mb: 0.5, display: "block"}}
        >
          {label}
        </Typography>
      )}
      <RichTextEditor
        ref={rteRef}
        extensions={extensions}
        content={value || ""}
        onUpdate={({editor}) => {
          onChange(editor.getHTML());
        }}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonUnderline />
            <MenuDivider />
            <MenuButtonBulletedList />
            <MenuButtonOrderedList />
            <MenuButtonBlockquote />
          </MenuControlsContainer>
        )}
      />
    </Box>
  );
}
