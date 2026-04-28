import { useEffect, useState } from "react";
import io from "socket.io-client";
import toast from "react-hot-toast";
import API from "../api/axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// icons
const pulseIcon = L.divIcon({
  className: "pulse-marker",
  html: `<div class="pulse"></div>`,
  iconSize: [20, 20],
});

const activeIcon = L.divIcon({
  className: "pulse-marker-active",
  html: `<div class="pulse active"></div>`,
  iconSize: [26, 26],
});

const dimIcon = L.divIcon({
  className: "pulse-marker-dim",
  html: `<div class="pulse dim"></div>`,
  iconSize: [18, 18],
});

function ChangeMapView({ center, shouldFocus }) {
  const map = useMap();

  useEffect(() => {
    if (shouldFocus && center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, shouldFocus]);

  return null;
}

function Dashboard() {
  const [emergencies, setEmergencies] = useState([]);
  const [position, setPosition] = useState([19.076, 72.8777]);
  const [selected, setSelected] = useState(null);
  const [shouldFocus, setShouldFocus] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ SOCKET (FIXED)
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("newEmergency", (data) => {
      setEmergencies((prev) => [data, ...prev]);
      setPosition([data.location.lat, data.location.lng]);
      setShouldFocus(true);
      toast.error("🚨 New Emergency Triggered");
    });

    socket.on("emergencyUpdated", (updated) => {
      setEmergencies((prev) =>
        prev.map((e) => (e._id === updated._id ? updated : e))
      );
      toast.success("✅ Emergency Resolved");
    });

    return () => socket.disconnect();
  }, []);

  // focus reset
  useEffect(() => {
    if (shouldFocus) {
      const timer = setTimeout(() => setShouldFocus(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldFocus]);

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      const res = await API.get("/emergency");

      if (user?.role === "admin") {
        setEmergencies(res.data);
      } else {
        setEmergencies(
          res.data.filter((e) => e.user?._id === user.id)
        );
      }
    };

    fetchData();
  }, []);

  const sendSOS = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition([lat, lng]);
      setShouldFocus(true);

      const token = localStorage.getItem("token");

      await API.post(
        "/emergency",
        { lat, lng },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    });
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await API.patch(
        `/emergency/${id}/resolve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmergencies((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, status: "resolved" } : e
        )
      );

      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to resolve");
    }
  };

  const total = emergencies.length;
  const pending = emergencies.filter(e => e.status === "pending").length;
  const resolved = emergencies.filter(e => e.status === "resolved").length;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-white">

      {/* NAVBAR */}
      <div className="p-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
            🚨
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-bold">CrisisSync</h1>
            <p className="text-[10px] md:text-xs text-gray-400">
              {user?.role?.toUpperCase()}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="bg-red-600 px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 md:p-4">
        <div className="bg-red-500/20 border border-red-500 p-3 rounded-xl text-center">
          <p className="text-xl md:text-2xl font-bold">{pending}</p>
          <p className="text-xs md:text-sm text-red-300">Active</p>
        </div>

        <div className="bg-green-500/20 border border-green-500 p-3 rounded-xl text-center">
          <p className="text-xl md:text-2xl font-bold">{resolved}</p>
          <p className="text-xs md:text-sm text-green-300">Resolved</p>
        </div>

        <div className="bg-blue-500/20 border border-blue-500 p-3 rounded-xl text-center">
          <p className="text-xl md:text-2xl font-bold">{total}</p>
          <p className="text-xs md:text-sm text-blue-300">Total</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">

        {/* MAP */}
        <div className="w-full md:w-2/3 p-3 md:p-4">
          <div className="mb-3 flex justify-center">
            <button
              onClick={sendSOS}
              className="bg-gradient-to-r from-red-500 to-red-700 px-4 py-2 md:px-6 md:py-3 rounded-xl"
            >
              🚨 Trigger Emergency
            </button>
          </div>

          <MapContainer
            center={position}
            zoom={13}
            className="h-[300px] md:h-[500px] rounded-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <ChangeMapView
              center={
                selected
                  ? [selected.location.lat, selected.location.lng]
                  : position
              }
              shouldFocus={shouldFocus || !!selected}
            />

            {emergencies
              .filter((e) => e.status === "pending")
              .map((emg) => (
                <Marker
                  key={emg._id}
                  position={[emg.location.lat, emg.location.lng]}
                  icon={pulseIcon}
                >
                  <Popup>{emg.user?.name}</Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* PANEL */}
        <div className="w-full md:w-1/3 backdrop-blur-lg bg-white/10 p-3 md:p-4">
          <h2 className="text-lg md:text-xl mb-4">🚨 Emergencies</h2>

          <div className="max-h-[400px] overflow-y-auto">
            {emergencies.map((emg) => (
              <div
                key={emg._id}
                className="p-3 mb-3 bg-white/10 rounded-xl"
              >
                <p>{emg.user?.name}</p>
                <p className="text-xs">{emg.user?.email}</p>

                {user?.role === "admin" && emg.status === "pending" && (
                  <button
                    onClick={() => handleResolve(emg._id)}
                    className="bg-green-600 mt-2 px-3 py-1 rounded"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;