// src/components/feature/game/GameRouteGuard.tsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../../../app/store";

export default function GameRouteGuard() {
  const gameStatus = useSelector((state: RootState) => state.game.gameStatus);
  if (gameStatus === "idle") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
