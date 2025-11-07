/**
 * COMPONENT MAPPINGS - Uniform Canvas Component Registry
 * 
 * This file registers all Uniform Canvas components
 * Acts as the central registry connecting Uniform types to React components
 * 
 * CONCEPT:
 * Similar to dependency injection or service registration
 * Maps string identifiers to concrete component implementations
 * 
 * HOW IT WORKS:
 * 
 * 1. Each component exports a mapping:
 *    export const heroMapping = {
 *      type: "hero",           ← Type in Uniform Canvas
 *      component: HeroComponent ← React component to render
 *    }
 * 
 * 2. This file re-exports all mappings
 * 3. resolve.tsx uses these to find the right component
 * 4. UniformComposition renders the matched component
 * 
 * WORKFLOW:
 * 
 * In Uniform Canvas:
 * - Content editor adds "hero" component to page
 * - Saves composition with type: "hero"
 * 
 * In Your App:
 * - Fetches composition: { type: "hero", parameters: {...} }
 * - resolve.tsx searches mappings for type: "hero"
 * - Finds heroMapping → renders HeroComponent
 * 
 * ADDING NEW COMPONENTS:
 * 
 * 1. Create component file: components/uniform/my-component.tsx
 * 2. Export mapping: export const myComponentMapping = { type: "myComponent", component: MyComponent }
 * 3. Add to this file: export { myComponentMapping } from "../components/uniform/my-component"
 * 4. Done! Uniform will now render your component
 */

export { pageMapping } from "../components/uniform/page";
export { heroMapping } from "../components/uniform/hero";
export { contentBlockMapping } from "../components/uniform/content-block";
export { headerMapping } from "../components/uniform/header";
export { footerMapping } from "../components/uniform/footer";
export { accessDeniedMapping } from "../components/uniform/access-denied";

