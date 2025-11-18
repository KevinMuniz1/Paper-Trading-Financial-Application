import "./DashboardPage.css"
import { useState } from 'react';
import { buildPath } from '../../Path';

function BuyingPowerButton() {

    const [buyingPower, setBuyingPower] = useState(0);

    const seeBuyingPower = async () => {
        const res = await fetch(buildPath("/portfolio/buying-power"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setBuyingPower(data.buyingPower);
    };

    return (
        <div>
            <button className="outlined-btn">Buying Power:$ ${buyingPower} &gt; </button>
        </div>
    );
};

export default BuyingPowerButton;
