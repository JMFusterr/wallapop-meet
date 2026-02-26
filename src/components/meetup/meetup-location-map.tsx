import * as React from "react"
import L from "leaflet"
import {
    CircleMarker,
    MapContainer,
    Marker,
    TileLayer,
    Tooltip,
    useMap,
    useMapEvents,
} from "react-leaflet"

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

function resolveCssColor(variableName: string, fallback: string): string {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return fallback
    }
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    return value || fallback
}

function createCustomPointIcon(customPointColor: string): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `
        <span style="display:inline-flex;flex-direction:column;align-items:center;">
            <span style="display:flex;min-width:40px;height:30px;align-items:center;justify-content:center;border-radius:999px;background:${customPointColor};border:2px solid var(--text-inverse);box-shadow:0 4px 10px rgba(37,50,56,0.28);padding:0 10px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-inverse)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path>
                    <path d="m21 3 1 11h-2"></path>
                    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path>
                    <path d="M3 4h8"></path>
                </svg>
            </span>
            <svg viewBox="0 0 14 8" width="14" height="8" style="display:block;margin-top:-2px;" aria-hidden="true">
                <path d="M1 0H13L7 7Z" fill="${customPointColor}"></path>
                <path d="M1 0L7 7L13 0" fill="none" stroke="var(--text-inverse)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </span>
    `,
        iconSize: [40, 37],
        iconAnchor: [20, 36],
    })
}

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
    const safePointDefaultColor = React.useMemo(
        () => resolveCssColor("--action-primary", "#13C1AC"),
        []
    )
    const safePointSelectedColor = React.useMemo(
        () => resolveCssColor("--action-primary-pressed", "#0D907A"),
        []
    )
    const customPointIcon = React.useMemo(
        () => createCustomPointIcon(safePointSelectedColor),
        [safePointSelectedColor]
    )

    return (
        <div className="h-[280px] w-full overflow-hidden rounded-[14px] border border-[var(--border-strong)]">
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
                            color: resolveCssColor("--text-inverse", "#ffffff"),
                            weight: 2,
                            fillColor:
                                selectedPointId === point.id
                                    ? safePointSelectedColor
                                    : safePointDefaultColor,
                            fillOpacity: 1,
                        }}
                        eventHandlers={{
                            click: (event) => {
                                event.originalEvent.stopPropagation()
                                onSafePointClick(point.id)
                            },
                        }}
                    >
                        {selectedPointId === point.id ? (
                            <Tooltip direction="top" offset={[0, -10]} permanent>
                                {point.name} - Punto seguro
                            </Tooltip>
                        ) : null}
                    </CircleMarker>
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
