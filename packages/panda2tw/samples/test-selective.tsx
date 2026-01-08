import { Stack, HStack, Flex, Box, Card } from "./layout";

/**
 * Test for component-specific selective conversion
 *
 * Stack, HStack, Flex, Box should use selective conversion
 * Card should convert ALL props (not in the list)
 */

// Should use selective conversion (Stack is in the list)
export const StackExample = () => {
  return (
    <Stack gap="4" padding="32px" align="center" w="full">
      Content
    </Stack>
  );
};

// Should use selective conversion (HStack is in the list)
export const HStackExample = () => {
  return (
    <HStack gap="8" color="text-blue-500" justifyContent="between">
      Content
    </HStack>
  );
};

// Should use selective conversion (Flex is in the list)
export const FlexExample = () => {
  return (
    <Flex direction="row" gap="4" backgroundColor="bg-gray-100" h="full">
      Content
    </Flex>
  );
};

// Should use selective conversion (Box is in the list)
export const BoxExample = () => {
  return (
    <Box padding="16px" color="text-red-500" width="full">
      Content
    </Box>
  );
};

// Should convert ALL props (Card is NOT in the list)
export const CardExample = () => {
  return (
    <Card gap="4" padding="32px" align="center" color="text-green-500">
      Content
    </Card>
  );
};
