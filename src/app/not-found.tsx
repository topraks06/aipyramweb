import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const isB2BTerminal = host.includes('trtex') || host.includes('hometex');

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: isB2BTerminal ? "#FAFAFA" : "#0A0A0A", color: isB2BTerminal ? "#111" : "#FAFAFA" }}>
      <div style={{ textAlign: "center", padding: "3rem", background: isB2BTerminal ? "#FFF" : "#111", borderRadius: "12px", border: `1px solid ${isB2BTerminal ? '#E5E7EB' : '#333'}`, boxShadow: isB2BTerminal ? '0 10px 40px rgba(0,0,0,0.06)' : 'none' }}>
        <div style={{ fontSize: "6rem", fontWeight: 900, color: "#CC0000", marginBottom: "1rem", letterSpacing: "-2px" }}>404</div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1rem" }}>
          {isB2BTerminal ? "System Protocol Missing" : "Seite nicht gefunden"}
        </h2>
        <p style={{ color: isB2BTerminal ? "#6B7280" : "#888", marginBottom: "2.5rem", maxWidth: "28rem", fontSize: "0.95rem", lineHeight: 1.6, fontWeight: 500 }}>
          {isB2BTerminal 
            ? "The Intelligence Terminal could not locate this trade protocol. Rerouting connection to the main trading floor." 
            : "Die gesuchte Seite existiert nicht oder wurde verschoben."}
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/" style={{ padding: "0.8rem 1.5rem", background: "#CC0000", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700, transition: 'background 0.2s' }}>
                {isB2BTerminal ? "Return to Trade Floor" : "Startseite"}
            </Link>
            
            {isB2BTerminal && (
              <Link href="/request-quote" style={{ padding: "0.8rem 1.5rem", background: "transparent", color: "#CC0000", border: '1px solid #CC0000', borderRadius: "6px", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>
                  Contact Procurement
              </Link>
            )}
        </div>
      </div>
    </div>
  );
}
