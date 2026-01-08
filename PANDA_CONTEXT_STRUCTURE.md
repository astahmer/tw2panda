# PandaContext Structure - Code Snippets and Examples

## Overview
The Panda CSS context contains utilities, conditions/breakpoints, and their configurations. This document shows actual code snippets from the Panda codebase demonstrating how to access and use these structures.

---

## 1. HOW SHORTHANDS ARE DEFINED IN UTILITIES

### Definition in Utility Config Files
**File**: [.context/panda-css/packages/preset-base/src/utilities/spacing.ts](.context/panda-css/packages/preset-base/src/utilities/spacing.ts)

```typescript
export const spacing: UtilityConfig = {
  padding: {
    className: 'p',
    shorthand: 'p',
    values: 'spacing',
    group: 'Padding',
  },
  paddingLeft: {
    className: 'pl',
    shorthand: 'pl',
    values: 'spacing',
    group: 'Padding',
  },
  paddingRight: {
    className: 'pr',
    shorthand: 'pr',
    values: 'spacing',
    group: 'Padding',
  },
  paddingBlock: {
    className: 'py',
    values: 'spacing',
    group: 'Padding',
    shorthand: ['py', 'paddingY'],  // Can be string or array
  },
  paddingInline: {
    className: 'px',
    values: 'spacing',
    group: 'Padding',
    shorthand: ['paddingX', 'px'],
  },
  // ... more properties
}
```

### How Shorthands Are Stored in Utility Class
**File**: [.context/panda-css/packages/core/src/utility.ts](.context/panda-css/packages/core/src/utility.ts)

#### 1. Shorthands Map Storage
```typescript
export class Utility {
  /**
   * Map of shorthand properties to their longhand properties
   */
  shorthands = new Map<string, string>()
```

#### 2. Assigning Shorthands
```typescript
  private assignShorthands = () => {
    for (const [property, config] of Object.entries(this.config)) {
      const { shorthand } = config ?? {}

      if (!shorthand) continue

      const values = Array.isArray(shorthand) ? shorthand : [shorthand]
      values.forEach((shorthandName) => {
        this.shorthands.set(shorthandName, property)
      })
    }
  }
```

#### 3. Resolving Shorthands
```typescript
  resolveShorthand = (prop: string) => {
    return this.shorthands.get(prop) ?? prop
  }

  public get hasShorthand() {
    return this.shorthands.size > 0
  }
```

#### 4. Getting Shorthands for a Property
```typescript
  /**
   * Returns a map of the property keys and their shorthands
   */
  getPropShorthandsMap = () => {
    const shorthandsByProp = new Map<string, string[]>()

    this.shorthands.forEach((prop, shorthand) => {
      const list = shorthandsByProp.get(prop) ?? []
      list.push(shorthand)
      shorthandsByProp.set(prop, list)
    })

    return shorthandsByProp
  }

  /**
   * Returns the shorthands for a given property
   */
  getPropShorthands = (prop: string) => {
    return this.getPropShorthandsMap().get(prop) ?? []
  }
```

---

## 2. HOW RESPONSIVE CONDITIONS/BREAKPOINTS ARE STORED

### Breakpoints Class Structure
**File**: [.context/panda-css/packages/core/src/breakpoints.ts](.context/panda-css/packages/core/src/breakpoints.ts)

