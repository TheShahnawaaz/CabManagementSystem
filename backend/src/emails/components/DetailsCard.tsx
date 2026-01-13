import * as React from "react";
import { Text } from "@react-email/components";

interface DetailItem {
  icon: string;
  label: string;
  value: string;
  isSuccess?: boolean;
}

interface DetailsCardProps {
  items: DetailItem[];
}

export const DetailsCard: React.FC<DetailsCardProps> = ({ items }) => {
  return (
    <table
      className="details-card"
      cellPadding="0"
      cellSpacing="0"
      style={{
        width: "100%",
        backgroundColor: "#f5f5f5",
        borderRadius: "10px",
        border: "1px solid #e5e5e5",
        borderCollapse: "collapse" as const,
        margin: "24px 0",
        overflow: "hidden",
      }}
    >
      <tbody>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const cellStyle: React.CSSProperties = {
            padding: "14px 20px",
            verticalAlign: "middle",
            borderBottom: isLast ? "none" : "1px solid #e5e5e5",
          };

          return (
            <tr key={index} className="detail-row">
              <td style={cellStyle}>
                <Text
                  className="detail-label"
                  style={{ margin: 0, color: "#525252", fontSize: "14px" }}
                >
                  {item.icon} {item.label}
                </Text>
              </td>
              <td
                style={{
                  ...cellStyle,
                  textAlign: "right",
                }}
              >
                <Text
                  className="detail-value"
                  style={{
                    margin: 0,
                    color: item.isSuccess ? "#16a34a" : "#171717",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {item.value}
                </Text>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DetailsCard;
