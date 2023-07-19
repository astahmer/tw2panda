import { createMergeCss } from "@pandacss/shared";
import { describe, expect, test } from "vitest";
import { createPandaContext } from "../src/panda-context";
import { createTailwindContext } from "../src/tw-context";
import { rewriteTwFileContentToPanda } from "../src/rewrite-tw-file-content-to-panda";
import { initialInputList } from "../../../demo-code-sample";

// @ts-expect-error
import buttonRaw from "../samples/button?raw";
import tailwindConfigRaw from "../samples/tailwind.config.cjs";

describe("extract-tw-class-list", () => {
  test("samples/button.ts", () => {
    const tailwind = createTailwindContext(initialInputList["tailwind.config.js"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const { output } = rewriteTwFileContentToPanda(buttonRaw, tailwind.context, panda, mergeCss);

    expect(output).toMatchInlineSnapshot(`
      "/** @see https://github.com/shadcn/ui/blob/ac5c727fc966a8cf859ced4a4074ddf9a31da922/apps/www/registry/default/ui/button.tsx#L12 */

      import * as React from 'react'
      import { Slot } from '@radix-ui/react-slot'
      import { cva, type RecipeVariantProps } from 'styled-system/css'
      import { cn } from '@/lib/utils'

      const buttonVariants = cva({
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'md',
          fontSize: 'sm',
          lineHeight: 'sm',
          fontWeight: 'medium',
          transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
          transitionTimingFunction: 'colors',
          transitionDuration: 'colors',
          'focus-visible': { ring: 'none', ringOffset: 'none', shadow: '2' },
          _disabled: { pointerEvents: 'none', opacity: '0.5' },
        },
        variants: {
          variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: { borderWidth: '1px' },
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: { textUnderlineOffset: '4px', _hover: { textDecorationLine: 'underline' } },
          },
          size: {
            default: { h: '10', pl: '4', pr: '4', pt: '2', pb: '2' },
            sm: { h: '9', rounded: 'md', pl: '3', pr: '3' },
            lg: { h: '11', rounded: 'md', pl: '8', pr: '8' },
            icon: { h: '10', w: '10' },
          },
        },
        defaultVariants: {
          variant: 'default',
          size: 'default',
        },
      })

      export interface ButtonProps
        extends React.ButtonHTMLAttributes<HTMLButtonElement>,
          VariantProps<typeof buttonVariants> {
        asChild?: boolean
      }

      const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
        ({ className, variant, size, asChild = false, ...props }, ref) => {
          const Comp = asChild ? Slot : 'button'
          return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        },
      )
      Button.displayName = 'Button'

      export { Button, buttonVariants }
      "
    `);
  });

  test("samples/button.ts with custom tailwind.config", () => {
    const tailwind = createTailwindContext(tailwindConfigRaw);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const { output } = rewriteTwFileContentToPanda(buttonRaw, tailwind.context, panda, mergeCss);

    expect(output).toMatchInlineSnapshot(`
      "/** @see https://github.com/shadcn/ui/blob/ac5c727fc966a8cf859ced4a4074ddf9a31da922/apps/www/registry/default/ui/button.tsx#L12 */

      import * as React from 'react'
      import { Slot } from '@radix-ui/react-slot'
      import { cva, type RecipeVariantProps } from 'styled-system/css'
      import { cn } from '@/lib/utils'

      const buttonVariants = cva({
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'md',
          fontSize: 'sm',
          lineHeight: 'sm',
          fontWeight: 'medium',
          transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
          transitionTimingFunction: 'colors',
          transitionDuration: 'colors',
          'focus-visible': { ring: 'none', ringOffset: 'none', shadow: '2' },
          _disabled: { pointerEvents: 'none', opacity: '0.5' },
        },
        variants: {
          variant: {
            default: { bgColor: 'primary', color: 'primary.foreground', _hover: { bgColor: 'primary/90' } },
            destructive: { bgColor: 'destructive', color: 'destructive.foreground', _hover: { bgColor: 'destructive/90' } },
            outline: {
              borderWidth: '1px',
              borderColor: 'input',
              bgColor: 'background',
              _hover: { bgColor: 'accent', color: 'accent.foreground' },
            },
            secondary: { bgColor: 'secondary', color: 'secondary.foreground', _hover: { bgColor: 'secondary/80' } },
            ghost: { _hover: { bgColor: 'accent', color: 'accent.foreground' } },
            link: { color: 'primary', textUnderlineOffset: '4px', _hover: { textDecorationLine: 'underline' } },
          },
          size: {
            default: { h: '10', pl: '4', pr: '4', pt: '2', pb: '2' },
            sm: { h: '9', rounded: 'md', pl: '3', pr: '3' },
            lg: { h: '11', rounded: 'md', pl: '8', pr: '8' },
            icon: { h: '10', w: '10' },
          },
        },
        defaultVariants: {
          variant: 'default',
          size: 'default',
        },
      })

      export interface ButtonProps
        extends React.ButtonHTMLAttributes<HTMLButtonElement>,
          VariantProps<typeof buttonVariants> {
        asChild?: boolean
      }

      const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
        ({ className, variant, size, asChild = false, ...props }, ref) => {
          const Comp = asChild ? Slot : 'button'
          return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        },
      )
      Button.displayName = 'Button'

      export { Button, buttonVariants }
      "
    `);
  });

  test("Playground defaultCode", () => {
    const tailwind = createTailwindContext(initialInputList["tailwind.config.js"]);
    const panda = createPandaContext();
    const { mergeCss } = createMergeCss({
      utility: panda.utility,
      conditions: panda.conditions,
      hash: false,
    });

    const { output } = rewriteTwFileContentToPanda(initialInputList["tw-App.tsx"], tailwind.context, panda, mergeCss);

    expect(output).toMatchInlineSnapshot(`
      "const App = () => {
        return (
          <>
            <figure
              class={css({
                md: { display: 'flex', p: '0' },
                bgColor: 'slate.100',
                rounded: 'xl',
                p: '8',
                _dark: { bgColor: 'slate.800' },
              })}
            >
              <img
                class={css({
                  w: '24',
                  h: '24',
                  md: { w: '48', h: 'auto', rounded: 'none' },
                  rounded: 'full',
                  ml: 'auto',
                  mr: 'auto',
                })}
                src=\\"/sarah-dayan.jpg\\"
                alt=\\"\\"
                width=\\"384\\"
                height=\\"512\\"
              />
              <div class={css({ pt: '6', md: { p: '8', textAlign: 'left' }, textAlign: 'center', mt: '4', mb: '4' })}>
                <blockquote>
                  <p class={css({ fontSize: 'lg', lineHeight: 'lg', fontWeight: 'medium' })}>
                    “Tailwind CSS is the only framework that I've seen scale on large teams. It’s easy to customize, adapts to
                    any design, and the build size is tiny.”
                  </p>
                </blockquote>
                <figcaption class={css({ fontWeight: 'medium' })}>
                  <div class={css({ color: 'sky.500', _dark: { color: 'sky.400' } })}>Sarah Dayan</div>
                  <div class={css({ color: 'slate.700', _dark: { color: 'slate.500' } })}>Staff Engineer, Algolia</div>
                </figcaption>
              </div>
            </figure>
          </>
        )
      }
      "
    `);
  });
});
