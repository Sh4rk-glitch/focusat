import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function TermsOfService() {
  return (
    <div className="page policy-page">
      <header className="nav">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <nav>
          <Link to="/signin">Sign in</Link>
          <Link to="/signup" className="nav-cta">Create account</Link>
        </nav>
      </header>

      <main className="policy-content">
        <p className="eyebrow">Legal</p>
        <h1>Terms of Service for Focus</h1>
        <p className="policy-date"><strong>Effective Date:</strong> August 23, 2026</p>
        <p><strong>Website:</strong> <a className="text-link" href="https://focusat.vercel.app">https://focusat.vercel.app</a></p>

        <p>These Terms of Service ("Terms") govern your access to and use of Focus ("the Service," "we," "our," or "us"). By accessing or using the Service, you agree to be bound by these Terms.</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account or accessing the Service, you confirm that you have read, understood, and agreed to these Terms. If you do not agree, do not use the Service.</p>

        <h2>2. User Accounts &amp; Authentication</h2>
        <ul>
          <li><strong>Account Creation:</strong> You must authenticate using a supported third-party provider, such as Google OAuth, to access certain features.</li>
          <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.</li>
          <li><strong>Accurate Information:</strong> You agree to provide accurate and complete account information.</li>
        </ul>

        <h2>3. Acceptable Use</h2>
        <p>You agree not to misuse the Service. Specifically, you agree not to:</p>
        <ul>
          <li>Attempt to gain unauthorized access to the application, servers, or networks connected to the Service.</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
          <li>Use the Service for any unlawful, fraudulent, or malicious activities.</li>
          <li>Interfere with or disrupt the performance, integrity, or security of the Service for other users.</li>
        </ul>

        <h2>4. Intellectual Property &amp; User Content</h2>
        <ul>
          <li><strong>Our Rights:</strong> Focus and its original code, designs, features, and functionality remain the exclusive property of Focus and its creators.</li>
          <li><strong>Your Rights:</strong> You retain full ownership and intellectual property rights over any data, tasks, notes, or content you submit or create within the application.</li>
        </ul>

        <h2>5. Termination</h2>
        <p>We reserve the right to suspend or terminate your access to the Service at our sole discretion, without prior notice, if you violate these Terms or engage in conduct that harms the application or other users. You may terminate your account at any time by requesting account deletion.</p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>The Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied. We do not guarantee that the Service will be uninterrupted, error-free, secure, or free from data loss.</p>

        <h2>7. Limitation of Liability</h2>
        <p>To the fullest extent permitted by applicable law, Focus and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or use resulting from:</p>
        <ul>
          <li>Your access to or use of (or inability to access or use) the Service.</li>
          <li>Any unauthorized access to or alteration of your content or transmissions.</li>
        </ul>

        <h2>8. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Changes will be posted to this page with an updated "Effective Date." Your continued use of the Service after updates constitutes acceptance of the modified Terms.</p>

        <h2>9. Contact Us</h2>
        <p>If you have questions about these Terms of Service, please contact:</p>
        <ul>
          <li><strong>Email:</strong> <a className="text-link" href="mailto:shouryamishra011@gmail.com">shouryamishra011@gmail.com</a></li>
          <li><strong>Website:</strong> <a className="text-link" href="https://focusat.vercel.app">https://focusat.vercel.app</a></li>
        </ul>
      </main>
    </div>
  )
}
