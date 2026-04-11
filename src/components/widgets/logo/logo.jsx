import ResolvedIcon from "components/resolvedicon";

import Container from "../widget/container";
import Raw from "../widget/raw";

export default function Logo({ options }) {
  return (
    <Container
      options={options}
      additionalClassNames={`information-widget-logo ${options.icon ? "resolved" : "fallback"}`}
    >
      <Raw>
        {options.icon ? (
          <div className="resolved mr-3">
            <ResolvedIcon icon={options.icon} width={48} height={48} />
          </div>
        ) : (
          // Panelio logo fallback
          <div className="fallback w-12 h-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="w-full h-full"
            >
              <rect width="256" height="256" rx="24" fill="#0B0F14"/>
              <rect x="32" y="48" width="88" height="56" rx="6" fill="#3B82F6"/>
              <rect x="136" y="48" width="88" height="28" rx="6" fill="#3B82F6"/>
              <rect x="136" y="88" width="56" height="16" rx="4" fill="#3B82F6" opacity="0.5"/>
              <rect x="32" y="120" width="56" height="88" rx="6" fill="#3B82F6"/>
              <rect x="104" y="120" width="120" height="88" rx="6" fill="#3B82F6"/>
              <rect x="32" y="120" width="16" height="88" rx="4" fill="#3B82F6" opacity="0.4"/>
            </svg>
          </div>
        )}
      </Raw>
    </Container>
  );
}
