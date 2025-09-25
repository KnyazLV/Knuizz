import { useRouteError } from "react-router-dom";
import { Callout, Flex, Text, Button } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    if ("statusText" in error && typeof error.statusText === "string") {
      return error.statusText;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return "Unknown error";
};

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage = getErrorMessage(error);

  return (
    <Flex
      align="center"
      direction="column"
      style={{ height: "100vh", padding: 24, marginTop: 100 }}
    >
      <Callout.Root color="red">
        <Flex direction="column" justify="center" align="center" gap="3">
          <Flex gap="2" justify="center" align="center">
            <Callout.Icon>
              <InfoCircledIcon
                style={{ width: 35, height: 35, flexShrink: 0 }}
              />
            </Callout.Icon>

            <Text size="7" weight="bold">
              Oops! Something went wrong.
            </Text>
          </Flex>

          <Flex direction="column" justify="center" align="center" gap="2">
            <Callout.Text>{errorMessage}</Callout.Text>
            <Button variant="solid" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </Flex>
        </Flex>
      </Callout.Root>
    </Flex>
  );
}
