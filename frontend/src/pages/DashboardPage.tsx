import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CardUI from '../components/CardUI';
const DashboardPage = () => {
    return (
        <div>
            <PageTitle />
            <LoggedInName />
            <CardUI />
        </div>
    );
}
export default DashboardPage;