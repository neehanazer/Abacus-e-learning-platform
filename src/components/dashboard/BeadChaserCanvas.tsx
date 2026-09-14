"use client";

import React, { useEffect, useRef } from "react";

interface Bead3D {
  id: number;
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near) for 3D perspective
  radius: number;
  color: string;
  glowColor: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  val: number;
  opacity: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  text?: string;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface KidRunner3D {
  id: number;
  x: number;
  y: number;
  baseY: number;
  jumpY: number;
  isJumping: boolean;
  jumpVelocity: number;
  speed: number;
  direction: 1 | -1;
  avatar: string;
  name: string;
  color: string;
  targetX: number;
  caughtCount: number;
  runCycle: number;
  scale: number;
}

export default function BeadChaserCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const beadColorPalette = [
      { base: "#6C5CE7", glow: "#A29BFE" }, // 3D Purple
      { base: "#FF9F43", glow: "#FECA57" }, // 3D Amber
      { base: "#FF6B6B", glow: "#FF7675" }, // 3D Coral
      { base: "#1DD1A1", glow: "#55EFC4" }, // 3D Mint
      { base: "#0984E3", glow: "#74B9FF" }, // 3D Sky Blue
      { base: "#E84393", glow: "#FD79A8" }, // 3D Pink
      { base: "#F1C40F", glow: "#FFEAA7" }, // 3D Gold
    ];

    // Array of 3D floating & bouncing beads with depth (z-layer)
    const beads: Bead3D[] = Array.from({ length: 32 }, (_, i) => {
      const colorItem = beadColorPalette[Math.floor(Math.random() * beadColorPalette.length)];
      const z = Math.random() * 0.7 + 0.3; // depth scale 0.3 to 1.0
      return {
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.8),
        z,
        radius: (Math.random() * 8 + 14) * z,
        color: colorItem.base,
        glowColor: colorItem.glow,
        speedX: (Math.random() - 0.5) * 1.8 * z,
        speedY: (Math.random() * 0.6 + 0.3) * z,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        val: [1, 2, 5, 10][Math.floor(Math.random() * 4)],
        opacity: 0.9,
      };
    });

    const particles: Particle3D[] = [];

    // Cheerful 3D-styled animated kid runners
    const kids: KidRunner3D[] = [
      {
        id: 1,
        x: 100,
        y: canvas.height - 58,
        baseY: canvas.height - 58,
        jumpY: 0,
        isJumping: false,
        jumpVelocity: 0,
        speed: 2.6,
        direction: 1,
        avatar: "🏃‍♂️",
        name: "Leo",
        color: "#6C5CE7",
        targetX: canvas.width * 0.25,
        caughtCount: 8,
        runCycle: 0,
        scale: 1,
      },
      {
        id: 2,
        x: canvas.width - 140,
        y: canvas.height - 52,
        baseY: canvas.height - 52,
        jumpY: 0,
        isJumping: false,
        jumpVelocity: 0,
        speed: 2.3,
        direction: -1,
        avatar: "🏃‍♀️",
        name: "Mia",
        color: "#FF6B6B",
        targetX: canvas.width * 0.75,
        caughtCount: 11,
        runCycle: 0,
        scale: 1,
      },
      {
        id: 3,
        x: canvas.width * 0.48,
        y: canvas.height - 62,
        baseY: canvas.height - 62,
        jumpY: 0,
        isJumping: false,
        jumpVelocity: 0,
        speed: 2.9,
        direction: 1,
        avatar: "🤸‍♂️",
        name: "Aria",
        color: "#1DD1A1",
        targetX: canvas.width * 0.52,
        caughtCount: 7,
        runCycle: 0,
        scale: 1.08,
      },
      {
        id: 4,
        x: canvas.width * 0.18,
        y: canvas.height - 48,
        baseY: canvas.height - 48,
        jumpY: 0,
        isJumping: false,
        jumpVelocity: 0,
        speed: 2.1,
        direction: -1,
        avatar: "👧",
        name: "Zoe",
        color: "#FF9F43",
        targetX: canvas.width * 0.12,
        caughtCount: 6,
        runCycle: 0,
        scale: 0.95,
      },
    ];

    // Interactive Bead Burst Spawner
    const spawnBeadBurst = (x: number, y: number) => {
      for (let i = 0; i < 5; i++) {
        const colorItem = beadColorPalette[Math.floor(Math.random() * beadColorPalette.length)];
        beads.push({
          id: Date.now() + i,
          x: x + (Math.random() - 0.5) * 80,
          y: y + (Math.random() - 0.5) * 50,
          z: 1,
          radius: Math.random() * 6 + 16,
          color: colorItem.base,
          glowColor: colorItem.glow,
          speedX: (Math.random() - 0.5) * 4,
          speedY: Math.random() * 1.8 + 0.8,
          rotation: Math.random() * Math.PI,
          rotationSpeed: 0.05,
          val: [1, 5, 10][Math.floor(Math.random() * 3)],
          opacity: 1,
        });
      }
      if (beads.length > 45) {
        beads.splice(0, beads.length - 45);
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      spawnBeadBurst(clickX, clickY);

      // Make nearest kid scramble and jump to catch
      const nearestKid = kids.slice().sort((a, b) => Math.abs(a.x - clickX) - Math.abs(b.x - clickX))[0];
      if (nearestKid) {
        nearestKid.targetX = clickX;
        if (!nearestKid.isJumping) {
          nearestKid.isJumping = true;
          nearestKid.jumpVelocity = -10;
        }
      }
    };

    window.addEventListener("click", handleCanvasClick);

    // 3D Render Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sort beads by 3D Z depth for realistic rendering order
      beads.sort((a, b) => a.z - b.z);

      // 1. Draw 3D Floating Abacus Beads with Sphere Lighting & Specular Highlights
      beads.forEach((bead) => {
        bead.x += bead.speedX;
        bead.y += bead.speedY;
        bead.rotation += bead.rotationSpeed;

        if (bead.x < 30 || bead.x > canvas.width - 30) bead.speedX *= -1;
        if (bead.y > canvas.height - 25) {
          bead.y = 15;
          bead.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(bead.x, bead.y);
        ctx.rotate(bead.rotation);

        // 3D Drop Shadow on canvas depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 12 * bead.z;
        ctx.shadowOffsetY = 6 * bead.z;

        // 3D Radial Sphere Lighting Gradient
        const sphereGrad = ctx.createRadialGradient(
          -bead.radius * 0.35,
          -bead.radius * 0.35,
          bead.radius * 0.1,
          0,
          0,
          bead.radius
        );
        sphereGrad.addColorStop(0, "#FFFFFF");
        sphereGrad.addColorStop(0.3, bead.glowColor);
        sphereGrad.addColorStop(0.8, bead.color);
        sphereGrad.addColorStop(1, "#1E272E");

        ctx.beginPath();
        ctx.arc(0, 0, bead.radius, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.fill();

        // 3D Abacus Bead Bi-Conical Rhombus Ridge (Center equator band)
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.ellipse(0, 0, bead.radius * 0.95, bead.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2 * bead.z;
        ctx.stroke();

        // Top Gloss Specular Highlight
        ctx.beginPath();
        ctx.ellipse(
          -bead.radius * 0.3,
          -bead.radius * 0.35,
          bead.radius * 0.3,
          bead.radius * 0.15,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fill();

        // Bead Math Number
        ctx.rotate(-bead.rotation); // un-rotate number for readability
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 ${Math.round(bead.radius * 0.85)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 4;
        ctx.fillText(bead.val.toString(), 0, 1);

        ctx.restore();
      });

      // 2. Draw Cheerful Running Kids
      kids.forEach((kid) => {
        kid.baseY = canvas.height - 52;
        kid.runCycle += 0.22;

        // Pursue nearest bead
        const targetBead = beads
          .filter((b) => b.y > canvas.height * 0.3 && b.y < canvas.height - 25)
          .sort((a, b) => Math.hypot(a.x - kid.x, a.y - (kid.baseY + kid.jumpY)) - Math.hypot(b.x - kid.x, b.y - (kid.baseY + kid.jumpY)))[0];

        if (targetBead) {
          kid.targetX = targetBead.x;
          if (targetBead.y < canvas.height - 110 && Math.abs(targetBead.x - kid.x) < 80 && !kid.isJumping) {
            kid.isJumping = true;
            kid.jumpVelocity = -9.5;
          }
        }

        const dx = kid.targetX - kid.x;
        if (Math.abs(dx) > 12) {
          kid.direction = dx > 0 ? 1 : -1;
          kid.x += kid.direction * kid.speed;
        }

        if (kid.x < 50) kid.x = 50;
        if (kid.x > canvas.width - 50) kid.x = canvas.width - 50;

        if (kid.isJumping) {
          kid.jumpY += kid.jumpVelocity;
          kid.jumpVelocity += 0.45;
          if (kid.jumpY >= 0) {
            kid.jumpY = 0;
            kid.isJumping = false;
            kid.jumpVelocity = 0;
          }
        }

        const currentY = kid.baseY + kid.jumpY;

        // Check if kid caught any bead
        beads.forEach((b) => {
          const dist = Math.hypot(b.x - kid.x, b.y - (currentY - 20));
          if (dist < 42) {
            b.y = 15;
            b.x = Math.random() * canvas.width;
            kid.caughtCount++;

            // 3D Star & Sparkle Particle Bursts
            for (let p = 0; p < 8; p++) {
              particles.push({
                x: kid.x + (Math.random() - 0.5) * 25,
                y: currentY - 25 + (Math.random() - 0.5) * 25,
                z: 1,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3.5 - 1.5,
                color: b.color,
                size: Math.random() * 5 + 2,
                alpha: 1,
                life: 32,
              });
            }

            particles.push({
              x: kid.x,
              y: currentY - 48,
              z: 1,
              vx: 0,
              vy: -1.4,
              text: `+${b.val} ⭐`,
              color: "#FECA57",
              size: 14,
              alpha: 1,
              life: 38,
            });
          }
        });

        // Draw 3D Ground Shadow Under Kid
        ctx.save();
        const shadowScale = Math.max(0.35, 1 + kid.jumpY / 110);
        ctx.beginPath();
        ctx.ellipse(kid.x, kid.baseY + 12, 22 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(108, 92, 231, 0.2)";
        ctx.fill();

        // Draw Kid Sprite with Run Bobbing & Direction Flip
        ctx.save();
        ctx.translate(kid.x, currentY);
        if (kid.direction === -1) {
          ctx.scale(-1, 1);
        }

        const bobY = kid.isJumping ? 0 : Math.sin(kid.runCycle) * 3.5;
        ctx.font = `${Math.round(38 * kid.scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(kid.avatar, 0, -14 + bobY);

        // Catch Net Glow
        ctx.fillStyle = kid.color;
        ctx.beginPath();
        ctx.arc(16, -22 + bobY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3D Tag Pill
        ctx.save();
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        const tagText = `${kid.name} • ${kid.caughtCount} 🧮`;
        const textWidth = ctx.measureText(tagText).width;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 6;
        ctx.roundRect(kid.x - textWidth / 2 - 10, currentY - 54, textWidth + 20, 20, 10);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = kid.color;
        ctx.fillText(tagText, kid.x, currentY - 40);
        ctx.restore();
      });

      // 3. Update & Draw Floating Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / 38;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        if (p.text) {
          ctx.font = `900 ${p.size}px system-ui, sans-serif`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 5;
          ctx.textAlign = "center";
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full opacity-95 pointer-events-auto cursor-crosshair" />
      {/* 3D Horizon Ground Floor Tint */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-purple-200/50 via-purple-50/20 to-transparent pointer-events-none" />
    </div>
  );
}
