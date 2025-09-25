import { useState } from "react";
import {
  Flex,
  Heading,
  TextField,
  IconButton,
  Spinner,
} from "@radix-ui/themes";
import { Pencil1Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

interface EditableUsernameProps {
  initialUsername: string;
  onSave: (newUsername: string) => Promise<void>;
}

export default function EditableUsername({
  initialUsername,
  onSave,
}: EditableUsernameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (username.trim() === initialUsername || !username.trim()) {
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      await onSave(username);
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      /* empty */
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(initialUsername);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Flex align="center" gap="2">
        <TextField.Root
          size="3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          disabled={isLoading}
        />
        <Flex gap="1">
          <IconButton
            onClick={handleSave}
            disabled={isLoading}
            style={{ color: "var(--gray-a3)" }}
            aria-label="Save"
          >
            {isLoading ? <Spinner size="1" /> : <CheckIcon color="white" />}
          </IconButton>
          <IconButton
            onClick={handleCancel}
            disabled={isLoading}
            color="red"
            variant="soft"
            aria-label="Cancel"
          >
            <Cross2Icon />
          </IconButton>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex align="center" gap="3" className="relative pr-8">
      {" "}
      <Heading size="8">{initialUsername}</Heading>
      <IconButton
        onClick={() => setIsEditing(true)}
        variant="ghost"
        aria-label="Edit username"
        style={{
          position: "absolute",
          right: -25,
          top: 15,
        }}
      >
        <Pencil1Icon />
      </IconButton>
    </Flex>
  );
}