```typescript
export class Breakpoints {
  sorted: ReturnType<typeof sortBreakpoints>
  values: Record<string, BreakpointEntry>
  keys: string[]
  ranges: Record<string, string>
  conditions: Record<string, AtRuleCondition>

  constructor(private breakpoints: Record<string, string>) {
    this.sorted = sortBreakpoints(breakpoints)
    this.values = Object.fromEntries(this.sorted)
    this.keys = ['base', ...Object.keys(this.values)]
    this.ranges = this.getRanges()
    this.conditions = this.getConditions()
  }

  get = (name: string) => {
    return this.values[name]
  }

  build = ({ min, max }: { min?: string | null; max?: string | null }) => {
    if (min == null && max == null) return ''
    return ['screen', min && `(min-width: ${min})`, max && `(max-width: ${max})`].filter(Boolean).join(' and ')
  }

  only = (name: string) => {
    const { min, max } = this.get(name)
    return this.build({ min, max })
  }

  getCondition = (key: string): ConditionDetails | undefined => {
    return this.conditions[key]
  }

  expandScreenAtRule = (root: Root) => {
    root.walkAtRules('breakpoint', (rule) => {
      const value = this.getCondition(rule.params)
      if (!value) {
        throw rule.error(`No \`${rule.params}\` screen found.`)
      }
      if (value.type !== 'at-rule') {
        throw rule.error(`\`${rule.params}\` is not a valid screen.`)
      }

      rule.name = 'media'
      rule.params = value.params
    })
  }
}
```

### Conditions Class Structure
**File**: [.context/panda-css/packages/core/src/conditions.ts](.context/panda-css/packages/core/src/conditions.ts)

```typescript
export class Conditions {
  values: Record<string, ConditionDetails>
  breakpoints: Breakpoints

  constructor(private options: Options) {
    const { breakpoints: breakpointValues = {}, conditions = {} } = options

    const breakpoints = new Breakpoints(breakpointValues)
    this.breakpoints = breakpoints

    const entries = Object.entries(conditions).map(([key, value]) => [`_${key}`, parseCondition(value)])

    const containers = this.setupContainers()
    const themes = this.setupThemes()

    this.values = {
      ...Object.fromEntries(entries),
      ...breakpoints.conditions,
      ...containers,
      ...themes,
    }
  }

  private setupContainers = () => {
    const { containerNames = [], containerSizes = {} } = this.options

    const containers: Record<string, ConditionDetails> = {}
    containerNames.unshift('') // add empty container name for @/sm, @/md, etc.

    containerNames.forEach((name) => {
      Object.entries(containerSizes).forEach(([size, value]) => {
        const _value = toRem(value) ?? value
        containers[`@${name}/${size}`] = {
          type: 'at-rule',
          name: 'container',
          value: _value,
          raw: `@container ${name} (min-width: ${_value})`,
          params: `${name} ${value}`,
        }
      })
    })

    return containers
  }
}
```

---

## 3. HOW THE CONTEXT IS STRUCTURED

### Context Class Overview
**File**: [.context/panda-css/packages/core/src/context.ts](.context/panda-css/packages/core/src/context.ts)

```typescript
export class Context {
  // Token management
  tokens: TokenDictionary

  // Utilities management
  utility: Utility

  // Conditions & Breakpoints
  conditions: Conditions

  // Recipes
  recipes: Recipes

  // Patterns
  patterns: Patterns

  // Style encoding/decoding
  encoder: StyleEncoder
  decoder: StyleDecoder

  // Layout management
  staticCss: StaticCss
  jsx: JsxEngine

  // Other engines
  imports: ImportMap
  paths: PathEngine
  file: FileEngine

