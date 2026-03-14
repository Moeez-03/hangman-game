// frontend/src/components/Gallows.jsx
export default function Gallows({ step = 0 }) {
  // step = 0..10, each step reveals one part
  const show = (n) => ({ opacity: step >= n ? 1 : 0, transition: 'opacity 0.4s ease' });

  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg"
         style={{ width: '100%', height: '100%' }}>

      {/* Ground — always visible */}
      <line x1="20" y1="175" x2="160" y2="175"
            stroke="#26262f" strokeWidth="4" strokeLinecap="round"/>

      {/* Structure */}
      <line style={show(1)} x1="50" y1="175" x2="50" y2="10"
            stroke="#34343f" strokeWidth="4" strokeLinecap="round"/>
      <line style={show(2)} x1="50" y1="10" x2="120" y2="10"
            stroke="#34343f" strokeWidth="4" strokeLinecap="round"/>
      <line style={show(3)} x1="50" y1="38" x2="82" y2="10"
            stroke="#34343f" strokeWidth="3" strokeLinecap="round"/>
      <line style={show(4)} x1="120" y1="10" x2="120" y2="38"
            stroke="#34343f" strokeWidth="3" strokeLinecap="round"/>

      {/* Body parts */}
      <circle style={show(5)} cx="120" cy="52" r="14"
              stroke="#ff4d6d" strokeWidth="2.5"/>
      <line style={show(6)} x1="120" y1="66" x2="120" y2="110"
            stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round"/>
      <line style={show(7)} x1="120" y1="80" x2="96" y2="100"
            stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round"/>
      <line style={show(8)} x1="120" y1="80" x2="144" y2="100"
            stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round"/>
      <line style={show(9)} x1="120" y1="110" x2="98" y2="142"
            stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round"/>
      <line style={show(10)} x1="120" y1="110" x2="142" y2="142"
            stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
