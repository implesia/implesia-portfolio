"use client";

type HearButtonProps = {
  soundOn: boolean;
  level: number;
  onToggle: () => void;
  onLevel: (level: number) => void;
};

export function HearButton({ soundOn, level, onToggle, onLevel }: HearButtonProps) {
  return (
    <div className="hear-stack">
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
      {soundOn ? (
        <label className="hear-level">
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={level}
            aria-label="Volume"
            onChange={(event) => onLevel(Number(event.target.value))}
          />
        </label>
      ) : null}
    </div>
  );
}
