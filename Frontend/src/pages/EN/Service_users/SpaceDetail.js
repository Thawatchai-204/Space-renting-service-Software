import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './SpaceDetail.css'; // สไตล์ของหน้ารายละเอียด

function SpaceDetail() {
    const { id } = useParams(); // รับ ID จาก URL
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpaceDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/spaces/${id}`); // เรียก API สำหรับรายละเอียดพื้นที่
                setSpace(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching space detail:', error);
                setLoading(false);
            }
        };

        fetchSpaceDetail();
    }, [id]);

    if (loading) return <p>Loading...</p>;

    if (!space) return <p>No space found.</p>;

    return (
        <div className="space-detail-container">
            <h1>{space.name}</h1>
            <img src={`http://localhost:5000/uploads/${space.image}`} alt={space.name} />
            <p>{space.advertisingWords}</p>
            <p>Address: {space.address}</p>
            <p>Price: {space.price} THB</p>
            <p>Description: {space.description}</p> {/* เพิ่มรายละเอียดเพิ่มเติม */}
            <button onClick={() => window.history.back()}>Go Back</button>
        </div>
    );
}

export default SpaceDetail;
