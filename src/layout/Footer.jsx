import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © {currentYear} RailAdmin. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <span className="footer-separator">•</span>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <span className="footer-separator">•</span>
          <a href="/support" className="footer-link">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
