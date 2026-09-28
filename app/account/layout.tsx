import "../account.css";
import { signOut } from "@/lib/actions/auth";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="account-page">
      <nav className="account-nav">
        <a href="/" className="account-logo">
          <div className="account-logo-img">
            <img src="/logo.jpg" alt="VX" />
          </div>
          <div className="account-logo-name">VIRALEXCHANGE</div>
        </a>
        <div className="account-nav-right">
          <a href="/">Home</a>
          <a href="/deals">Pipeline</a>
          <form action={signOut}>
            <button className="account-signout" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
