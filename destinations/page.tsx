"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getDestinations } from "@/lib/api";

const spotImages = [
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80",
];

export default function DestinationsPage() {
  const [cityData, setCityData] = useState<Record<string, any>>({});
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState("");
  const [nights, setNights] = useState(2);
  const [guideDays, setGuideDays] = useState(2);
  const [spotIdx, setSpotIdx] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await getDestinations();
      const cityInfo: Record<string, any> = {};
      for (const city of ["Dhaka", "Sylhet", "Chittagong"]) {
        const modes: Record<string, number> = {};
        if (city === "Dhaka") {
          modes["Local"] = 0;
        } else {
          const cityModes = data.transport_modes[city] || {};
          for (const [mode, cost] of Object.entries(cityModes)) {
            modes[mode] = cost as number;
          }
        }
        cityInfo[city] = {
          spots: data.city_spots[city] || [],
          hotelPrice: data.hotel_prices[city] || 15000,
          guideRate: data.guide_rates[city] || 2500,
          transportModes: modes,
          welcome: city === "Dhaka"
            ? "Bangladesh's vibrant capital is a fascinating blend of ancient history and modern energy."
            : city === "Sylhet"
            ? "Nestled among emerald tea gardens and mystical hills, Sylhet is a haven for nature lovers."
            : "Where the mountains meet the sea, Chittagong offers pristine beaches and lush hills.",
        };
      }
      setCityData(cityInfo);
    } catch {
      setCityData({
        Dhaka: { spots: [], hotelPrice: 15000, guideRate: 2500, transportModes: { Local: 0 }, welcome: "Bangladesh's vibrant capital." },
        Sylhet: { spots: [], hotelPrice: 8000, guideRate: 2000, transportModes: { Train: 900, Bus: 1300, Airplane: 7000 }, welcome: "Land of tea gardens." },
        Chittagong: { spots: [], hotelPrice: 12000, guideRate: 2500, transportModes: { Train: 1100, Bus: 1500, Airplane: 8000 }, welcome: "Bay of Bengal's coastal paradise." },
      });
    }
  };

  const showCityDetail = (city: string) => {
    setSelectedCity(city);
    setTransportMode(city === "Dhaka" ? "Local" : Object.keys(cityData[city]?.transportModes || {})[0] || "");
    setNights(2);
    setGuideDays(2);
    setSpotIdx(0);
  };

  const getCost = () => {
    if (!selectedCity || !cityData[selectedCity]) return { transport: 0, hotel: 0, guide: 0, entry: 0, total: 0 };
    const data = cityData[selectedCity];
    const transport = transportMode === "Local" ? 0 : (data.transportModes[transportMode] || 0);
    const hotel = data.hotelPrice * nights;
    const guide = data.guideRate * guideDays;
    let entry = 0;
    for (let i = 0; i <= Math.min(spotIdx, (data.spots?.length || 1) - 1); i++) {
      entry += Number(data.spots[i]?.entry_fee || 0);
    }
    return { transport, hotel, guide, entry, total: transport + hotel + guide + entry };
  };

  const getBestSeason = (city: string) => ({
    Dhaka: "October – March", Sylhet: "September – March", Chittagong: "November – February"
  }[city] || "Year-round");

  const getSubtitle = (city: string) => ({
    Dhaka: "The bustling capital of Bangladesh", Sylhet: "Land of tea gardens and mystic hills", Chittagong: "Bay of Bengal's coastal paradise"
  }[city] || "");

  const cityImages: Record<string, string> = {
    Dhaka: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200&q=80",
    Sylhet: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    Chittagong: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80",
  };

  const cost = getCost();
  const data = selectedCity ? cityData[selectedCity] : null;

  return (
    <>
      <style>{`
        .dest-page { padding-top: 72px; }
        .dest-hero {
          position: relative;
          padding: 100px 48px;
          text-align: center;
          overflow: hidden;
          min-height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dest-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80');
          background-size: cover;
          background-position: center;
        }
        .dest-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,77,66,0.88) 0%, rgba(10,77,66,0.8) 100%);
        }
        .dest-hero-content { position: relative; z-index: 2; }
        .dest-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 4.5vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }
        .dest-hero p {
          font-size: 1.08rem;
          color: rgba(255,255,255,0.8);
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.8;
        }
        .dest-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 72px 24px;
        }
        .dest-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: all 0.4s ease;
        }
        .dest-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-8px);
        }
        .dest-card-img {
          height: 240px;
          position: relative;
          overflow: hidden;
        }
        .dest-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .dest-card:hover .dest-card-img img { transform: scale(1.06); }
        .dest-card-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px 16px;
          background: rgba(255,255,255,0.92);
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .dest-card-body { padding: 26px; }
        .dest-card-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 6px;
        }
        .dest-card-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 18px;
          line-height: 1.6;
        }
        .dest-card-stats {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid var(--line-light);
          margin-bottom: 16px;
        }
        .dest-card-stat { text-align: center; }
        .dest-card-stat strong {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--primary);
          display: block;
        }
        .dest-card-stat span {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dest-card-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: var(--primary);
          color: #fff;
          border-radius: var(--radius-xs);
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          justify-content: center;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(10,77,66,0.2);
        }
        .dest-card-link:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }
        /* City Detail */
        .dest-detail-header {
          height: 420px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .dest-detail-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,77,66,0.25) 0%, rgba(10,77,66,0.9) 100%);
        }
        .dest-detail-header-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0 48px 48px;
          color: #fff;
          z-index: 2;
        }
        .dest-detail-header-content h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .dest-detail-header-content p {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.85);
        }
        .dest-season-badge {
          display: inline-block;
          padding: 7px 20px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50px;
          font-size: 0.85rem;
          margin-top: 14px;
          backdrop-filter: blur(6px);
          color: rgba(255,255,255,0.9);
        }
        .dest-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          margin: 32px 24px;
          border: 1.5px solid var(--primary);
          color: var(--primary);
          border-radius: var(--radius-xs);
          font-size: 0.88rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.25s;
        }
        .dest-back-link:hover { background: var(--primary); color: #fff; }
        .dest-intro {
          max-width: 1200px;
          margin: 0 auto 40px;
          padding: 0 24px;
        }
        .dest-intro-box {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: var(--radius);
          padding: 36px 40px;
          font-family: var(--font-accent);
          font-size: 1.15rem;
          font-style: italic;
          line-height: 1.9;
          color: rgba(255,255,255,0.9);
        }
        .dest-calc {
          max-width: 1200px;
          margin: 0 auto 52px;
          padding: 0 24px;
        }
        .dest-calc-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 36px;
          box-shadow: var(--shadow);
        }
        .dest-calc-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 28px;
        }
        .dest-calc-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .dest-calc-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .dest-calc-field select,
        .dest-calc-field input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--line);
          border-radius: var(--radius-xs);
          font-family: var(--font-body);
          font-size: 0.9rem;
          background: var(--bg);
          outline: none;
        }
        .dest-calc-field select:focus,
        .dest-calc-field input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(10,77,66,0.06); }
        .dest-cost-box {
          background: var(--bg);
          border-radius: var(--radius-sm);
          padding: 24px 28px;
          border-left: 4px solid var(--primary);
        }
        .dest-cost-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--line-light);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .dest-cost-item:last-child { border-bottom: none; }
        .dest-cost-total {
          display: flex;
          justify-content: space-between;
          padding-top: 14px;
          margin-top: 10px;
          border-top: 2px solid var(--primary);
        }
        .dest-cost-total span:first-child {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text);
        }
        .dest-cost-total strong {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--primary);
        }
        .dest-spots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 90px;
        }
        .dest-spot-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: all 0.35s ease;
        }
        .dest-spot-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-4px);
        }
        .dest-spot-img {
          height: 180px;
          overflow: hidden;
        }
        .dest-spot-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .dest-spot-card:hover .dest-spot-img img { transform: scale(1.05); }
        .dest-spot-body { padding: 22px; }
        .dest-spot-name {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .dest-spot-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .dest-spot-tag {
          padding: 4px 12px;
          background: rgba(10,77,66,0.06);
          color: var(--primary);
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .dest-spot-desc {
          font-family: var(--font-accent);
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 14px;
          font-style: italic;
        }
        .dest-spot-fee {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding-top: 12px;
          border-top: 1px solid var(--line-light);
          font-weight: 500;
        }
        @media (max-width: 800px) {
          .dest-hero { padding: 72px 20px; min-height: 280px; }
          .dest-grid { grid-template-columns: 1fr; padding: 40px 20px; }
          .dest-detail-header { height: 300px; }
          .dest-detail-header-content { padding: 0 20px 28px; }
          .dest-spots-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar activePage="destinations" />

      <div className="dest-page">
        {!selectedCity ? (
          <>
            <div className="dest-hero">
              <div className="dest-hero-bg"></div>
              <div className="dest-hero-overlay"></div>
              <div className="dest-hero-content">
                <h1>Where will you go next?</h1>
                <p>Three extraordinary destinations where ancient heritage meets breathtaking landscapes — awaiting your discovery.</p>
              </div>
            </div>
            <div className="dest-grid">
              {[
                { city: "Dhaka", img: cityImages.Dhaka, season: "Oct – Mar", spots: 8, days: "3–5" },
                { city: "Sylhet", img: cityImages.Sylhet, season: "Sep – Mar", spots: 10, days: "3–4" },
                { city: "Chittagong", img: cityImages.Chittagong, season: "Nov – Feb", spots: 7, days: "3–5" },
              ].map((c) => (
                <div className="dest-card" key={c.city} onClick={() => showCityDetail(c.city)}>
                  <div className="dest-card-img">
                    <img src={c.img} alt={c.city} />
                    <span className="dest-card-badge">{c.season}</span>
                  </div>
                  <div className="dest-card-body">
                    <h2 className="dest-card-name">{c.city}</h2>
                    <p className="dest-card-subtitle">{getSubtitle(c.city)}</p>
                    <div className="dest-card-stats">
                      <div className="dest-card-stat"><strong>{c.spots}+</strong><span>Stays</span></div>
                      <div className="dest-card-stat"><strong>{c.days}</strong><span>Days</span></div>
                      <div className="dest-card-stat"><strong>{c.season.split("–")[0].trim()}</strong><span>Best From</span></div>
                    </div>
                    <span className="dest-card-link">
                      See stays <i className="bi bi-arrow-right"></i>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : data && (
          <>
            <div className="dest-detail-header" style={{ backgroundImage: `url(${cityImages[selectedCity || "Dhaka"]})` }}>
              <div className="dest-detail-header-content">
                <p style={{ fontSize: "0.75rem", letterSpacing: 4, textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>ComfyGo Destinations</p>
                <h1>{selectedCity}</h1>
                <p>{getSubtitle(selectedCity)}</p>
                <span className="dest-season-badge">
                  Best time: {getBestSeason(selectedCity)}
                </span>
              </div>
            </div>

            <a className="dest-back-link" onClick={() => setSelectedCity(null)}>
              <i className="bi bi-arrow-left"></i> Back to Destinations
            </a>

            <div className="dest-intro">
              <div className="dest-intro-box">{data.welcome}</div>
            </div>

            <div className="dest-calc">
              <div className="dest-calc-card">
                <h2 className="dest-calc-title">Trip Cost Estimator</h2>
                <div className="dest-calc-row">
                  <div className="dest-calc-field">
                    <label>Transport Mode</label>
                    <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
                      {selectedCity === "Dhaka" ? (
                        <option value="Local">Already in Dhaka</option>
                      ) : (
                        Object.entries(data.transportModes).map(([mode, cost]) => (
                          <option key={mode} value={mode}>{mode} — ৳{(cost as number).toLocaleString()}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="dest-calc-field">
                    <label>Nights</label>
                    <input type="number" min={1} max={14} value={nights} onChange={(e) => setNights(Number(e.target.value))} />
                  </div>
                  <div className="dest-calc-field">
                    <label>Guide Days</label>
                    <input type="number" min={1} max={14} value={guideDays} onChange={(e) => setGuideDays(Number(e.target.value))} />
                  </div>
                  <div className="dest-calc-field">
                    <label>Spots to Visit</label>
                    <select value={spotIdx} onChange={(e) => setSpotIdx(Number(e.target.value))}>
                      {data.spots.map((s: any, i: number) => (
                        <option key={i} value={i}>{s.spot_name} — ৳{s.entry_fee}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="dest-cost-box">
                  <div className="dest-cost-item"><span>Transport</span><span>৳{cost.transport.toLocaleString()}</span></div>
                  <div className="dest-cost-item"><span>Hotel — ৳{data.hotelPrice.toLocaleString()} × {nights} nights</span><span>৳{cost.hotel.toLocaleString()}</span></div>
                  <div className="dest-cost-item"><span>Guide — ৳{data.guideRate.toLocaleString()} × {guideDays} days</span><span>৳{cost.guide.toLocaleString()}</span></div>
                  <div className="dest-cost-item"><span>Entry Fees ({spotIdx + 1} spots)</span><span>৳{cost.entry.toLocaleString()}</span></div>
                  <div className="dest-cost-total"><span>Total Estimated Cost</span><strong>৳{cost.total.toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>Curated Attractions</p>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: 28 }}>Must-Visit Places</h2>
            </div>

            <div className="dest-spots-grid">
              {data.spots.map((spot: any, i: number) => (
                <div className="dest-spot-card" key={spot.spot_id}>
                  <div className="dest-spot-img">
                    <img src={spotImages[i % spotImages.length]} alt={spot.spot_name} />
                  </div>
                  <div className="dest-spot-body">
                    <h3 className="dest-spot-name">{spot.spot_name}</h3>
                    <div className="dest-spot-meta">
                      <span className="dest-spot-tag">{spot.best_season}</span>
                      {spot.estimated_hours && <span className="dest-spot-tag">{spot.estimated_hours} hrs</span>}
                    </div>
                    <p className="dest-spot-desc">{spot.description || "A wonderful destination worth visiting."}</p>
                    <p className="dest-spot-fee">Entry Fee: ৳{Number(spot.entry_fee).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
