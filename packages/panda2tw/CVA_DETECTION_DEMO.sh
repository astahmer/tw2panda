#!/usr/bin/env zsh

# Example: Using the new CVA detection feature with panda2tw rewrite command

echo "=== CVA Detection Feature Demo ==="
echo ""
echo "The rewrite command now automatically detects and converts CVA (Class Variance Authority)"
echo "configurations that have base + variants properties."
echo ""

# Example 1: Simple CVA with define.recipe()
echo "Example 1: CVA with define.recipe()"
echo "---"

code1=$(cat << 'EOF'
const buttonCva = define.recipe({
  base: {
    display: 'flex',
    padding: '2',
    borderRadius: 'md',
  },
  variants: {
    variant: {
      primary: { backgroundColor: 'blue.600', color: 'white' },
      secondary: { backgroundColor: 'gray.200', color: 'black' },
    },
    size: {
      sm: { padding: '1', fontSize: 'sm' },
      lg: { padding: '4', fontSize: 'lg' },
    },
  },
});
EOF
)

echo "Input:"
echo "$code1"
echo ""
echo "Command:"
echo "panda2tw rewrite path/to/file.ts"
echo ""

# Example 2: CVA in styled.div
echo ""
echo "Example 2: CVA in styled.div()"
echo "---"

code2=$(cat << 'EOF'
const Box = styled.div({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4',
  },
  variants: {
    color: {
      blue: { backgroundColor: 'blue.500', color: 'white' },
      red: { backgroundColor: 'red.500', color: 'white' },
    },
  },
});
EOF
)

echo "Input:"
echo "$code2"
echo ""

# Example 3: Slot-based CVA
echo ""
echo "Example 3: Slot-based CVA with define.slotRecipe()"
echo "---"

code3=$(cat << 'EOF'
const avatar = define.slotRecipe({
  slots: ['root', 'image', 'fallback'],
  base: {
    root: { display: 'flex', position: 'relative' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    fallback: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  },
  variants: {
    size: {
      sm: { root: { width: '32px', height: '32px' } },
      lg: { root: { width: '64px', height: '64px' } },
    },
  },
});
EOF
)

echo "Input:"
echo "$code3"
echo ""

echo "=== After Running: panda2tw rewrite path/to/file.ts ==="
echo ""
echo "The CVA configs will be converted to use Tailwind classes:"
echo ""
echo "- base: { display: 'flex', padding: '2' } → base: 'flex p-2'"
echo "- variants.primary: { backgroundColor: 'blue.600' } → primary: 'bg-blue-600'"
echo "- Slot definitions with selectors remain intact but styles are converted"
echo ""
echo "The rewrite command preserves all other code structure and automatically"
echo "integrates CVA detection alongside other conversions like css() calls."
