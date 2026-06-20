import { getName, getRole, logout } from "../store/auth";

export default function DashboardHeader() {
  const name = getName();
  const role = getRole();

  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
      <div>
        <h2>{role.toUpperCase()} DASHBOARD</h2>
        <p>Welcome back, {name} 👋</p>
      </div>

      <button onClick={logout}>Logout</button>
    </div>
  );
}