import {
  ALargeSmall,
  AlertCircle,
  AudioLines,
  ArrowRight,
  Calendar,
  Check,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Mic,
  Moon,
  Phone,
  Sun,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { GithubIcon, LinkedinIcon, XIcon } from '@/components/primitives/BrandIcon';

export type IconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Central map for resolving icon-by-name references in content/*.ts files.
 * Content stays serialisable (no React imports) and components look up the
 * component here at render time. Brand glyphs (GitHub / LinkedIn / X) are
 * inlined SVGs because lucide-react v1 removed brand marks.
 */
export const iconMap: Record<string, IconComponent> = {
  ALargeSmall,
  AlertCircle,
  AudioLines,
  ArrowRight,
  Calendar,
  Check,
  Github: GithubIcon,
  Globe,
  GraduationCap,
  Linkedin: LinkedinIcon,
  Mail,
  MapPin,
  Mic,
  Moon,
  Phone,
  Sun,
  Twitter: XIcon, // X (formerly Twitter)
  Workflow,
  X,
};

export function getIcon(name: string): IconComponent | null {
  return iconMap[name] ?? null;
}
