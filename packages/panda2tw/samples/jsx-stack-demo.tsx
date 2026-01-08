import { Stack, HStack } from "./layout";

/**
 * Demonstration of --with-jsx-stack flag behavior
 *
 * When using the --with-jsx-stack flag during conversion:
 * - Props that ARE in the exposed variants and have exposed values → stay as JSX props
 * - Props that are NOT exposed OR have non-exposed values → convert to className
 */

/**
 * Example 1: HStack with mix of exposed and non-exposed props
 *
 * WITHOUT --with-jsx-stack:
 *   All props converted to className="gap-8 text-content-secondary justify-between w-[6px]"
 *
 * WITH --with-jsx-stack:
 *   gap="8" → stays (exposed variant, exposed value "8")
 *   justifyContent="between" → stays (exposed variant, exposed value "between")
 *   color="content.secondary" → converts (NOT an exposed variant)
 *   width="[6px]" → converts (exposed variant "width"/"w" but "[6px]" is NOT an exposed value)
 */
export const ExampleOne = () => {
  return (
    <HStack
      gap="8"
      color="content.secondary"
      justifyContent="between"
      width="[6px]"
    >
      <div>Left</div>
      <div>Right</div>
    </HStack>
  );
};

/**
 * Example 2: Stack with all exposed props
 *
 * WITHOUT --with-jsx-stack:
 *   All converted to className="flex-col items-center gap-4 w-full h-full"
 *
 * WITH --with-jsx-stack:
 *   All stay as JSX props (all are exposed with exposed values)
 */
export const ExampleTwo = () => {
  return (
    <Stack
      direction="col"
      align="center"
      gap="4"
      w="full"
      h="full"
    >
      <div>Content</div>
    </Stack>
  );
};

/**
 * Example 3: Stack with mixed exposed and non-exposed props
 *
 * WITHOUT --with-jsx-stack:
 *   All converted: className="gap-4 p-32px bg-bg-surface flex-wrap w-full h-full"
 *
 * WITH --with-jsx-stack:
 *   gap="4" → stays (exposed variant, exposed value)
 *   padding="32px" → converts (NOT an exposed variant)
 *   backgroundColor="bg.surface" → converts (NOT an exposed variant)
 *   wrap={true} → converts (exposed variant but boolean true is value, need to check)
 *   w="full" → stays (exposed variant, exposed value)
 *   h="full" → stays (exposed variant, exposed value)
 */
export const ExampleThree = () => {
  return (
    <Stack
      gap="4"
      padding="32px"
      backgroundColor="bg.surface"
      wrap={true}
      w="full"
      h="full"
    >
      <div>Wrapped content</div>
    </Stack>
  );
};

/**
 * Example 4: HStack with arbitrary values
 *
 * WITHOUT --with-jsx-stack:
 *   All converted to classes
 *
 * WITH --with-jsx-stack:
 *   gap="99" → converts (gap only supports 0-12)
 *   align="baseline" → converts (not in exposed values)
 *   width="[calc(100%-20px)]" → converts (not in exposed values)
 */
export const ExampleFour = () => {
  return (
    <HStack
      gap="99"
      align="baseline"
      width="[calc(100%-20px)]"
    >
      <div>Custom sizing</div>
    </HStack>
  );
};
