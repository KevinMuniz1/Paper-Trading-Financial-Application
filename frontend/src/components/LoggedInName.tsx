import { useNavigate } from 'react-router-dom';

function LoggedInName() {

    const navigate = useNavigate();

    // get user data from localStorage
    const userData = localStorage.getItem('user_data');
    let username = "User"; 

    if (userData) {
        try {
            const user = JSON.parse(userData);
            username = `${user.firstName} ${user.lastName}`;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }


    function doLogout(event: any): void {
        event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return (
        <div id="loggedInDiv">
            <span id="userName">Logged In As {username} </span><br />
            <button type="button" id="logoutButton" className="buttons"
                onClick={doLogout}> Log Out </button>
        </div>
    );
};

export default LoggedInName;