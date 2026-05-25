import { useState, useEffect, useRef } from "react";

const BURGER_SPOTS = [
  { id: 1, name: "Rodeo Goat", address: "1926 Market Center Blvd", lat: 32.7972, lng: -96.8239, rating: 4.6 },
  { id: 2, name: "Twisted Root Burger Co.", address: "2615 Commerce St", lat: 32.7830, lng: -96.7855, rating: 4.6 },
  { id: 3, name: "Maple & Motor", address: "4810 Maple Ave", lat: 32.8152, lng: -96.8271, rating: 4.6 },
  { id: 4, name: "Burger Schmurger", address: "718 N Buckner Blvd", lat: 32.8454, lng: -96.7114, rating: 4.5 },
  { id: 5, name: "JG's Old Fashioned Hamburgers", address: "12101 Greenville Ave", lat: 32.9128, lng: -96.7462, rating: 4.7 },
  { id: 6, name: "Angry Dog", address: "2726 Commerce St", lat: 32.7829, lng: -96.7836, rating: 4.6 },
  { id: 7, name: "Goodfriend Beer Garden & Burger House", address: "1154 Peavy Rd", lat: 32.8395, lng: -96.6967, rating: 4.6 },
  { id: 8, name: "Black Tap Craft Burgers & Beer", address: "2475 Victory Park Ln", lat: 32.7886, lng: -96.8097, rating: 4.5 },
  { id: 9, name: "Chop House Burger Dallas", address: "1501 Main St", lat: 32.7808, lng: -96.7993, rating: 4.3 },
  { id: 10, name: "Hopdoddy Burger Bar", address: "3227 McKinney Ave", lat: 32.8042, lng: -96.7997, rating: 4.5 },
  { id: 11, name: "Hamburgotti's", address: "1057 S Sherman St, Richardson", lat: 32.9378, lng: -96.7406, rating: 4.9 },
];

export default function App() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const [wishlist, setWishlist] = useState(new Set());
  const [leafletReady, setLeafletReady] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(link); document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [32.845, -96.77], zoom: 11, zoomControl: false });
    // Zoom control bottom-right to avoid overlap with toggle button
    L.control.zoom({ position: "bottomright" }).addTo(map);
    // CartoDB Positron full — clean light map, no highway exit shields
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "©OpenStreetMap ©CARTO",
      maxZoom: 19,
    }).addTo(map);
    leafletMapRef.current = map;
    BURGER_SPOTS.forEach((spot) => {
      markersRef.current[spot.id] = createMarker(L, map, spot, false);
    });
  }, [leafletReady]);

  // Invalidate map size when sidebar opens/closes
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => leafletMapRef.current.invalidateSize(), 310);
    }
  }, [sidebarOpen]);

  const createMarker = (L, map, spot, isWish) => {
    const color = isWish ? "#f97316" : "#e800b0"; // magenta for normal, orange for wishlist
    const size = isWish ? 16 : 13;
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:2.5px solid ${isWish ? "#fff7ed" : "#ffd6f5"};
        box-shadow:0 0 ${isWish ? "12px" : "7px"} ${color}cc;
        cursor:pointer;
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    return L.marker([spot.lat, spot.lng], { icon })
      .addTo(map)
      .on("click", () => setSelectedSpot(spot));
  };

  const refreshMarker = (spot, isWish) => {
    if (!leafletMapRef.current) return;
    const L = window.L;
    const old = markersRef.current[spot.id];
    if (old) leafletMapRef.current.removeLayer(old);
    markersRef.current[spot.id] = createMarker(L, leafletMapRef.current, spot, isWish);
  };

  const toggleWishlist = (spot) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(spot.id)) { next.delete(spot.id); refreshMarker(spot, false); }
      else { next.add(spot.id); refreshMarker(spot, true); }
      return next;
    });
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#0d0d0d", height: "100vh", color: "#f5f0e8", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: "14px", background: "#111", flexShrink: 0 }}>
        <div style={{ fontSize: "24px" }}>🍔</div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#e800b0" }}>da Burgs</div>
          <div style={{ fontSize: "11px", color: "#888" }}>{BURGER_SPOTS.length} spots · {wishlist.size} on wishlist</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "14px", fontSize: "11px", color: "#aaa", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#e800b0", boxShadow: "0 0 6px #e800b0aa" }} />
            Burger spot
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ display: "inline-block", width: 13, height: 13, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 10px #f97316aa" }} />
            Want to go
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Collapsible Sidebar */}
        <div style={{
          width: sidebarOpen ? "250px" : "0px",
          minWidth: sidebarOpen ? "250px" : "0px",
          overflow: "hidden",
          transition: "width 0.3s ease, min-width 0.3s ease",
          borderRight: sidebarOpen ? "1px solid #1e1e1e" : "none",
          background: "#0f0f0f",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ overflowY: "auto", flex: 1, width: "250px" }}>
            {BURGER_SPOTS.map((spot) => {
              const isWish = wishlist.has(spot.id);
              const isSel = selectedSpot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    setSelectedSpot(spot);
                    if (leafletMapRef.current) leafletMapRef.current.flyTo([spot.lat, spot.lng], 14, { duration: 0.7 });
                  }}
                  style={{
                    padding: "10px 13px",
                    borderBottom: "1px solid #1a1a1a",
                    cursor: "pointer",
                    background: isSel ? "#1a0a15" : "transparent",
                    borderLeft: isSel ? "3px solid #e800b0" : "3px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: isSel ? "#e800b0" : "#f0ebe0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {spot.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>⭐ {spot.rating}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(spot); }}
                    style={{
                      background: isWish ? "#4a1a00" : "#1f1f1f",
                      border: `1px solid ${isWish ? "#f97316" : "#333"}`,
                      color: isWish ? "#fb923c" : "#666",
                      borderRadius: "6px", padding: "3px 7px", fontSize: "10px", cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {isWish ? "✓" : "+"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map area */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Toggle button — sits on top of map */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              zIndex: 1000,
              background: "#111",
              border: "1px solid #444",
              color: "#f0ebe0",
              borderRadius: "8px",
              padding: "7px 11px",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 8px #0008",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {sidebarOpen ? "◀ Hide list" : "▶ Show list"}
          </button>

          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

          {/* Selected spot popup */}
          {selectedSpot && (
            <div style={{
              position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)",
              background: "#181818", border: "1px solid #333", borderRadius: "12px",
              padding: "13px 16px", minWidth: "230px", zIndex: 1000,
              boxShadow: "0 8px 32px #000a", display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#f0ebe0" }}>{selectedSpot.name}</div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{selectedSpot.address}</div>
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>⭐ {selectedSpot.rating}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <button
                  onClick={() => toggleWishlist(selectedSpot)}
                  style={{
                    background: wishlist.has(selectedSpot.id) ? "#4a1a00" : "#1e1e1e",
                    border: `1px solid ${wishlist.has(selectedSpot.id) ? "#f97316" : "#444"}`,
                    color: wishlist.has(selectedSpot.id) ? "#fb923c" : "#ccc",
                    borderRadius: "8px", padding: "5px 11px", fontSize: "11px", cursor: "pointer",
                  }}
                >
                  {wishlist.has(selectedSpot.id) ? "✓ Wishlisted" : "+ Want to go"}
                </button>
                <button
                  onClick={() => setSelectedSpot(null)}
                  style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "4px 11px", fontSize: "10px", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!leafletReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#666", fontSize: "14px" }}>
              Loading map…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
