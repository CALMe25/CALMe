import React, { useState } from "react";
import { Logo } from "../../assets/Logo";

type ScaleProps = {
  min?: number;
  max?: number;
  selected?: number | null;
  onSelect?: (value: number) => void;
  circleSize?: number;
};

export const Scale: React.FC<ScaleProps> = ({
  min = 1,
  max = 10,
  selected: controlledSelected,
  onSelect,
  circleSize = 56,
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
        padding: "16px 24px",
        borderRadius: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
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
              width: circleSize,
              height: circleSize,
              borderRadius: "50%",
              border: "none",
              cursor: onSelect ? "pointer" : "default",
              backgroundColor: isSelected ? "transparent" : "#78B3E8",
              color: "black",
              fontSize: 16,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
              boxShadow: isSelected ? "0 0 0 3px rgba(74,144,226,0.4)" : "none",
              position: "relative",
            }}
          >
            {isSelected ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Logo className="w-full h-full" />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {value}
                </div>
              </div>
            ) : (
              value
            )}
          </button>
        );
      })}
    </div>
  );
};
