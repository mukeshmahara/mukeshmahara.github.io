import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p className="footer-text">© 2024 MyPortfolio. All Rights Reserved.</p>
                <div className="footer-links">
                    <Link href="https://github.com/mukeshmahara">
                        github
                    </Link>
                    <Link href="https://www.linkedin.com">
                        linkedin
                    </Link>
                    <Link href="/contact">
                        contact
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
