/**
 * COMPONENT RESOLVER
 * 
 * Maps Uniform component types to React components
 * This is the bridge between Uniform Canvas and your React code
 * 
 * Flow:
 * 1. Uniform sends component data: { type: "hero", parameters: {...} }
 * 2. This resolver finds the matching React component
 * 3. UniformComposition renders the component with parameters
 */

import {
  DefaultNotImplementedComponent,
  ResolveComponentFunction,
  ResolveComponentResult,
} from '@uniformdev/canvas-next-rsc/component';
import * as mappings from './mappings';
import { ResolveComponentResultWithType } from './models';

/**
 * Type for the mappings module
 * Ensures type safety when accessing component mappings
 */
type ComponentMappings = Record<string, ResolveComponentResultWithType | undefined>;

/**
 * RESOLVE COMPONENT FUNCTION
 * 
 * Called by UniformComposition for each component in the page tree
 * 
 * @param component - Component data from Uniform (type, parameters, slots, etc.)
 * @returns React component to render + any additional config
 * 
 * RESOLUTION PROCESS:
 * 1. Receives component with type: "hero"
 * 2. Searches mappings for { type: "hero", component: HeroComponent }
 * 3. Returns HeroComponent
 * 4. UniformComposition renders: <HeroComponent {...props} />
 * 
 * If no mapping found: Returns DefaultNotImplementedComponent
 * (Shows helpful error in Canvas: "Component type 'xyz' not implemented")
 */
export const resolveComponent: ResolveComponentFunction = ({ component }) => {
  // Default to "not implemented" component if no match found
  let result: ResolveComponentResult = {
    component: DefaultNotImplementedComponent
  };

  // Get all registered component mappings
  // Cast mappings to ComponentMappings type for type-safe access
  const typedMappings = mappings as unknown as ComponentMappings;
  const keys = Object.keys(typedMappings);

  // Search for matching component type
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const mapping = typedMappings[key];

    /**
     * MATCH FOUND
     * 
     * Compare Uniform's component.type with mapping.type
     * Example:
     * - Component from Uniform: { type: "hero" }
     * - Mapping: { type: "hero", component: HeroComponent }
     * - Match! Return HeroComponent
     */
    if (mapping?.type === component.type) {
      result = mapping;
      break; // Stop searching once found
    }
  }

  return result;
};
