import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import Footer from '../components/footer.tsx';

const LoginPage = () => {
    return (
        <div className="login-page-container">
            <PageTitle />
            <Login />
            <Footer/>
        </div>
    );
};
export default LoginPage;