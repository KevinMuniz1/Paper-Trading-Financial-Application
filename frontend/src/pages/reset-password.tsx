import ResetPassword from '../components/resetPassword.tsx';
import Footer from '../components/footer.tsx';
import PageTitle from '../components/PageTitle.tsx';

const ResetPasswordPage = () => {
    return (
        <div className="login-page-container">
            <PageTitle />
            <ResetPassword />
            <Footer />
        </div>
    );
};

export default ResetPasswordPage;