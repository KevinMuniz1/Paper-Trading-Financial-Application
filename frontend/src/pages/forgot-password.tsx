import PageTitle from '../components/PageTitle.tsx';
import PasswordReset from '../components/passwordReset.tsx';
import Footer from '../components/footer.tsx';

const ForgotPasswordPage = () => {
    return (
        <div className="login-page-container">
            <PageTitle />
            <PasswordReset />
            <Footer/>
        </div>
    );
};
export default ForgotPasswordPage;