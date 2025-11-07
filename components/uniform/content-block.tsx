/**
 * CONTENT BLOCK COMPONENT - Uniform Canvas Example
 * 
 * This is a simple Uniform Canvas component demonstrating:
 * - How to create editable components
 * - How to use Uniform's content editing features
 * - How to integrate with your design system
 * 
 * KEY CONCEPTS:
 * 
 * 1. UNIFORM CANVAS:
 *    Visual editor for content (headless CMS)
 *    Content editors can change text without touching code
 *    Modern approach to content management with visual editing
 * 
 * 2. COMPONENT PROPS:
 *    - component: Contains data from Uniform (title, content, etc.)
 *    - context: Canvas editing context (is user editing? preview mode?)
 * 
 * 3. UniformText / UniformRichText:
 *    Special Uniform components that:
 *    - Render editable content in Canvas
 *    - Show placeholders when empty
 *    - Connect to Uniform's data via parameterId
 * 
 * 4. COMPONENT MAPPING:
 *    Registers this component with Uniform
 *    Type "contentBlock" in Uniform → ContentBlockComponent in React
 *    Similar to registering routes or handlers in a web framework
 * 
 * HOW IT WORKS:
 * 
 * In Uniform Canvas:
 * 1. Content editor drags "Content Block" component onto page
 * 2. Edits title and content fields
 * 3. Publishes changes
 * 
 * In Your App:
 * 1. Fetches content from Uniform API
 * 2. Resolves "contentBlock" type to this component
 * 3. Renders with content editor's data
 */

import {
  ComponentProps,
  UniformRichText,
  UniformText,
} from "@uniformdev/canvas-next-rsc/component";
import { ResolveComponentResultWithType } from "@/uniform/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Content Block Component
 * 
 * Displays a card with editable title and rich text content
 * 
 * @param component - Component data from Uniform Canvas (contains parameters)
 * @param context - Uniform Canvas context (editing mode, preview mode, etc.)
 * 
 * UniformText vs UniformRichText:
 * - UniformText: Plain text input field
 * - UniformRichText: Formatted text with bold, links, lists, etc.
 */
export const ContentBlockComponent = ({
  component,
  context,
}: ComponentProps<ContentBlockProps>) => {
  return (
    <Card className="my-8">
      <CardHeader>
        {/* 
          UniformText - Editable text field
          
          parameterId="title" maps to the "title" field in Uniform Canvas
          When content editor changes title in Canvas, it updates here
          
          In Canvas editing mode: Shows inline editor
          In production: Shows plain text
        */}
        <UniformText
          component={component}
          context={context}
          parameterId="title"
          as={CardTitle}
          placeholder="Enter content block title"
        />
      </CardHeader>
      <CardContent>
        {/* 
          UniformRichText - Editable rich text field
          
          Supports:
          - Bold, italic, underline
          - Links
          - Lists
          - And more formatting options
          
          prose class: Tailwind typography plugin for nice text styling
        */}
        <UniformRichText
          component={component}
          parameterId="content"
          className="prose max-w-none"
          placeholder="Enter content block text"
        />
      </CardContent>
    </Card>
  );
};

/**
 * TypeScript interface defining component parameters
 * 
 * These match the fields configured in Uniform Canvas
 * Similar to a data model or schema definition
 */
export type ContentBlockProps = {
  title: string;
  content: string;
};

/**
 * COMPONENT REGISTRATION
 * 
 * Maps Uniform component type to React component
 * This is exported and used in uniform/mappings.ts
 * 
 * type: "contentBlock" - Must match the type in Uniform Canvas
 * component: ContentBlockComponent - The React component to render
 * 
 * Similar to registering routes or handlers:
 * Maps the string identifier "contentBlock" to the actual React component
 */
export const contentBlockMapping: ResolveComponentResultWithType = {
  type: "contentBlock",
  component: ContentBlockComponent,
};