  constructor(public conf: LoadConfigResult) {
    const config = defaults(conf.config)
    const theme = config.theme ?? {}
    conf.config = config

    // Initialize tokens first
    this.tokens = this.createTokenDictionary(theme, config.themes)
    this.tokens.init()

    // Initialize utility with config
    this.utility = this.createUtility(config)

    // Initialize conditions with breakpoints
    this.conditions = this.createConditions(config)

    // Initialize patterns with utilities and tokens
    this.patterns = new Patterns({
      config,
      tokens: this.tokens,
      utility: this.utility,
      helpers: patternFns,
    })

    this.setupProperties()

    // Create recipes
    this.recipes = this.createRecipes(theme)

    // Create encoder with utilities and conditions
    this.encoder = new StyleEncoder({
      utility: this.utility,
      recipes: this.recipes,
      conditions: this.conditions,
      patterns: this.patterns,
      isTemplateLiteralSyntax: this.isTemplateLiteralSyntax,
      isValidProperty: this.isValidProperty,
    })

    // Create decoder with utilities and conditions
    this.decoder = new StyleDecoder({
      conditions: this.conditions,
      utility: this.utility,
      recipes: this.recipes,
      hash: this.hash,
    })
  }
}
```

---

## 4. EXAMPLE USAGE - ACCESSING UTILITIES AND CONDITIONS

### Using Context in Serialize
**File**: [.context/panda-css/packages/core/src/serialize.ts](.context/panda-css/packages/core/src/serialize.ts)

```typescript
export function serializeStyles(context: SerializeContext, groupedObject: Dict) {
  const result: Dict = {}

  for (const [scope, styles] of Object.entries(groupedObject)) {
    result[scope] ||= {}

    const styleObject = walkObject(styles, (value) => value, {
      getKey: (prop, value) => {
        // Check if prop is a condition or valid property
        if (isObject(value) && !context.conditions.isCondition(prop) && !context.isValidProperty(prop)) {
          const selectors = parseSelectors(prop)
          return selectors.map((s) => '& ' + s).join(', ')
        }

        return prop
      },
    })

    merge(result[scope], transformStyles(context, styleObject, scope))
  }
  return result
}
```

### Using Context in Style Encoder
**File**: [.context/panda-css/packages/core/src/style-encoder.ts](.context/panda-css/packages/core/src/style-encoder.ts)

```typescript
export class StyleEncoder {
  constructor(
    private context: Pick<
      Context,
      'isTemplateLiteralSyntax' | 'isValidProperty' | 'recipes' | 'patterns' | 'conditions' | 'utility'
    >,
  ) {}

  hashStyleObject = (
    set: Set<string>,
    obj: ResultItem['data'][number],
    baseEntry?: Partial<Omit<StyleEntry, 'prop' | 'value' | 'cond'>>,
  ) => {
    const isCondition = this.context.conditions.isCondition
    const traverseOptions = { separator: StyleEncoder.conditionSeparator }

    const normalized = normalizeStyleObject(obj, this.context, !isRecipe)

    traverse(
      normalized,
      ({ key, value: rawValue, path }) => {
        // Convert array values to responsive objects using breakpoint keys
        const value = Array.isArray(rawValue)
          ? toResponsiveObject(rawValue, this.context.conditions.breakpoints.keys)
          : rawValue

        // Check if key is a condition
        if (isCondition(key)) {
          // Handle condition logic
        }
      },
    )
  }
}
```

### Using Context in Style Decoder
**File**: [.context/panda-css/packages/core/src/style-decoder.ts](.context/panda-css/packages/core/src/style-decoder.ts)

```typescript
export class StyleDecoder {
  // ...
  getAtomicStyle = (hash: string) => {
    const cached = this.atomic_cache.get(hash)
    if (cached) return cached

    const entry = getEntryFromHash(hash)
    const transformed = transform(entry.prop, withoutImportant(entry.value) as string)

    let conditions

    if (entry.cond) {
      // Sort conditions using the context
      conditions = this.context.conditions.sort(parts)
      const path = basePath.concat(conditions.flatMap((c) => this.resolveCondition(c)))
      deepSet(obj, path, styles)
    } else {
      deepSet(obj, basePath, styles)
    }
  }

  getGroup = (hashSet: Set<string>, key: string) => {
    // ...
    hashSet.forEach((hash) => {
      const entry = getEntryFromHash(hash)
      const transformed = transform(entry.prop, withoutImportant(entry.value) as string)
      const parts = entry.cond ? entry.cond.split(StyleEncoder.conditionSeparator) : []

      let conditions
      if (entry.cond) {
        conditions = this.context.conditions.sort(parts)
      }

      details.push({ hash, entry, conditions, result })
    })
  }
}
```

### Using Context in Stylesheet
**File**: [.context/panda-css/packages/core/src/stylesheet.ts](.context/panda-css/packages/core/src/stylesheet.ts)

```typescript
export class Stylesheet {
  // Access breakpoints from conditions
  getLayerCss = (...layers: CascadeLayer[]) => {
    const breakpoints = this.context.conditions.breakpoints
    return optimizeCss(
      layers
        .map((layer: CascadeLayer) => {
          const root = this.context.layers.getLayerRoot(layer)
          breakpoints.expandScreenAtRule(root as postcss.Root)
          return root.toString()
        })
        .join('\n'),
      {
        minify: false,
        lightningcss: this.context.lightningcss,
        browserslist: this.context.browserslist,
      },
    )
  }

