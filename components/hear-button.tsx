"use client";

type HearButtonProps = {
  soundOn: boolean;
  onToggle: () => void;
};

export function HearButton({ soundOn, onToggle }: HearButtonProps) {
  return (
    <button
      type="button"
      className="hear"
      aria-pressed={soundOn}
      aria-label={soundOn ? "Turn the storm sound off" : "Turn the storm sound on"}
      onClick={onToggle}
    >
      <span className="hear-orb" aria-hidden="true" />
      <span className="hear-label">{soundOn ? "Storm is on" : "Hear the storm"}</span>
    </button>
  );
}
