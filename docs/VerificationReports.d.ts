// File generated from our OpenAPI spec
// Copied from reference; type contract for identity/verification. Used by verification.js stub (offline-only).

declare module 'stripe' {
  namespace Stripe {
    namespace Identity {
      /**
       * A VerificationReport is the result of an attempt to collect and verify data from a user.
       * The collection of verification checks performed is determined from the `type` and `options`
       * parameters used. You can find the result of each verification check performed in the
       * appropriate sub-resource: `document`, `id_number`, `selfie`.
       *
       * Each VerificationReport contains a copy of any data collected by the user as well as
       * reference IDs which can be used to access collected images through the [FileUpload](https://docs.stripe.com/api/files)
       * API. To configure and create VerificationReports, use the
       * [VerificationSession](https://docs.stripe.com/api/identity/verification_sessions) API.
       *
       * Related guide: [Accessing verification results](https://docs.stripe.com/identity/verification-sessions#results).
       */
      interface VerificationReport {
        /**
         * Unique identifier for the object.
         */
        id: string;

        /**
         * String representing the object's type. Objects of the same type share the same value.
         */
        object: 'identity.verification_report';

        /**
         * A string to reference this user. This can be a customer ID, a session ID, or similar, and can be used to reconcile this verification with your internal systems.
         */
        client_reference_id: string | null;

        /**
         * Time at which the object was created. Measured in seconds since the Unix epoch.
         */
        created: number;

        /**
         * Result from a document check
         */
        document?: VerificationReport.Document;

        /**
         * Result from a email check
         */
        email?: VerificationReport.Email;

        /**
         * Result from an id_number check
         */
        id_number?: VerificationReport.IdNumber;

        /**
         * Has the value `true` if the object exists in live mode or the value `false` if the object exists in test mode.
         */
        livemode: boolean;

        options?: VerificationReport.Options;

        /**
         * Result from a phone check
         */
        phone?: VerificationReport.Phone;

        /**
         * Result from a selfie check
         */
        selfie?: VerificationReport.Selfie;

        /**
         * Type of report.
         */
        type: VerificationReport.Type;

        /**
         * The configuration token of a verification flow from the dashboard.
         */
        verification_flow?: string;

        /**
         * ID of the VerificationSession that created this report.
         */
        verification_session: string | null;
      }

      namespace VerificationReport {
        interface Document {
          address: unknown | null;
          dob?: Document.Dob | null;
          error: Document.Error | null;
          expiration_date?: Document.ExpirationDate | null;
          files: Array<string> | null;
          first_name: string | null;
          issued_date: Document.IssuedDate | null;
          issuing_country: string | null;
          last_name: string | null;
          number?: string | null;
          sex?: Document.Sex | null;
          status: Document.Status;
          type: Document.Type | null;
          unparsed_place_of_birth?: string | null;
          unparsed_sex?: string | null;
        }

        namespace Document {
          interface Dob {
            day: number | null;
            month: number | null;
            year: number | null;
          }

          interface Error {
            code: Error.Code | null;
            reason: string | null;
          }

          namespace Error {
            type Code =
              | 'document_expired'
              | 'document_type_not_supported'
              | 'document_unverified_other';
          }

          interface ExpirationDate {
            day: number | null;
            month: number | null;
            year: number | null;
          }

          interface IssuedDate {
            day: number | null;
            month: number | null;
            year: number | null;
          }

          type Sex = '[redacted]' | 'female' | 'male' | 'unknown';

          type Status = 'unverified' | 'verified';

          type Type = 'driving_license' | 'id_card' | 'passport';
        }

        interface Email {
          email: string | null;
          error: Email.Error | null;
          status: Email.Status;
        }

        namespace Email {
          interface Error {
            code: Error.Code | null;
            reason: string | null;
          }

          namespace Error {
            type Code =
              | 'email_unverified_other'
              | 'email_verification_declined';
          }

          type Status = 'unverified' | 'verified';
        }

        interface IdNumber {
          dob?: IdNumber.Dob | null;
          error: IdNumber.Error | null;
          first_name: string | null;
          id_number?: string | null;
          id_number_type: IdNumber.IdNumberType | null;
          last_name: string | null;
          status: IdNumber.Status;
        }

        namespace IdNumber {
          interface Dob {
            day: number | null;
            month: number | null;
            year: number | null;
          }

          interface Error {
            code: Error.Code | null;
            reason: string | null;
          }

          namespace Error {
            type Code =
              | 'id_number_insufficient_document_data'
              | 'id_number_mismatch'
              | 'id_number_unverified_other';
          }

          type IdNumberType = 'br_cpf' | 'sg_nric' | 'us_ssn';

          type Status = 'unverified' | 'verified';
        }

        interface Options {
          document?: Options.Document;
          id_number?: Options.IdNumber;
        }

        namespace Options {
          interface Document {
            allowed_types?: Array<'driving_license' | 'id_card' | 'passport'>;
            require_id_number?: boolean;
            require_live_capture?: boolean;
            require_matching_selfie?: boolean;
          }

          interface IdNumber {}
        }

        interface Phone {
          error: Phone.Error | null;
          phone: string | null;
          status: Phone.Status;
        }

        namespace Phone {
          interface Error {
            code: Error.Code | null;
            reason: string | null;
          }

          namespace Error {
            type Code =
              | 'phone_unverified_other'
              | 'phone_verification_declined';
          }

          type Status = 'unverified' | 'verified';
        }

        interface Selfie {
          document: string | null;
          error: Selfie.Error | null;
          selfie: string | null;
          status: Selfie.Status;
        }

        namespace Selfie {
          interface Error {
            code: Error.Code | null;
            reason: string | null;
          }

          namespace Error {
            type Code =
              | 'selfie_document_missing_photo'
              | 'selfie_face_mismatch'
              | 'selfie_manipulated'
              | 'selfie_unverified_other';
          }

          type Status = 'unverified' | 'verified';
        }

        type Type = 'document' | 'id_number' | 'verification_flow';
      }
    }
  }
}
