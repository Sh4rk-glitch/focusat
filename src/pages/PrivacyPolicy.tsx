import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function PrivacyPolicy() {
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
        <h1>Privacy Policy for Focus</h1>
        <p className="policy-date"><strong>Effective Date:</strong> August 23, 2026</p>
        <p><strong>Website:</strong> <a className="text-link" href="https://focusat.vercel.app">https://focusat.vercel.app</a></p>

        <p>Focus ("we," "our," or "us") provides a web application designed to help users manage tasks, productivity, and project workflows. This Privacy Policy outlines how we collect, use, and protect your information when you use our application.</p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Google Account Information:</strong> When you sign in using Google OAuth, we collect basic profile details provided by Google, including your name, email address, and profile picture.</li>
          <li><strong>Application Data:</strong> We store data you create while using the application, such as tasks, project details, and user preferences.</li>
          <li><strong>Usage &amp; Device Data:</strong> We may collect standard technical logs, including browser type, operating system, and access timestamps, to monitor performance and security.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Authenticate your identity and secure your account access.</li>
          <li>Store and display your personal tasks, workflows, and settings.</li>
          <li>Maintain, troubleshoot, and optimize application performance.</li>
          <li>Prevent unauthorized access and enhance security.</li>
        </ul>

        <h2>3. Data Storage and Third-Party Services</h2>
        <ul>
          <li><strong>Authentication &amp; Database (Supabase):</strong> User authentication and database records are securely processed and hosted using Supabase.</li>
          <li><strong>Hosting (Vercel):</strong> The front-end application is hosted via Vercel.</li>
          <li><strong>Google API Services:</strong> Our use of information received from Google APIs adheres to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements.</li>
          <li><strong>No Sale of Data:</strong> We do not sell, rent, or trade your personal data to third parties for advertising or marketing purposes.</li>
        </ul>

        <h2>4. Data Security &amp; Retention</h2>
        <p>We apply industry-standard security practices to protect your data from unauthorized access, alteration, or disclosure. We retain your data as long as your account remains active or as needed to provide our services.</p>

        <h2>5. Your Rights &amp; Data Deletion</h2>
        <p>You have full control over your personal data. You may:</p>
        <ul>
          <li>Request an export of your stored account data.</li>
          <li>Revoke Focus's access to your Google account at any time via <a className="text-link" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account Security Settings</a>.</li>
          <li>Request complete deletion of your account and associated database records by contacting us directly.</li>
        </ul>

        <h2>6. Contact Information</h2>
        <p>For any questions regarding this Privacy Policy or to request data removal, please contact:</p>
        <ul>
          <li><strong>Email:</strong> <a className="text-link" href="mailto:shouryamishra011@gmail.com">shouryamishra011@gmail.com</a></li>
          <li><strong>Website:</strong> <a className="text-link" href="https://focusat.vercel.app">https://focusat.vercel.app</a></li>
        </ul>
      </main>
    </div>
  )
}
