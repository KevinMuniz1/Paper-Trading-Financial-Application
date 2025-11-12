import Footer from '../components/footer.tsx';
import PageTitle from '../components/PageTitle.tsx';
import Portfolio from '../components/Portfolio.tsx';
import NavBar from '../components/NavBar.tsx';

const TradePage = () => {
    return (
        <div className="login-page-container">
            <NavBar/>
            <Portfolio />
            <Footer />
        </div>
    );
};

export default TradePage;