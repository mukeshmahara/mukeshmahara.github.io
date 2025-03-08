import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="footer  bg-gray-900 text-white text-center p-4">
            <p className="footer-text">© 2024 mukeshmahara. All Rights Reserved.</p>
            {/* <div className="footer-links">
                <Link href="https://github.com/mukeshmahara">
                    github
                </Link>
                <Link href="https://www.linkedin.com">
                    linkedin
                </Link>
                <Link href="/contact">
                    contact
                </Link>
            </div> */}
        </footer>
    );
};

export default Footer;
