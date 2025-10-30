import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import Portfolio from '../components/Portfolio';

const DashboardPage = () => {
    return (
        <div>
            <PageTitle />
            <LoggedInName />
            <Portfolio/>
        </div>
    );
}
export default DashboardPage;