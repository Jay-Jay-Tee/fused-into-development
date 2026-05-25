import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { formatINR } from '../utils/money'

// Fix Leaflet's default marker icon paths (Vite breaks them otherwise)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom mustard-colored vendor marker
const vendorIcon = L.divIcon({
    className: 'vendor-marker',
    html: `<div style="background:#E0B43A;border:2px solid #1A1A1A;width:24px;height:24px;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const VendorMap = ({ products }) => {

    const navigate = useNavigate();

    // Group products by vendor (so each vendor gets one pin, not one per product)
    const vendorMap = products.reduce((acc, p) => {
        if (!acc[p.vendor]){
            acc[p.vendor] = {
                name: p.vendor,
                location: p.location,
                lat: p.lat,
                lng: p.lng,
                products: [],
            };
        }
        acc[p.vendor].products.push(p);
        return acc;
    }, {});

    const vendors = Object.values(vendorMap).filter(v => v.lat && v.lng);

    if (vendors.length === 0){
        return (
            <div className='text-center py-20 text-ink-soft border border-line'>
                <p>No vendors to show on the map.</p>
            </div>
        )
    }

    return (
        <div className='border border-line h-[70vh] min-h-[500px]'>
            <MapContainer
                center={[22.5, 79]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                {vendors.map((vendor) => (
                    <Marker
                        key={vendor.name}
                        position={[vendor.lat, vendor.lng]}
                        icon={vendorIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>{vendor.name}</p>
                                <p style={{ fontSize: '12px', color: '#5C5A56', marginBottom: '10px' }}>📍 {vendor.location} · {vendor.products.length} product{vendor.products.length !== 1 ? 's' : ''}</p>

                                <div style={{ marginBottom: '10px' }}>
                                    {vendor.products.slice(0,3).map((p) => (
                                        <div key={p._id} style={{ fontSize: '12px', padding: '4px 0', borderTop: '1px solid #E8E2D3' }}>
                                            <span>{p.name}</span>
                                            <span style={{ float: 'right', fontWeight: 500 }}>{formatINR(p.price)}</span>
                                        </div>
                                    ))}
                                    {vendor.products.length > 3 && (
                                        <p style={{ fontSize: '11px', color: '#5C5A56', marginTop: '6px' }}>
                                            + {vendor.products.length - 3} more
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={()=>navigate(`/vendor/${encodeURIComponent(vendor.name)}`)}
                                    style={{
                                        width: '100%',
                                        background: '#1A1A1A',
                                        color: '#FDFAF1',
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Visit shop →
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export default VendorMap