import type { ConnectionState } from "../types";

interface Props {
  status: ConnectionState;
}

const LABEL: Record<ConnectionState, string> = {
  connecting: "Connecting…",
  connected: "Live",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting…",
};

export function ConnectionStatus({ status }: Props) {
  return (
    <span className={`connection connection--${status}`} role="status">
      {LABEL[status]}
    </span>
  );
}
