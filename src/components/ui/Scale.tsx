import React, { useState } from "react";
import { Logo } from "../../assets/Logo";

type ScaleProps = {
  min?: number;
  max?: number;
  selected?: number | null;
  onSelect?: (value: number) => void;
};

export const Scale: React.FC<ScaleProps> = ({
  min = 1,
  max = 10,
  selected: controlledSelected,
  onSelect,
}) => {
  const [internalSelected, setInternalSelected] = useState<number | null>(null);

  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handleSelect = (value: number) => {
    setInternalSelected(value);
    if (onSelect) {
      onSelect(value);
    }
  };

  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "clamp(8px, 2vw, 16px)",
        borderRadius: 12,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        gap: "clamp(4px, 1.5vw, 10px)",
        width: "100%",
      }}
    >
      {values.map((value) => {
        const isSelected = value === selected;
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              handleSelect(value);
            }}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              border: "none",
              cursor: onSelect ? "pointer" : "default",
              backgroundColor: isSelected ? "#4A90E2" : "#78B3E8",
              color: isSelected ? "white" : "black",
              fontSize: "clamp(16px, 3vw, 28px)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
              boxShadow: isSelected ? "0 0 0 4px rgba(74,144,226,0.18)" : "none",
              position: "relative",
              padding: 0,
              lineHeight: 1,
            }}
          >
            {isSelected ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <Logo className="w-full h-full" />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "clamp(16px, 3vw, 28px)",
                    fontWeight: "bold",
                    pointerEvents: "none",
                  }}
                >
                  {value}
                </div>
              </div>
            ) : (
              <span style={{ display: "inline-block", lineHeight: 1 }}>{value}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
