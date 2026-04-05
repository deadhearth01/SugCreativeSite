"use client";

/**
 * ProfileSetup - Username and Avatar Picker
 * Based on KokonutUI Avatar Picker design
 */

import type { Variants } from "motion/react";
import type { ReactNode } from "react";
import { Check, ChevronRight, User2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Avatar {
  id: number;
  svg: ReactNode;
  alt: string;
}

// RGB values for the per-avatar color ring on the stage
const AVATAR_RGB: Record<number, string> = {
  1: "53, 200, 224",  // cyan - matches brand
  2: "130, 201, 61",  // lime - matches brand
  3: "147, 51, 234",  // violet
  4: "245, 158, 11",  // amber
};

const avatars: Avatar[] = [
  {
    id: 1,
    svg: (
      <svg
        aria-label="Avatar 1"
        fill="none"
        height="40"
        role="img"
        viewBox="0 0 36 36"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Cyan Avatar</title>
        <mask height="36" id=":avatar1:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:avatar1:)">
          <rect fill="#35C8E0" height="36" width="36" />
          <rect
            fill="#1A9AB5"
            height="36"
            rx="6"
            transform="translate(9 -5) rotate(219 18 18) scale(1)"
            width="36"
          />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="10" y="14" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: "Cyan Avatar",
  },
  {
    id: 2,
    svg: (
      <svg
        aria-label="Avatar 2"
        fill="none"
        height="40"
        role="img"
        viewBox="0 0 36 36"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Lime Avatar</title>
        <mask height="36" id=":avatar2:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:avatar2:)">
          <rect fill="#82C93D" height="36" width="36" />
          <rect
            fill="#5A9127"
            height="36"
            rx="6"
            transform="translate(5 -1) rotate(55 18 18) scale(1.1)"
            width="36"
          />
          <g transform="translate(7 -6) rotate(-5 18 18)">
            <path d="M15 20c2 1 4 1 6 0" fill="none" stroke="#FFFFFF" strokeLinecap="round" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="14" y="14" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="20" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: "Lime Avatar",
  },
  {
    id: 3,
    svg: (
      <svg
        aria-label="Avatar 3"
        fill="none"
        height="40"
        role="img"
        viewBox="0 0 36 36"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Violet Avatar</title>
        <mask height="36" id=":avatar3:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:avatar3:)">
          <rect fill="#9333EA" height="36" width="36" />
          <rect
            fill="#7C3AED"
            height="36"
            rx="36"
            transform="translate(-3 7) rotate(227 18 18) scale(1.2)"
            width="36"
          />
          <g transform="translate(-3 3.5) rotate(7 18 18)">
            <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="10" y="14" />
            <rect fill="#FFFFFF" height="2" rx="1" stroke="none" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
    alt: "Violet Avatar",
  },
  {
    id: 4,
    svg: (
      <svg
        aria-label="Avatar 4"
        fill="none"
        height="40"
        role="img"
        viewBox="0 0 36 36"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Amber Avatar</title>
        <mask height="36" id=":avatar4:" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#:avatar4:)">
          <rect fill="#F59E0B" height="36" width="36" />
          <rect
            fill="#D97706"
            height="36"
            rx="6"
            transform="translate(0 0) rotate(180 18 18) scale(1.1)"
            width="36"
          />
          <g transform="translate(0 0)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="12" y="13" />
            <rect fill="#000000" height="2" rx="1" stroke="none" width="1.5" x="22" y="13" />
          </g>
        </g>
      </svg>
    ),
    alt: "Amber Avatar",
  },
];

interface ProfileSetupProps {
  onComplete: (data: { username: string; avatarId: number }) => void;
  isLoading?: boolean;
}

export function ProfileSetup({ onComplete, isLoading = false }: ProfileSetupProps) {
  const [step, setStep] = useState<"avatar" | "username" | "complete">("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const prefersReducedMotion = useReducedMotion();

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username must be 20 characters or less";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Only letters, numbers, and underscores allowed";
    }
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (value) {
      setUsernameError(validateUsername(value));
    } else {
      setUsernameError("");
    }
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setStep("username");
  };

  const handleComplete = () => {
    if (!selectedAvatar || !username || usernameError) return;
    setStep("complete");
    onComplete({ username, avatarId: selectedAvatar.id });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    }
  };

  const avatarRGB = selectedAvatar ? AVATAR_RGB[selectedAvatar.id] : "53, 200, 224";

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-black rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {step === "avatar" && (
            <motion.div
              key="avatar"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Choose Your Avatar</h2>
                <p className="text-sm text-muted-foreground">
                  Pick an avatar that represents you
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleAvatarSelect(avatar)}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    className={cn(
                      "relative p-3 rounded-3xl border-2 border-black transition-all",
                      "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                    style={{
                      backgroundColor: `rgba(${AVATAR_RGB[avatar.id]}, 0.1)`,
                    }}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full overflow-hidden">
                      {avatar.svg}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "username" && (
            <motion.div
              key="username"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <button
                type="button"
                onClick={() => setStep("avatar")}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                ← Back
              </button>

              <div className="text-center space-y-4">
                {/* Selected Avatar Display */}
                <motion.div
                  className="relative w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, rgba(${avatarRGB}, 0.2) 0%, rgba(${avatarRGB}, 0.4) 100%)`,
                    boxShadow: `0 0 20px rgba(${avatarRGB}, 0.3)`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px rgba(${avatarRGB}, 0.3)`,
                      `0 0 30px rgba(${avatarRGB}, 0.5)`,
                      `0 0 20px rgba(${avatarRGB}, 0.3)`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden scale-[1.6]">
                    {selectedAvatar?.svg}
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Pick a Username</h2>
                  <p className="text-sm text-muted-foreground">
                    This will be your unique identifier
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="username"
                    value={username}
                    onChange={handleUsernameChange}
                    className={cn(
                      "pl-10 h-12 rounded-3xl border-2 border-black",
                      "focus:ring-2 focus:ring-primary focus:border-black",
                      usernameError && "border-red-500"
                    )}
                    maxLength={20}
                  />
                </div>
                {usernameError && (
                  <p className="text-sm text-red-500">{usernameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              <Button
                onClick={handleComplete}
                disabled={!username || !!usernameError || isLoading}
                className={cn(
                  "w-full h-12 rounded-3xl border-2 border-black",
                  "bg-primary hover:bg-primary/90",
                  "shadow-[4px_4px_0px_rgba(0,0,0,1)]",
                  "hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[2px] hover:translate-y-[2px]",
                  "transition-all font-bold uppercase tracking-wide"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              key="complete"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center space-y-4 py-8"
            >
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Check className="w-8 h-8 text-green-600" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">Welcome, @{username}!</h2>
                <p className="text-sm text-muted-foreground">
                  Your profile is all set up
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default ProfileSetup;
