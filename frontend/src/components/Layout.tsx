import NavBar from './NavBar';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="layout-with-sidebar">
            <NavBar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;