import { Container, Flex, HStack, Stack } from "panda/jsx";
import { styled } from "panda/jsx";
import PlaygroundWithMachine from "./Playground/PlaygroundWithMachine";

import "../styles.css";
import "@fontsource/inter"; // Defaults to weight 400
import { ThemeProvider } from "./vite-theme";
import { ColorModeSwitch } from "./color-mode-switch";
import { GithubIcon } from "./github-icon";

export const Home = () => {
  return (
    <ThemeProvider>
      <Flex
        w="100%"
        height="100vh"
        color={{ base: "cyan.600", _dark: "cyan.200" }}
        bg={{ base: "whiteAlpha.100", _dark: "whiteAlpha.200" }}
        fontFamily="Inter"
        // color="var(--vscode-editor-foreground)"
        // bg="var(--vscode-editor-background)"
      >
        <Container w="100%" h="100%">
          <Stack w="100%" h="100%">
            <Flex pt="2">
              <styled.h1 textStyle="panda.h4" fontWeight="bold">
                Tailwind to Panda (tw2panda)
              </styled.h1>
              <HStack alignItems="center" ml="auto">
                <styled.a color="black">
                  <GithubIcon />
                </styled.a>
                <ColorModeSwitch />
              </HStack>
            </Flex>
            <PlaygroundWithMachine />
          </Stack>
        </Container>
      </Flex>
    </ThemeProvider>
  );
};
