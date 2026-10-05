import React from "react";

// 1. AbacusMaster Icon (Matches User Reference Image)
export function AbacusMasterIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Wood frame gradients */}
        <linearGradient id="abacusWood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DF9B52" />
          <stop offset="50%" stopColor="#F5BE75" />
          <stop offset="100%" stopColor="#C97E36" />
        </linearGradient>
        <linearGradient id="abacusBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        {/* Bead gradients */}
        <linearGradient id="blackBead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="40%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="greenBead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="35%" stopColor="#4ADE80" />
          <stop offset="70%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="148" rx="60" ry="8" fill="#CBD5E1" opacity="0.6" />

      {/* Outer Wooden Base Beam */}
      <rect x="24" y="132" width="112" height="12" rx="4" fill="url(#abacusWood)" stroke="#A05A1C" strokeWidth="1.5" />

      {/* 5 Metal Rods */}
      {[46, 63, 80, 97, 114].map((x, i) => (
        <rect key={i} x={x - 1.5} y="32" width="3" height="102" rx="1.5" fill="#94A3B8" />
      ))}

      {/* Left & Right Wooden Side Posts */}
      <rect x="28" y="24" width="10" height="110" rx="3" fill="url(#abacusWood)" stroke="#A05A1C" strokeWidth="1.5" />
      <rect x="122" y="24" width="10" height="110" rx="3" fill="url(#abacusWood)" stroke="#A05A1C" strokeWidth="1.5" />

      {/* Horizontal Reckoning Separator Beam */}
      <rect x="36" y="58" width="88" height="6" rx="2" fill="url(#abacusBeam)" />
      {/* Unit pointer dots on beam */}
      {[63, 80, 97].map((x, i) => (
        <circle key={i} cx={x} cy="61" r="1.5" fill="#FFFFFF" opacity="0.9" />
      ))}

      {/* Upper Deck (Heaven Beads - 1 per rod, black) */}
      {[
        { x: 46, y: 38 },
        { x: 63, y: 38 },
        { x: 80, y: 50 }, // activated bead down to beam
        { x: 97, y: 38 },
        { x: 114, y: 50 }, // activated bead
      ].map((b, i) => (
        <g key={`upper-${i}`}>
          <ellipse cx={b.x} cy={b.y} rx="7.5" ry="5.5" fill="url(#blackBead)" />
          <ellipse cx={b.x} cy={b.y - 1.5} rx="5" ry="2" fill="#94A3B8" opacity="0.4" />
        </g>
      ))}

      {/* Lower Deck (Earth Beads - 4 per rod, bright green) */}
      {[46, 63, 80, 97, 114].map((x, colIdx) => {
        // give each column a lively visual configuration
        const activeCount = [1, 2, 3, 1, 4][colIdx];
        return (
          <g key={`col-${colIdx}`}>
            {[0, 1, 2, 3].map((rowIdx) => {
              const isActive = rowIdx < activeCount;
              const y = isActive ? 72 + rowIdx * 11 : 92 + rowIdx * 11;
              return (
                <g key={`bead-${colIdx}-${rowIdx}`}>
                  <ellipse cx={x} cy={y} rx="7.5" ry="5.5" fill="url(#greenBead)" stroke="#166534" strokeWidth="0.8" />
                  <ellipse cx={x} cy={y - 1.5} rx="4.5" ry="2" fill="#DCFCE7" opacity="0.75" />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// 2. SpellBytes Icon (Matches ABC toy blocks in reference image)
export function SpellBytesIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cube A: Red */}
        <linearGradient id="cubeRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        {/* Cube B: Yellow/Amber */}
        <linearGradient id="cubeYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        {/* Cube C: Dark Slate/Black */}
        <linearGradient id="cubeBlack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="80" cy="144" rx="56" ry="9" fill="#CBD5E1" opacity="0.6" />

      {/* Top Cube 'A' (Red) */}
      <g transform="translate(56, 22)">
        <rect x="0" y="4" width="48" height="48" rx="10" fill="#B91C1C" />
        <rect x="0" y="0" width="48" height="44" rx="10" fill="url(#cubeRed)" stroke="#B91C1C" strokeWidth="1" />
        <rect x="4" y="4" width="40" height="12" rx="6" fill="#FFFFFF" opacity="0.25" />
        <text
          x="24"
          y="31"
          fill="#FFFFFF"
          fontSize="28"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          style={{ textShadow: "0 2px 3px rgba(0,0,0,0.3)" }}
        >
          A
        </text>
      </g>

      {/* Bottom Left Cube 'B' (Warm Golden Amber) */}
      <g transform="translate(30, 76)">
        <rect x="0" y="4" width="48" height="48" rx="10" fill="#D97706" />
        <rect x="0" y="0" width="48" height="44" rx="10" fill="url(#cubeYellow)" stroke="#D97706" strokeWidth="1" />
        <rect x="4" y="4" width="40" height="12" rx="6" fill="#FFFFFF" opacity="0.35" />
        <text
          x="24"
          y="31"
          fill="#B45309"
          fontSize="28"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          style={{ textShadow: "0 1px 2px rgba(255,255,255,0.4)" }}
        >
          B
        </text>
      </g>

      {/* Bottom Right Cube 'C' (Charcoal Black) */}
      <g transform="translate(82, 76)">
        <rect x="0" y="4" width="48" height="48" rx="10" fill="#020617" />
        <rect x="0" y="0" width="48" height="44" rx="10" fill="url(#cubeBlack)" stroke="#334155" strokeWidth="1" />
        <rect x="4" y="4" width="40" height="12" rx="6" fill="#FFFFFF" opacity="0.15" />
        <text
          x="24"
          y="31"
          fill="#F8FAFC"
          fontSize="28"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
        >
          C
        </text>
      </g>
    </svg>
  );
}

// 3. WizyPuzzle Icon (Matches 4-piece jigsaw puzzle in reference image)
export function WizyPuzzleIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="puzzleShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="144" rx="50" ry="8" fill="#CBD5E1" opacity="0.5" />

      {/* Sparkle star at top left */}
      <g transform="translate(36, 26)">
        <path
          d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z"
          fill="#F59E0B"
        />
        <circle cx="7" cy="7" r="1.5" fill="#FEF08A" />
      </g>

      {/* Motion swoosh lines at bottom right */}
      <path
        d="M124 122C128 120 133 115 134 110"
        stroke="#94A3B8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M129 127C133 125 137 122 138 118"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <g transform="translate(42, 40)" filter="url(#puzzleShadow)">
        {/* Piece 1: Top-Left (Black / Dark Slate) */}
        <path
          d="M6 6H34C37 6 38 10 36 12C33 15 37 20 40 18C42 16 46 19 44 22V40H26C24 43 21 44 19 41C16 38 11 42 14 45C16 47 13 50 10 50H6C3.8 50 2 48.2 2 46V10C2 7.8 3.8 6 6 6Z"
          fill="#1E293B"
        />
        {/* Top-left piece highlight */}
        <circle cx="10" cy="14" r="2" fill="#475569" />

        {/* Piece 2: Top-Right (Forest Green) */}
        <path
          d="M48 6H70C72.2 6 74 7.8 74 10V46C74 48.2 72.2 50 70 50H48V32C45 34 40 30 42 27C44 24 40 20 38 22V6H48Z"
          fill="#2E7D32"
        />
        {/* Subtle tab connection overlay */}
        <circle cx="48" cy="24" r="6" fill="#2E7D32" />

        {/* Piece 3: Bottom-Left (Golden Amber/Yellow) */}
        <path
          d="M6 54H28C30 51 34 50 36 53C39 56 44 52 41 49C39 47 42 44 45 44H48V80H6C3.8 80 2 78.2 2 76V58C2 55.8 3.8 54 6 54Z"
          fill="#F59E0B"
        />
        <circle cx="26" cy="62" r="5" fill="#F59E0B" />

        {/* Piece 4: Bottom-Right (Crimson Red) */}
        <path
          d="M48 54H70C72.2 54 74 55.8 74 58V76C74 78.2 72.2 80 70 80H48V62C51 64 55 61 53 58C51 55 55 52 57 54H48V54Z"
          fill="#E11D48"
        />
        <circle cx="56" cy="68" r="6" fill="#E11D48" />
      </g>
    </svg>
  );
}

// 4. QuizQuest Icon (Matches chat bubble + red question badge in reference image)
export function QuizQuestIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="quizBadgeShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#991B1B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="144" rx="52" ry="8" fill="#CBD5E1" opacity="0.5" />

      {/* Main Speech Bubble Frame */}
      <g transform="translate(32, 28)">
        {/* Tail and main body path */}
        <path
          d="M16 12C16 5.37258 21.3726 0 28 0H74C80.6274 0 86 5.37258 86 12V56C86 62.6274 80.6274 68 74 68H32L16 82V68C9.37258 68 4 62.6274 4 56V24C4 17.3726 9.37258 12 16 12Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 3 Horizontal Chat Lines */}
        <rect x="20" y="24" width="44" height="4" rx="2" fill="#0F172A" />
        <rect x="20" y="36" width="38" height="4" rx="2" fill="#0F172A" />
        <rect x="20" y="48" width="28" height="4" rx="2" fill="#0F172A" />
      </g>

      {/* Red Circular Badge with Question Mark */}
      <g transform="translate(98, 22)" filter="url(#quizBadgeShadow)">
        {/* Red circle */}
        <circle cx="22" cy="22" r="22" fill="#991B1B" stroke="#0F172A" strokeWidth="3" />
        {/* Highlight inner arc */}
        <path
          d="M10 16C12 10 18 7 24 7"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* White Question Mark '?' */}
        <text
          x="22"
          y="30"
          fill="#FFFFFF"
          fontSize="26"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
        >
          ?
        </text>
      </g>
    </svg>
  );
}
