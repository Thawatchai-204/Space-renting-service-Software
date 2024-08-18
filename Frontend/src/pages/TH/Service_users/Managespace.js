import React, { useState, useEffect } from 'react';
import './Reserve.css';

function Reserve() {
    const [spaceDetails, setSpaceDetails] = useState(null);

    useEffect(() => {
        // ตัวอย่างข้อมูล คุณสามารถเชื่อมต่อกับ API ของคุณที่นี่
        const spaceData = {
            name: 'SPACEUP STORAGE',
            location: '308 Soi 4, Kho Hong Subdistrict, Hat Yai District, Songkhla 10110',
            images: [
                'image1.jpg',
                'image2.jpg',
                'image3.jpg',
            ],
        };
        setSpaceDetails(spaceData);
    }, []);

    return (
        <div className="reserve-container">
            <header>
                <h1>Reserve Space</h1>
                <input type="text" placeholder="Search Here" className="search-bar" />
                <div className="user-info">
                    <span className="user-name">jusmean jojo</span>
                    <span className="user-balance">500 bath</span>
                </div>
            </header>
            <main>
                <div className="space-details">
                    <h2>{spaceDetails?.name}</h2>
                    <div className="images">
                        {spaceDetails?.images.map((img, index) => (
                            <img key={index} src={img} alt={`space ${index + 1}`} />
                        ))}
                    </div>
                    <p>{spaceDetails?.location}</p>
                    <button className="map-button">map</button>
                </div>
                <aside className="service-charge">
                    <h2>Service charge</h2>
                    <div className="charge-details">
                        <div className="charge-item">
                            <label>Types</label>
                            <input type="text" />
                        </div>
                        <div className="charge-item">
                            <label>Size</label>
                            <input type="text" />
                        </div>
                        <div className="charge-item">
                            <label>Start-End Date</label>
                            <input type="text" />
                        </div>
                        <div className="charge-item">
                            <label>Total service charge</label>
                            <input type="text" />
                        </div>
                    </div>
                    <button className="payment-button">Payment</button>
                </aside>
            </main>
        </div>
    );
}

export default Reserve;
