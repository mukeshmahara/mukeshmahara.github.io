export interface SidebarItem {
    id: string;
    label: string;
    icon?: string;
    route: string;
}

export const sidebarItems: SidebarItem[] = [
    { id: "Edication", label: "Edication", icon: "fa-home", route: "/" },
    { id: "about", label: "About Me", icon: "fa-user", route: "/about" },
    { id: "projects", label: "Projects", icon: "fa-folder", route: "/projects" },
    { id: "contact", label: "Contact", icon: "fa-envelope", route: "/contact" },
];
