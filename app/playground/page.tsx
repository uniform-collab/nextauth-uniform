import {
  UniformPlayground,
  PlaygroundParameters,
} from '@uniformdev/canvas-next-rsc';
import { resolveComponent } from '@/uniform/resolve';

export default async function PlaygroundPage(props: PlaygroundParameters) {
  return <UniformPlayground {...props} resolveComponent={resolveComponent} />;
}

