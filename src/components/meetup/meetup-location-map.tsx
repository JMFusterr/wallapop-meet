import * as React from "react"
import L from "leaflet"
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

type LatLng = {
    lat: number
    lng: number
}

type SafePoint = {
    id: string
    name: string
    lat: number
    lng: number
}

type MeetupLocationMapProps = {
    center: LatLng
    safePoints: SafePoint[]
    selectedPointId: string
    selectedCustomPoint: LatLng | null
    onMapClick: (lat: number, lng: number) => void
    onSafePointClick: (pointId: string) => void
}

const customPointIcon = L.divIcon({
    className: "",
    html: '<span style="display:block;width:16px;height:16px;border-radius:999px;background:#0A84FF;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
})

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (event) => {
            onMapClick(event.latlng.lat, event.latlng.lng)
        },
    })

    return null
}

function MapCenterController({ center }: { center: LatLng }) {
    const map = useMap()

    React.useEffect(() => {
        map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 0.6 })
    }, [center, map])

    return null
}

function MeetupLocationMap({
    center,
    safePoints,
    selectedPointId,
    selectedCustomPoint,
    onMapClick,
    onSafePointClick,
}: MeetupLocationMapProps) {
    return (
        <div className="h-[280px] w-full overflow-hidden rounded-[14px] border border-[#D3DEE2]">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={14}
                scrollWheelZoom
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={onMapClick} />
                <MapCenterController center={center} />

                {safePoints.map((point) => (
                    <CircleMarker
                        key={point.id}
                        center={[point.lat, point.lng]}
                        radius={7}
                        pathOptions={{
                            color: "#ffffff",
                            weight: 2,
                            fillColor: selectedPointId === point.id ? "#038673" : "#13C1AC",
                            fillOpacity: 1,
                        }}
                        eventHandlers={{
                            click: (event) => {
                                event.originalEvent.stopPropagation()
                                onSafePointClick(point.id)
                            },
                        }}
                    />
                ))}

                {selectedCustomPoint ? (
                    <Marker
                        position={[selectedCustomPoint.lat, selectedCustomPoint.lng]}
                        icon={customPointIcon}
                    />
                ) : null}
            </MapContainer>
        </div>
    )
}

export { MeetupLocationMap }
export type { LatLng, SafePoint }
