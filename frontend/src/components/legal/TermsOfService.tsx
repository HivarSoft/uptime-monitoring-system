import { Box, Typography, Divider } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { ArrowBackRounded, GavelOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { T } from "../../theme/theme";

const LAST_UPDATED  = "August 2, 2026";
const APP_NAME      = "PulseWatch";
const COMPANY       = "HivarSoft";
const CONTACT_EMAIL = "hello@hivarsoft.com";
const APP_URL       = "https://pulsewatch.hivarsoft.com";

export default function TermsOfService() {
  const theme    = useTheme();
  const L        = theme.palette.mode === "light";
  const navigate = useNavigate();

  return (
    <Box sx={{ pt: 4, pb: 10, maxWidth: 780, mx: "auto" }}>
      {/* Back */}
      <Box
        onClick={() => navigate(-1)}
        sx={{
          display: "inline-flex", alignItems: "center", gap: 0.75,
          cursor: "pointer", mb: 4,
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
          transition: "color 0.15s",
        }}
      >
        <ArrowBackRounded sx={{ fontSize: 14 }} />
        <Typography variant="caption" fontWeight={500}>Back</Typography>
      </Box>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2, flexShrink: 0,
          background: `linear-gradient(135deg, ${alpha("#0891b2", L ? 0.12 : 0.22)}, ${alpha("#0891b2", L ? 0.06 : 0.1)})`,
          border: `1px solid ${alpha("#0891b2", L ? 0.18 : 0.28)}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <GavelOutlined sx={{ fontSize: 22, color: "#0891b2" }} />
        </Box>
        <Box>
          <Typography variant="h2" color="text.primary" gutterBottom>Terms of Service</Typography>
          <Typography variant="caption" color="text.disabled">
            Last updated: {LAST_UPDATED} · Effective immediately
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2.5, mb: 4, borderRadius: 2, backgroundColor: L ? alpha("#0891b2", 0.06) : alpha("#0891b2", 0.1), border: `1px solid ${alpha("#0891b2", 0.2)}` }}>
        <Typography variant="body2" color={L ? "#0369a1" : "#38bdf8"} sx={{ lineHeight: 1.7 }}>
          Please read these Terms of Service carefully before using {APP_NAME}. By creating an account
          or using the service you agree to be bound by these terms. If you do not agree, do not
          use {APP_NAME}.
        </Typography>
      </Box>

      <Section title="1. Acceptance of Terms">
        <P>
          These Terms of Service ("Terms") constitute a legally binding agreement between you
          ("User", "you") and {COMPANY} ("we", "us", "our") governing your use of the {APP_NAME}
          uptime monitoring service available at {APP_URL} and associated APIs.
        </P>
        <P>
          By accessing or using {APP_NAME} you confirm that you are at least 13 years old, have
          the legal capacity to enter into these Terms, and accept them on behalf of yourself or
          the organisation you represent.
        </P>
      </Section>

      <Section title="2. Description of Service">
        <P>
          {APP_NAME} is an uptime and performance monitoring platform that:
        </P>
        <ul>
          <Li>Periodically sends HTTP requests to URLs you configure</Li>
          <Li>Records response status, latency, and availability metrics</Li>
          <Li>Dispatches alerts via Email, Slack, Discord, Telegram, or webhook when configured
            thresholds are exceeded</Li>
          <Li>Presents historical uptime data and analytics through a web dashboard</Li>
        </ul>
        <P>
          The service is provided "as is". We reserve the right to modify, suspend, or discontinue
          any part of the service at any time with reasonable notice.
        </P>
      </Section>

      <Section title="3. Account Registration and Security">
        <P>
          You may only create an account using a Google or GitHub identity. You are responsible for:
        </P>
        <ul>
          <Li>Keeping your OAuth session secure and signing out of shared devices</Li>
          <Li>All activity that occurs under your account</Li>
          <Li>Notifying us immediately at{" "}<A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>{" "}
            if you suspect unauthorised access
          </Li>
        </ul>
        <P>
          We may suspend or terminate accounts that show signs of compromise or abuse without
          prior notice.
        </P>
      </Section>

      <Section title="4. Acceptable Use">
        <P>You agree to use {APP_NAME} only for lawful purposes. You must not:</P>
        <ul>
          <Li>Monitor URLs or services you do not own or are not authorised to test</Li>
          <Li>Use {APP_NAME} to conduct denial-of-service attacks or stress-test third-party services
            without their explicit consent
          </Li>
          <Li>Attempt to reverse-engineer, scrape, or abuse the {APP_NAME} API beyond your own account</Li>
          <Li>Introduce malware, spyware, or any malicious code</Li>
          <Li>Use the service in a way that violates any applicable local, national, or international law</Li>
          <Li>Resell, sublicense, or offer the service to third parties without written permission</Li>
        </ul>
        <P>
          We reserve the right to investigate and take action, including account termination, for
          any suspected violation of this section.
        </P>
      </Section>

      <Section title="5. Alert Channel Credentials">
        <P>
          You may provide third-party credentials (SMTP passwords, Slack webhook URLs, Telegram bot
          tokens, etc.) to configure alert channels. You are solely responsible for:
        </P>
        <ul>
          <Li>The security and scope of any credentials you store in {APP_NAME}</Li>
          <Li>Compliance with the terms of those third-party services</Li>
          <Li>Rotating or revoking credentials if you suspect they have been compromised</Li>
        </ul>
        <P>
          We store credentials with database-level encryption and access controls, but we recommend
          using least-privilege credentials (e.g. an SMTP account dedicated to alerts).
        </P>
      </Section>

      <Section title="6. Intellectual Property">
        <P>
          All content, design, software, and infrastructure of {APP_NAME} — excluding content you
          provide — are owned by or licensed to {COMPANY} and are protected by intellectual property
          laws. You may not copy, modify, distribute, sell, or lease any part of the service.
        </P>
        <P>
          You retain all rights to the data you upload or generate (service URLs, project names,
          monitoring data). By using {APP_NAME} you grant us a limited licence to process that data
          solely to provide the service.
        </P>
      </Section>

      <Section title="7. Availability and SLA">
        <P>
          We strive for high availability but do not guarantee any specific uptime percentage for
          the {APP_NAME} platform itself. Scheduled and unscheduled maintenance may temporarily
          interrupt monitoring.
        </P>
        <P>
          Monitoring checks depend on network connectivity, third-party infrastructure (MongoDB Atlas,
          Redis, DNS), and the availability of your monitored endpoints. We are not liable for
          missed checks caused by infrastructure outages outside our direct control.
        </P>
      </Section>

      <Section title="8. Disclaimer of Warranties">
        <P>
          {APP_NAME} is provided <strong>"as is"</strong> and <strong>"as available"</strong> without
          warranties of any kind, whether express or implied, including but not limited to implied
          warranties of merchantability, fitness for a particular purpose, or non-infringement.
        </P>
        <P>
          We do not warrant that the service will be uninterrupted, error-free, or that defects will
          be corrected. You use the service at your own risk.
        </P>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>
          To the fullest extent permitted by applicable law, {COMPANY} shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, including but not limited
          to loss of profits, data, or goodwill, arising out of or in connection with your use of
          {APP_NAME}, even if we have been advised of the possibility of such damages.
        </P>
        <P>
          Our total liability for any claim arising from these Terms or your use of {APP_NAME} shall
          not exceed the amount you paid to us in the 12 months preceding the claim, or USD 50,
          whichever is greater.
        </P>
      </Section>

      <Section title="10. Indemnification">
        <P>
          You agree to indemnify, defend, and hold harmless {COMPANY} and its officers, directors,
          employees, and agents from any claims, liabilities, damages, losses, or expenses
          (including legal fees) arising from:
        </P>
        <ul>
          <Li>Your violation of these Terms</Li>
          <Li>Your use of {APP_NAME} in a way that harms a third party</Li>
          <Li>Any content or data you submit through the service</Li>
        </ul>
      </Section>

      <Section title="11. Termination">
        <P>
          You may delete your account at any time from <strong>Settings → Delete Account</strong>.
          Upon deletion, your personal information and monitoring data will be removed within 30 days
          as described in our Privacy Policy.
        </P>
        <P>
          We may suspend or terminate your account immediately and without notice if you breach these
          Terms, engage in fraudulent or illegal activity, or if required by law.
        </P>
      </Section>

      <Section title="12. Changes to These Terms">
        <P>
          We may revise these Terms at any time. The "Last updated" date will reflect the most
          recent revision. For material changes, we will provide at least 14 days' advance notice
          via email or an in-app notification. Continued use of {APP_NAME} after the effective date
          constitutes acceptance of the revised Terms.
        </P>
      </Section>

      <Section title="13. Governing Law and Disputes">
        <P>
          These Terms are governed by and construed in accordance with applicable law, without regard
          to its conflict of law provisions. Any dispute arising from these Terms shall first be
          subject to good-faith negotiation. If unresolved, disputes shall be submitted to binding
          arbitration.
        </P>
      </Section>

      <Section title="14. Contact" last>
        <P>
          Questions about these Terms? Contact us:
        </P>
        <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: L ? T.n50 : alpha("#fff", 0.03), border: `1px solid ${theme.palette.divider}`, mt: 1 }}>
          <Typography variant="body2" color="text.primary" fontWeight={600}>{COMPANY}</Typography>
          <Typography variant="body2" color="text.secondary">
            Email: <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Website: <A href={APP_URL}>{APP_URL}</A>
          </Typography>
        </Box>
      </Section>
    </Box>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  const theme = useTheme();
  return (
    <Box sx={{ mb: last ? 0 : 5 }}>
      <Typography variant="h3" color="text.primary" sx={{ mb: 2 }}>{title}</Typography>
      {children}
      {!last && <Divider sx={{ mt: 4, borderColor: theme.palette.divider }} />}
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.8 }}>
      {children}
    </Typography>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <Box component="li" sx={{ mb: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
        {children}
      </Typography>
    </Box>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Box
      component="a"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      sx={{ color: "#0891b2", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
    >
      {children}
    </Box>
  );
}
