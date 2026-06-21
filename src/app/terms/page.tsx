import PublicHeader from "@/components/shared/PublicHeader";
import PublicFooter from "@/components/shared/PublicFooter";

export const metadata = {
  title: "Terms of Service — Cloak",
  description: "The terms governing use of the Cloak digital cloakroom platform by venues and guests.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Terms of Service</h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated: 21 June 2026</p>
        </div>

        <div className="prose prose-zinc max-w-none text-zinc-700 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-800 [&_li]:mb-1 [&_p]:mb-4 [&_p]:leading-7 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5">

          <p>
            These Terms of Service ("Terms") govern your use of the Cloak platform, operated by Cloak Group Limited,
            a company incorporated in England and Wales (Companies House number 14766375) ("Cloak", "we", "us",
            "our"). By accessing or using our platform — whether as a venue operator, venue staff member, or a guest
            obtaining a cloakroom pass — you agree to be bound by these Terms.
          </p>
          <p>
            These Terms are governed by the laws of England and Wales.
          </p>

          <h2>1. Definitions</h2>
          <ul>
            <li>
              <strong>"Platform"</strong> — the Cloak web application, APIs, and any associated services
            </li>
            <li>
              <strong>"Venue"</strong> — a business (nightclub, event space, or hospitality operator) registered on
              the Platform to manage their cloakroom operations
            </li>
            <li>
              <strong>"Venue User"</strong> — a venue operator or staff member with an account on the Platform
            </li>
            <li>
              <strong>"Guest"</strong> — an individual who obtains a digital cloakroom pass through the Platform
            </li>
            <li>
              <strong>"Pass"</strong> — the digital cloakroom ticket (delivered via QR code or text fallback code)
              generated for a Guest
            </li>
          </ul>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to register as a Venue User. By registering, you confirm that the
            information you provide is accurate and that you are authorised to act on behalf of the Venue.
          </p>
          <p>
            Guests must be at least 16 years old to create a Pass. By submitting your details, you confirm you meet
            this requirement.
          </p>

          <h2>3. Venue accounts</h2>

          <h3>Registration</h3>
          <p>
            Venues must complete the registration process and provide accurate business information. We reserve the
            right to decline or revoke registration at our discretion, including where we reasonably suspect
            misuse or fraudulent activity.
          </p>

          <h3>Account security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You must notify
            us immediately at{" "}
            <a className="text-zinc-900 underline underline-offset-2" href="mailto:support@cloakqr.com">
              support@cloakqr.com
            </a>{" "}
            if you suspect unauthorised access. We are not liable for loss resulting from unauthorised use of your
            account where you have failed to keep credentials secure.
          </p>

          <h3>Staff access</h3>
          <p>
            Venue operators may grant staff members access to the Platform. You are responsible for ensuring that
            all staff members comply with these Terms and use the Platform appropriately.
          </p>

          <h2>4. Acceptable use</h2>
          <p>You must not use the Platform to:</p>
          <ul>
            <li>Provide false, misleading, or fraudulent information</li>
            <li>Gain unauthorised access to any part of the Platform or its underlying systems</li>
            <li>Interfere with or disrupt the Platform's operation or infrastructure</li>
            <li>Duplicate, copy, scrape, or resell any part of the Platform without our express permission</li>
            <li>Use the Platform in any way that violates applicable UK law or regulation</li>
            <li>Process personal data of Guests outside the purpose of managing cloakroom operations</li>
          </ul>

          <h2>5. Guest passes</h2>
          <p>
            A Pass grants the holder the right to retrieve their deposited items from the cloakroom at the
            relevant Venue. The Pass remains valid until items are collected or until the event ends, whichever
            comes first.
          </p>
          <p>
            Cloak provides the Pass technology to Venues. The cloakroom service itself — including the safe
            custody of items — is the sole responsibility of the Venue, not Cloak. Any disputes about lost,
            damaged, or unreturned items must be directed to the Venue.
          </p>
          <p>
            Guests should keep their Pass code confidential. Cloak and Venues are not responsible for items
            collected by a third party who presents a valid Pass.
          </p>

          <h2>6. Venue obligations</h2>
          <p>By using the Platform, Venues agree to:</p>
          <ul>
            <li>
              Use the Platform only for legitimate cloakroom management at events and venues operated by them
            </li>
            <li>
              Treat Guest personal data only as described in our{" "}
              <a className="text-zinc-900 underline underline-offset-2" href="/privacy-policy">
                Privacy Policy
              </a>{" "}
              and in compliance with UK GDPR
            </li>
            <li>
              Not use Guest data for marketing or any purpose beyond operating the cloakroom service
            </li>
            <li>
              Ensure that cloakroom operations are conducted safely and in compliance with all applicable laws
            </li>
            <li>
              Promptly notify us of any suspected data breach or misuse of the Platform
            </li>
          </ul>

          <h2>7. Intellectual property</h2>
          <p>
            All content, software, trademarks, and materials on the Platform are owned by or licensed to Cloak.
            You may not reproduce, modify, distribute, or create derivative works from any part of the Platform
            without our prior written consent.
          </p>
          <p>
            Venue Users grant Cloak a limited licence to use venue names and logos solely to operate the Platform
            (for example, to display your venue name to Guests creating a Pass). We will not use your branding
            for any other purpose without your consent.
          </p>

          <h2>8. Availability and changes</h2>
          <p>
            We aim to keep the Platform available at all times but do not guarantee uninterrupted access. We may
            carry out scheduled or emergency maintenance that causes temporary downtime. We will provide reasonable
            notice of planned maintenance where possible.
          </p>
          <p>
            We reserve the right to modify or discontinue features of the Platform at any time. We will give
            Venue Users reasonable notice of material changes that affect their operations.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law:
          </p>
          <ul>
            <li>
              Cloak is not liable for any indirect, consequential, special, or incidental loss arising from your
              use of the Platform, including loss of revenue, data, or business opportunity.
            </li>
            <li>
              Cloak is not responsible for any loss, theft, or damage to items left in a venue's cloakroom. That
              responsibility rests solely with the Venue.
            </li>
            <li>
              Our total aggregate liability to any Venue User arising out of or in connection with these Terms
              shall not exceed the total fees paid by that Venue to Cloak in the 12 months preceding the claim.
            </li>
          </ul>
          <p>
            Nothing in these Terms limits our liability for death or personal injury caused by our negligence,
            fraud or fraudulent misrepresentation, or any other liability that cannot be excluded under
            English law.
          </p>

          <h2>10. Termination</h2>
          <p>
            Either party may terminate a Venue account at any time by giving written notice. We may suspend or
            terminate accounts immediately if we reasonably believe a serious breach of these Terms has occurred.
          </p>
          <p>
            On termination, your access to the Platform will cease. We will retain and then delete your data
            in accordance with our{" "}
            <a className="text-zinc-900 underline underline-offset-2" href="/privacy-policy">
              Privacy Policy
            </a>.
          </p>

          <h2>11. Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or
            your use of the Platform will be subject to the exclusive jurisdiction of the courts of England and
            Wales.
          </p>
          <p>
            If you have a complaint, please contact us first at{" "}
            <a className="text-zinc-900 underline underline-offset-2" href="mailto:support@cloakqr.com">
              support@cloakqr.com
            </a>{" "}
            and we will aim to resolve it within 14 working days.
          </p>

          <h2>12. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify Venue Users of material changes by email
            at least 14 days before they take effect. Continued use of the Platform after that date constitutes
            acceptance of the updated Terms. If you do not accept the changes, you should stop using the Platform
            and close your account.
          </p>

          <h2>13. Contact</h2>
          <p>
            For any questions about these Terms, please contact us at:{" "}
            <a className="text-zinc-900 underline underline-offset-2" href="mailto:support@cloakqr.com">
              support@cloakqr.com
            </a>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
