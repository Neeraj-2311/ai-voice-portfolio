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

// Content files reference icons by string name so they stay serialisable.
// Components resolve those names here at render time.
const iconMap: Record<string, IconComponent> = {
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
