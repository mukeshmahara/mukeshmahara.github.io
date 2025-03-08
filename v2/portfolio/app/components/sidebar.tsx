import Link from "next/link";
import { sidebarItems } from "../data/sidebarItems";
import Image from "next/image";

// Define the SidebarItem interface (optional if already defined elsewhere)
interface SidebarItem {
    id: string;
    label: string;
    icon?: string;
    route: string;
}

interface SidebarProps {
    items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = () => {
    return (
        <aside className="shrink-0 bg-gray-800 text-white p-2">
            <ul>
                <div className="border-1 w-16 ">
                    <div className="relative w-40 h-40">
                        <Image src="/profile.JPG"
                            alt="Profile"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full border-4 border-blue-500"
                        />
                    </div>
                </div>
                {sidebarItems.map((item) => (
                    <li key={item.id}>
                        <Link href={item.route} className="sidebar-link p-2 text-center">
                            {item.icon && <i className={`fa ${item.icon}`} aria-hidden="true"></i>}
                            <span>{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
