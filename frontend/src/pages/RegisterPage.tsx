import PageTitle from '../components/PageTitle';
import Register from '../components/Register';
import Footer from '../components/footer';

const RegisterPage = () => {
  return (
    <div className="login-page-container">
      <PageTitle />
      <Register />
      <Footer/>
    </div>
  );
};

export default RegisterPage;