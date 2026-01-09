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

  // Responsive sizes: min diameter 30px, prefer viewport-based up to 56px. Font min 12px.
  const buttonSize = "clamp(30px, 6vw, 56px)";
  const fontSize = "clamp(12px, 1.6vw, 18px)";

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "12px",
        borderRadius: 12,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        gap: 8,
        flexWrap: "wrap",
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
            // Use CSS variables to ensure true square buttons and responsive font-size
            style={{
              width: buttonSize,
              height: buttonSize,
              minWidth: "30px",
              minHeight: "30px",
              borderRadius: "50%",
              border: "none",
              cursor: onSelect ? "pointer" : "default",
              backgroundColor: isSelected ? "#4A90E2" : "#78B3E8",
              color: isSelected ? "white" : "black",
              fontSize: fontSize,
              fontWeight: 500,
              display: "inline-flex",
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
                    fontSize: fontSize,
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
