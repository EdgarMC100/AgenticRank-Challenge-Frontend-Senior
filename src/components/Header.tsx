import type { ConnectionState } from "../types";
import { ConnectionStatus } from "./ConnectionStatus";

interface Props {
  status: ConnectionState;
}

export function Header({ status }: Props) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__title">LiveBoard</span>
        <span
          className={`header__dot header__dot--${
            status === "connected" ? "on" : "off"
          }`}
          aria-hidden="true"
        />
      </div>
      <ConnectionStatus status={status} />
    </header>
  );
}
