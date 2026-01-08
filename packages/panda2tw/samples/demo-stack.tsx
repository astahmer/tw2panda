import { Stack, HStack } from "./layout";

// Without --with-jsx-stack: ALL props get converted to className
// With --with-jsx-stack:
//   - gap="8" is exposed variant with exposed value → stays as JSX prop
//   - justifyContent="between" is exposed variant with exposed value → stays as JSX prop
//   - color="content.secondary" is NOT exposed variant → converts to className
//   - width="[6px]" is exposed variant but "[6px]" is NOT an exposed value → converts to className
export const DemoCard = () => {
  return (
    <HStack gap="8" color="content.secondary" justifyContent="between" width="[6px]">
      <div>Content</div>
    </HStack>
  );
};

// Another example showing mixed cases
export const ComplexLayout = () => {
  return (
    <Stack
      direction="col"
      align="center"
      gap="4"
      padding="32px"
      backgroundColor="bg.surface"
      w="full"
      h="full"
    >
      <HStack
        gap="2"
        align="start"
        width="[500px]"
        spacing="16px"
        display="flex"
      >
        <div>Item 1</div>
        <div>Item 2</div>
      </HStack>
    </Stack>
  );
};
