import { i18nSupported } from '@/common/constants/i18n.constants';

export function getEmailVerificationTemplate(
  verificationCodeUrl: string,
  lang: i18nSupported
): string {
  const link = `<a href="${verificationCodeUrl}" target="_blank">link</a>`;

  if (lang === i18nSupported.RO) {
    return `<div>
        <span>Salutare, <br> bine ai venit pe Immobilis!</span>
        <p>Verifica-ti email-ul folosind urmatorul ${link}.</p>
        <br>
        <span>Cu placere, <br> echipa Immobilis</span>
    </div>`;
  }

  return `<div>
    <span>Hi, <br> welcome to Immobilis!</span>
    <p>Verify your email address by using this ${link}.</p>
    <br>
    <span>Best regards, <br> the Immobilis team</span>
  </div>`;
}

export function getEmailVerificationSubjectTitle(lang: i18nSupported): string {
  if (lang === i18nSupported.RO) {
    return `Verifica-ti contul Immobilis`;
  }

  return `Verify your Immobolis Account`;
}
