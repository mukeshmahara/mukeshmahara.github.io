import Link from "next/link";
import { useState } from "react";

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="container">
                <div className="logo">
                    <Link href="/">
                        MyPortfolio
                    </Link>
                </div>
                <div
                    className="menu-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    ☰
                </div>
                <nav className="nav">
                    <ul className={menuOpen ? "active" : ""}>
                        <li>
                            <Link href="/">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/about">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/projects">
                                Projects
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
