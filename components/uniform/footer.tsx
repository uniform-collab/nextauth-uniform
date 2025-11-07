import {
  ComponentProps,
  UniformText,
  UniformRichText,
} from "@uniformdev/canvas-next-rsc/component";
import { ResolveComponentResultWithType } from "@/uniform/models";

export const FooterComponent = ({
  component,
  context,
}: ComponentProps<FooterProps>) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gradient-to-b from-white to-gray-50">
      <div className="border-t">
        <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <UniformText
              component={component}
              context={context}
              parameterId="companyName"
              as="h3"
              className="text-lg font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              placeholder="Enter company name"
            />
            <UniformRichText
              component={component}
              parameterId="description"
              className="text-sm text-muted-foreground leading-relaxed"
              placeholder="Enter footer description"
            />
          </div>

          {/* Links */}
          <div>
            <UniformText
              component={component}
              context={context}
              parameterId="linksTitle"
              as="h4"
              className="font-semibold mb-3 text-sm uppercase tracking-wider text-foreground/80"
              placeholder="Links title"
            />
            <UniformText
              component={component}
              context={context}
              parameterId="links"
              as="div"
              className="text-sm text-muted-foreground space-y-2"
              placeholder="Add links"
            />
          </div>

          {/* Contact */}
          <div>
            <UniformText
              component={component}
              context={context}
              parameterId="contactTitle"
              as="h4"
              className="font-semibold mb-3 text-sm uppercase tracking-wider text-foreground/80"
              placeholder="Contact title"
            />
            <UniformText
              component={component}
              context={context}
              parameterId="contact"
              as="div"
              className="text-sm text-muted-foreground space-y-2"
              placeholder="Add contact info"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <UniformText
              component={component}
              context={context}
              parameterId="copyright"
              as="p"
              className="text-sm text-muted-foreground"
              placeholder={`© ${currentYear} Your Company. All rights reserved.`}
            />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-md bg-primary/5 text-primary font-medium">
                Powered by Next.js + Uniform
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
};

export type FooterProps = {
  companyName?: string;
  description?: string;
  linksTitle?: string;
  links?: string;
  contactTitle?: string;
  contact?: string;
  copyright?: string;
};

export const footerMapping: ResolveComponentResultWithType = {
  type: "footer",
  component: FooterComponent,
};
