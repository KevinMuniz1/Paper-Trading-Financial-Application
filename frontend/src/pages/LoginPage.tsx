import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import CardUI from '../components/CardUI';

const LoginPage = () => {
    return (
        <div>
            <PageTitle />
            <Login />
            {/* remove for separate routing CardUI /*/}
        </div>
    );
};
export default LoginPage;