  toCss = ({ minify }: CssOptions = {}) => {
    const breakpoints = this.context.conditions.breakpoints
    const root = this.context.layers.insert()

    // Expand breakpoint at-rules
    breakpoints.expandScreenAtRule(root)

    const plugins: postcss.AcceptedPlugin[] = [sortMediaQueries()]
    // ...
  }
}
```

---

## 5. KEY PATTERNS FOR ACCESSING CONTEXT PROPERTIES

### Access Utilities Config
```typescript
// Access a specific utility config
const propConfig = context.utility.config[propertyName]

// Get all properties
const allProperties = Object.entries(context.utility.config)

// Get property values
const values = context.utility.getPropertyValues(config)

// Get property keys
const keys = context.utility.getPropertyKeys('padding')
```

### Access Shorthands
```typescript
// Resolve a shorthand to its full property
const fullProp = context.utility.resolveShorthand('p')  // 'padding'

// Get all shorthands for a property
const shorthands = context.utility.getPropShorthands('padding')  // ['p']

// Check if has any shorthands
if (context.utility.hasShorthand) {
  // ...
}

// Direct access to shorthands map
context.utility.shorthands.get('p')  // 'padding'
```

### Access Conditions
```typescript
// Check if a prop is a condition
context.conditions.isCondition('_hover')  // true

// Get all conditions
const allConditions = context.conditions.values

// Access specific condition
const hoverCondition = context.conditions.values['_hover']

// Sort conditions
const sorted = context.conditions.sort(conditionParts)
```

### Access Breakpoints
```typescript
// Get breakpoint keys
const keys = context.conditions.breakpoints.keys  // ['base', 'sm', 'md', 'lg', ...]

// Get breakpoint values
const values = context.conditions.breakpoints.values  // { sm: {name, min, max}, md: {...}, ... }

// Get specific breakpoint
const smBreakpoint = context.conditions.breakpoints.get('sm')

// Get breakpoint condition
const condition = context.conditions.breakpoints.getCondition('sm')

// Build media query
const mediaQuery = context.conditions.breakpoints.build({ min: '640px' })
```

### Access Transform Results
```typescript
// Transform a property and value
const result = context.utility.transform('padding', '4')
// Returns: { className: 'p_4', styles: { padding: '1rem' }, layer: 'utilities' }
```

---

## 6. TYPE DEFINITIONS

### ConditionDetails
```typescript
interface ConditionDetails {
  type: 'at-rule' | 'self-nesting' | 'combinator-nesting' | 'parent-nesting' | 'mixed'
  name?: string
  value?: string
  raw: string
  params?: string
}
```

### PropertyConfig
```typescript
interface PropertyConfig {
  className?: string
  values?: string | Record<string, any>
  transform?: (value: string) => Dict
  shorthand?: string | string[]
  layer?: CascadeLayer
  group?: string
  // ... more properties
}
```

### BreakpointEntry
```typescript
type BreakpointEntry = {
  name: string
  min?: string | null
  max?: string | null
}
```

---

## Summary

**Shorthands**: Defined in utility configs with `shorthand` property, stored in `context.utility.shorthands` Map, accessed via `resolveShorthand()` or `getPropShorthands()`

**Conditions**: Stored in `context.conditions.values` Map, accessed via `isCondition()` and `sort()`

**Breakpoints**: Stored in `context.conditions.breakpoints` with `keys`, `values`, `ranges`, and `conditions` properties

**Utility Config**: Accessed via `context.utility.config[propertyName]` or through helper methods like `getPropertyValues()` and `getPropertyKeys()`
