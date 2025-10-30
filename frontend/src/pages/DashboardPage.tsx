import Layout from '../components/Layout';
import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import Portfolio from '../components/Portfolio';

const DashboardPage = () => {
    return (
        <Layout>
            <PageTitle />
            <LoggedInName />
            <Portfolio/>
        </Layout>
    );
}
export default DashboardPage;