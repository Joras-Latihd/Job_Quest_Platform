import {
  Laptop, Landmark, Megaphone, Users, HardHat, Stethoscope, GraduationCap, Hotel, FolderCog, Palette, Headset,
  Building2, Factory, HeartHandshake, Banknote, Newspaper, Briefcase, Code2, Truck, Scale, Wrench, ShoppingBag,
} from 'lucide-react';

// Admins pick one of these names when creating a category; it is stored as a string in MongoDB.
export const CATEGORY_ICONS = {
  Laptop, Landmark, Megaphone, Users, HardHat, Stethoscope, GraduationCap, Hotel, FolderCog, Palette, Headset,
  Building2, Factory, HeartHandshake, Banknote, Newspaper, Briefcase, Code2, Truck, Scale, Wrench, ShoppingBag,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS).map((name) => ({ value: name, label: name }));
